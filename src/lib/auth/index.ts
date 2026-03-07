import { jwtDecode } from 'jwt-decode';
import { initializeApollo } from '../../../apollo/client';
import { userVar } from '../../../apollo/store';
import { CustomJwtPayload } from '../types/customJwtPayload';
import { sweetTopSmallErrorAlert } from '../sweetAlert';
import { LOGIN, SIGN_UP } from '../../../apollo/user/mutation';

export function getJwtToken(): any {
	if (typeof window !== 'undefined') {
		return localStorage.getItem('accessToken') ?? '';
	}
}

export function setJwtToken(token: string) {
	localStorage.setItem('accessToken', token);
}

export function getRefreshToken(): string {
	if (typeof window !== 'undefined') {
		return localStorage.getItem('refreshToken') ?? '';
	}
	return '';
}

export function setRefreshToken(token: string) {
	localStorage.setItem('refreshToken', token);
}

export const logIn = async (nick: string, password: string): Promise<void> => {
	const { jwtToken, memberData } = await requestJwtToken({ nick, password });

	if (jwtToken) {
		updateStorage({ jwtToken });
		setUserFromMemberData(memberData);
	}
};

const requestJwtToken = async ({
	nick,
	password,
}: {
	nick: string;
	password: string;
}): Promise<{ jwtToken: string; memberData: any }> => {
	const apolloClient = initializeApollo();

	try {
		const result = await apolloClient.mutate({
			mutation: LOGIN,
			variables: { input: { memberNick: nick, memberPassword: password } },
			fetchPolicy: 'network-only',
		});

		const loginData = (result?.data as any)?.login;
		if (loginData.refreshToken) setRefreshToken(loginData.refreshToken);
		return { jwtToken: loginData.accessToken, memberData: loginData };
	} catch (err: any) {
		const msg = err.graphQLErrors?.[0]?.message ?? err.message ?? '';
		console.log('login error:', msg);

		if (msg.includes('No member with that member nick')) {
			await sweetTopSmallErrorAlert('No member found with that nickname', 3500);
		} else if (msg.includes('Wrong password')) {
			await sweetTopSmallErrorAlert('Wrong password, please try again', 3500);
		} else if (msg.includes('login and password do not match')) {
			await sweetTopSmallErrorAlert('Nickname and password do not match', 3500);
		} else if (msg.includes('blocked')) {
			await sweetTopSmallErrorAlert('Your account has been blocked', 4000);
		} else if (msg.includes('verify your email')) {
			await sweetTopSmallErrorAlert('Please verify your email before logging in', 4000);
		} else {
			await sweetTopSmallErrorAlert(msg || 'Login failed. Please try again.', 3500);
		}
		throw err;
	}
};

export const signUp = async (nick: string, password: string, phone: string, type: string): Promise<void> => {
	const { jwtToken, memberData } = await requestSignUpJwtToken({ nick, password, phone, type });

	if (jwtToken) {
		updateStorage({ jwtToken });
		setUserFromMemberData(memberData);
	}
};

const requestSignUpJwtToken = async ({
	nick,
	password,
	phone,
	type,
}: {
	nick: string;
	password: string;
	phone: string;
	type: string;
}): Promise<{ jwtToken: string; memberData: any }> => {
	const apolloClient = initializeApollo();

	try {
		const result = await apolloClient.mutate({
			mutation: SIGN_UP,
			variables: {
				input: { memberNick: nick, memberPassword: password, memberPhone: phone, memberType: type },
			},
			fetchPolicy: 'network-only',
		});

		const signupData = (result?.data as any)?.signup;
		if (signupData.refreshToken) setRefreshToken(signupData.refreshToken);
		return { jwtToken: signupData.accessToken, memberData: signupData };
	} catch (err: any) {
		const msg = err.graphQLErrors?.[0]?.message ?? err.message ?? '';
		console.log('signup error:', msg);

		if (msg.includes('Used Member Nick or Phone')) {
			await sweetTopSmallErrorAlert('This nickname or phone number is already in use', 3500);
		} else if (msg.includes('blocked')) {
			await sweetTopSmallErrorAlert('Your account has been blocked', 4000);
		} else {
			await sweetTopSmallErrorAlert(msg || 'Sign up failed. Please try again.', 3500);
		}
		throw err;
	}
};

// Populate userVar from the full mutation response (LOGIN / SIGN_UP / UPDATE_MEMBER).
// This is preferred over updateUserInfo(jwt) because the JWT only carries 4 fields.
export const setUserFromMemberData = (member: any) => {
	if (!member) return;
	const base = process.env.NEXT_PUBLIC_API_URL ?? '';
	const resolveImage = (img: string | undefined | null, nick: string) => {
		if (img) {
			if (img.startsWith('http://') || img.startsWith('https://')) return img;
			return `${base}/${img}`;
		}
		return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(nick || 'User')}&backgroundColor=6366f1&textColor=ffffff`;
	};
	const resolved: any = {
		_id: member._id ?? '',
		memberType: member.memberType ?? '',
		memberStatus: member.memberStatus ?? '',
		memberAuthType: member.memberAuthType ?? '',
		memberPhone: member.memberPhone ?? '',
		memberNick: member.memberNick ?? '',
		memberFullName: member.memberFullName ?? '',
		memberImage: resolveImage(member.memberImage, member.memberNick),
		memberAddress: member.memberAddress ?? '',
		memberDesc: member.memberDesc ?? '',
		memberProperties: member.memberProducts ?? 0,
		memberRank: member.memberRank ?? 0,
		memberArticles: member.memberArticles ?? 0,
		memberPoints: member.memberPoints ?? 0,
		memberLikes: member.memberLikes ?? 0,
		memberViews: member.memberViews ?? 0,
		memberWarnings: member.memberWarnings ?? 0,
		memberBlocks: member.memberBlocks ?? 0,
	};
	// Persist so page refresh can restore full user data (memberImage etc.)
	localStorage.setItem('memberData', JSON.stringify(resolved));
	userVar(resolved);
};

export const updateStorage = ({ jwtToken }: { jwtToken: any }) => {
	setJwtToken(jwtToken);
	window.localStorage.setItem('login', Date.now().toString());
};

export const updateUserInfo = (jwtToken: any) => {
	if (!jwtToken) return false;

	const claims = jwtDecode<CustomJwtPayload>(jwtToken);
	const prev = userVar();
	userVar({
		_id: claims._id ?? prev._id ?? '',
		memberType: claims.memberType ?? prev.memberType ?? '',
		memberStatus: claims.memberStatus ?? prev.memberStatus ?? '',
		memberAuthType: claims.memberAuthType ?? prev.memberAuthType ?? '',
		memberPhone: claims.memberPhone ?? prev.memberPhone ?? '',
		memberNick: claims.memberNick ?? prev.memberNick ?? '',
		memberFullName: claims.memberFullName ?? prev.memberFullName ?? '',
		memberImage: (() => {
			const img = claims.memberImage;
			if (img) {
				if (img.startsWith('http://') || img.startsWith('https://')) return img;
				const base = process.env.NEXT_PUBLIC_API_URL ?? '';
				return `${base}/${img}`;
			}
			// Preserve existing image if JWT doesn't include it
			return prev.memberImage || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(claims.memberNick ?? prev.memberNick ?? 'User')}&backgroundColor=6366f1&textColor=ffffff`;
		})(),
		memberAddress: claims.memberAddress ?? prev.memberAddress ?? '',
		memberDesc: claims.memberDesc ?? prev.memberDesc ?? '',
		memberProperties: claims.memberProperties ?? prev.memberProperties ?? 0,
		memberRank: claims.memberRank ?? prev.memberRank ?? 0,
		memberArticles: claims.memberArticles ?? prev.memberArticles ?? 0,
		memberPoints: claims.memberPoints ?? prev.memberPoints ?? 0,
		memberLikes: claims.memberLikes ?? prev.memberLikes ?? 0,
		memberViews: claims.memberViews ?? prev.memberViews ?? 0,
		memberWarnings: claims.memberWarnings ?? prev.memberWarnings ?? 0,
		memberBlocks: claims.memberBlocks ?? prev.memberBlocks ?? 0,
	});
};

export const logOut = () => {
	deleteStorage();
	deleteUserInfo();
	window.location.replace('/');
};

const deleteStorage = () => {
	localStorage.removeItem('accessToken');
	localStorage.removeItem('refreshToken');
	localStorage.removeItem('memberData');
	window.localStorage.setItem('logout', Date.now().toString());
};

const deleteUserInfo = () => {
	userVar({
		_id: '',
		memberType: '',
		memberStatus: '',
		memberAuthType: '',
		memberPhone: '',
		memberNick: '',
		memberFullName: '',
		memberImage: '',
		memberAddress: '',
		memberDesc: '',
		memberProperties: 0,
		memberRank: 0,
		memberArticles: 0,
		memberPoints: 0,
		memberLikes: 0,
		memberViews: 0,
		memberWarnings: 0,
		memberBlocks: 0,
	});
};
