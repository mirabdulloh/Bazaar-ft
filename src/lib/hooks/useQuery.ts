import { useEffect } from 'react';
import { useQuery as useApolloQuery, DocumentNode, OperationVariables } from '@apollo/client';
import { T } from '../types/common';

interface UseQueryOptions {
	fetchPolicy?: string;
	variables?: OperationVariables;
	notifyOnNetworkStatusChange?: boolean;
	skip?: boolean;
	onCompleted?: (data: T) => void;
	onError?: (error: T) => void;
}

export function useQuery(query: DocumentNode, options: UseQueryOptions = {}) {
	const { onCompleted, onError, ...apolloOptions } = options;

	const result = useApolloQuery(query, apolloOptions as any);

	useEffect(() => {
		if (result.data && onCompleted) {
			onCompleted(result.data);
		}
	}, [result.data]);

	useEffect(() => {
		if (result.error && onError) {
			onError(result.error);
		}
	}, [result.error]);

	return result;
}
