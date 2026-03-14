'use client';

import { ApolloProvider } from '@apollo/client/react';
import { ReactNode } from 'react';
import { initializeApollo } from '../../apollo/client';
import AuthBootstrap from './AuthBootstrap';

const client = initializeApollo();

export default function ApolloWrapper({ children }: { children: ReactNode }) {
	return (
		<ApolloProvider client={client}>
			<AuthBootstrap />
			{children}
		</ApolloProvider>
	);
}
