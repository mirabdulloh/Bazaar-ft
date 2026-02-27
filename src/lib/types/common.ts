export type T = Record<string, any>;

export enum Message {
	NOT_AUTHENTICATED = 'You must be logged in to perform this action.',
	SOMETHING_WENT_WRONG = 'Something went wrong. Please try again.',
	NO_DATA_FOUND = 'No data found.',
	NETWORK_ERROR = 'Network error. Please check your connection.',
}
