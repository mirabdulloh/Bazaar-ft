import { useMemo } from 'react';
import { Observable, ApolloClient, HttpLink, InMemoryCache, CombinedGraphQLErrors } from '@apollo/client';
import type { FetchResult } from '@apollo/client';
import { ApolloLink } from '@apollo/client/link';
import { ErrorLink } from '@apollo/client/link/error';
import { getJwtToken, getRefreshToken, setJwtToken, setRefreshToken } from '../src/lib/auth';
import { setUserFromMemberData } from '../src/lib/auth';
import { sweetErrorAlert } from '../src/lib/sweetAlert';
import { jwtDecode } from 'jwt-decode';

let apolloClient: ApolloClient;
let refreshPromise: Promise<string> | null = null;

type JwtPayload = { exp?: number };

function isRefreshFailureMessage(message?: string): boolean {
	const lower = message?.toLowerCase() ?? '';
	return (
		lower.includes('missing refresh token') ||
		lower.includes('refresh failed') ||
		lower.includes('invalid refresh token') ||
		lower.includes('jwt expired') ||
		lower.includes('token expired') ||
		lower.includes('not authenticated') ||
		lower.includes('unauthorized')
	);
}

function getHeaders() {
	const headers = {} as HeadersInit;
	const token = getJwtToken();
	// @ts-expect-error - HeadersInit index type depends on runtime implementation
	if (token) headers['Authorization'] = `Bearer ${token}`;
	return headers;
}

function isTokenExpiringSoon(token?: string, skewMs = 30_000): boolean {
	if (!token) return true;
	try {
		const payload = jwtDecode<JwtPayload>(token);
		if (!payload.exp) return true;
		return payload.exp * 1000 <= Date.now() + skewMs;
	} catch {
		return true;
	}
}

async function performRefresh(): Promise<string> {
	if (refreshPromise) return refreshPromise;

	refreshPromise = (async () => {
		const refreshToken = getRefreshToken();
		if (!refreshToken) throw new Error('Missing refresh token');

		const response = await fetch(process.env.NEXT_PUBLIC_API_GRAPHQL_URL!, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				query: `mutation RefreshToken($refreshToken: String!) {
					refreshToken(refreshToken: $refreshToken) {
						_id memberType memberStatus memberAuthType memberPhone memberNick
						memberFullName memberEmail memberImage memberAddress memberDesc
						memberArticles memberFollowers memberFollowings memberPoints
						memberLikes memberViews memberComments memberRank memberWarnings
						memberBlocks memberProducts accessToken refreshToken
					}
				}`,
				variables: { refreshToken },
			}),
		});

		const json = await response.json();
		if (json?.errors?.length) {
			throw new Error(json.errors[0]?.message || 'Refresh failed');
		}

		const data = json?.data?.refreshToken;
		if (!data?.accessToken) {
			throw new Error('Refresh failed');
		}

		setJwtToken(data.accessToken);
		if (data.refreshToken) setRefreshToken(data.refreshToken);
		setUserFromMemberData(data);
		return data.accessToken;
	})();

	try {
		return await refreshPromise;
	} finally {
		refreshPromise = null;
	}
}

function createIsomorphicLink(): ApolloLink {
	if (typeof window === 'undefined') {
		// SSR: plain HTTP, no auth
		return new HttpLink({ uri: process.env.NEXT_PUBLIC_API_GRAPHQL_URL });
	}

	const silentLogout = () => {
		setRefreshToken('');
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
		localStorage.removeItem('memberData');
		sessionStorage.removeItem('refreshToken');
		localStorage.setItem('logout', Date.now().toString());
		window.location.replace('/');
	};

	const authLink = new ApolloLink((operation, forward) => {
		return new Observable<FetchResult>((observer) => {
			let subscription: { unsubscribe: () => void } | null = null;
			let cancelled = false;

			(async () => {
				const currentToken = getJwtToken();
				const refreshToken = getRefreshToken();
				let authToken = currentToken;

				if ((currentToken && isTokenExpiringSoon(currentToken)) || (!currentToken && refreshToken)) {
					authToken = await performRefresh();
				}

				operation.setContext(({ headers = {} }) => ({
					headers: authToken ? { ...headers, Authorization: `Bearer ${authToken}` } : { ...headers },
				}));

				if (cancelled) return;
				subscription = forward(operation).subscribe(observer);
			})().catch((err) => {
				if (isRefreshFailureMessage(err?.message)) {
					silentLogout();
					return;
				}
				if (!cancelled) observer.error(err);
			});

			return () => {
				cancelled = true;
				subscription?.unsubscribe();
			};
		});
	});

	const httpLink = new HttpLink({
		uri: process.env.NEXT_PUBLIC_API_GRAPHQL_URL,
	});

	const errorLink = new ErrorLink(({ error, operation, forward }) => {
		if (CombinedGraphQLErrors.is(error)) {
			const isAuthError = error.errors.some(({ message }) => {
				const lower = message.toLowerCase();
				return (
					lower.includes('unauthorized') ||
					lower.includes('jwt expired') ||
					lower.includes('token expired') ||
					lower.includes('bearer token is not provided') ||
					lower.includes('not authenticated') ||
					lower.includes('invalid token') ||
					lower.includes('jwt malformed')
				);
			});

			if (isAuthError) {
				const refreshToken = getRefreshToken();

				// No refresh token → can't refresh, logout
				if (!refreshToken) {
					silentLogout();
					return;
				}

				// Use a plain fetch to call refreshToken mutation (avoids going through this error link again)
				return new Observable<FetchResult>((observer) => {
					performRefresh()
						.then((accessToken) => {
							operation.setContext(({ headers = {} }: { headers: Record<string, string> }) => ({
								headers: { ...headers, Authorization: `Bearer ${accessToken}` },
							}));
							forward(operation).subscribe(observer);
						})
						.catch(() => {
							silentLogout();
						});
				});
			}

			// Non-auth errors — show alert
			error.errors.forEach(({ message }) => {
				const lower = message.toLowerCase();
				if (!lower.includes('input') && !lower.includes('no data found')) sweetErrorAlert(message);
			});
		} else {
			console.log(`[Network error]: ${error}`);
		}
	});

	return ApolloLink.from([errorLink, authLink.concat(httpLink)]);
}

function createApolloClient() {
	return new ApolloClient({
		ssrMode: typeof window === 'undefined',
		link: createIsomorphicLink(),
		cache: new InMemoryCache({
			// MongoDB uses _id — tell Apollo to use it as the cache key for all types
			typePolicies: {
				Member: { keyFields: ['_id'] },
				Product: { keyFields: ['_id'] },
				Brand: { keyFields: ['_id'] },
				Category: { keyFields: ['_id'] },
				Order: { keyFields: ['_id'] },
				OrderItem: { keyFields: ['_id'] },
				Review: { keyFields: ['_id'] },
				Address: { keyFields: ['_id'] },
				Notification: { keyFields: ['_id'] },
				Follow: { keyFields: ['_id'] },
				BoardArticle: { keyFields: ['_id'] },
				Comment: { keyFields: ['_id'] },
				Coupon: { keyFields: ['_id'] },
				Message: { keyFields: ['_id'] },
				Chat: { keyFields: ['_id'] },
				FAQ: { keyFields: ['_id'] },
			},
		}),
	});
}

export function initializeApollo(initialState = null) {
	const _apolloClient = apolloClient ?? createApolloClient();
	if (initialState) _apolloClient.cache.restore(initialState);
	if (typeof window === 'undefined') return _apolloClient;
	if (!apolloClient) apolloClient = _apolloClient;
	return _apolloClient;
}

export function useApollo(initialState: any) {
	return useMemo(() => initializeApollo(initialState), [initialState]);
}
