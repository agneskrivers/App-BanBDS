import React, { FunctionComponent } from 'react';
import { NativeBaseProvider } from 'native-base';
import { NavigationContainer } from '@react-navigation/native';

// Context
import Context from '@context';

// Navigation
import Stack from '@navigation/Stack';

// Theme
import theme from './theme';

const Index: FunctionComponent = () => {
	return (
		<NativeBaseProvider theme={theme}>
			<NavigationContainer>
				<Context>
					<Stack />
				</Context>
			</NavigationContainer>
		</NativeBaseProvider>
	);
};

export default Index;
