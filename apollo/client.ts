import { useMemo } from 'react';
import { ApolloClient, HttpLink, InMemoryCache, CombinedGraphQLErrors } from '@apollo/client';
import { ApolloLink } from '@apollo/client/link';
import { ErrorLink } from '@apollo/client/link/error';
import { getJwtToken } from '../src/lib/auth';
import { sweetErrorAlert } from '../src/lib/sweetAlert';

let apolloClient: ApolloClient;

function getHeaders() {
	const headers = {} as HeadersInit;
	const token = getJwtToken();
	// @ts-ignore
	if (token) headers['Authorization'] = `Bearer ${token}`;
	return headers;
}

function createIsomorphicLink(): ApolloLink {
	if (typeof window === 'undefined') {
		// SSR: plain HTTP, no auth
		return new HttpLink({ uri: process.env.NEXT_PUBLIC_API_GRAPHQL_URL });
	}

	const authLink = new ApolloLink((operation, forward) => {
		operation.setContext(({ headers = {} }) => ({
			headers: { ...headers, ...getHeaders() },
		}));
		return forward(operation);
	});

	const httpLink = new HttpLink({
		uri: process.env.NEXT_PUBLIC_API_GRAPHQL_URL,
	});

	const errorLink = new ErrorLink(({ error }) => {
		if (CombinedGraphQLErrors.is(error)) {
			error.errors.forEach(({ message, locations, path }) => {
				console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
				if (!message.includes('input')) sweetErrorAlert(message);
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
		cache: new InMemoryCache(),
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
