import { useEffect, useRef } from "react";
import { useQuery as useApolloQuery } from "@apollo/client/react";
import type { DocumentNode } from "graphql";
import { T } from "../types/common";

type QueryVariables = Record<string, any>;
type QueryCompletedHandler<TData> = (data: TData) => void;
type QueryErrorHandler = (error: T) => void;

interface UseQueryOptions<TData = T, TVariables extends QueryVariables = QueryVariables> {
  fetchPolicy?: string;
  variables?: TVariables;
  notifyOnNetworkStatusChange?: boolean;
  skip?: boolean;
  onCompleted?: QueryCompletedHandler<TData>;
  onError?: QueryErrorHandler;
}

export function useQuery<TData = T, TVariables extends QueryVariables = QueryVariables>(
  query: DocumentNode,
  options: UseQueryOptions<TData, TVariables> = {}
) {
  const { onCompleted, onError, ...apolloOptions } = options;
  const onCompletedRef = useRef<QueryCompletedHandler<TData> | undefined>(onCompleted);
  const onErrorRef = useRef<QueryErrorHandler | undefined>(onError);

  const result = useApolloQuery<TData, TVariables>(query, apolloOptions as any);

  useEffect(() => {
    onCompletedRef.current = onCompleted;
    onErrorRef.current = onError;
  }, [onCompleted, onError]);

  useEffect(() => {
    const completedData = result.data as TData | undefined;

    if (completedData !== undefined && onCompletedRef.current) {
      onCompletedRef.current(completedData);
    }
  }, [result.data]);

  useEffect(() => {
    if (result.error && onErrorRef.current) {
      onErrorRef.current(result.error as T);
    }
  }, [result.error]);

  return result;
}
