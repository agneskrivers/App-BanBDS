import React, { FunctionComponent } from 'react';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Box, HStack } from 'native-base';

import Item from './Item';

// Configs
import { BottomTabRouters } from '@configs';

const Index: FunctionComponent<BottomTabBarProps> = ({ navigation }) => {
	const routerNames = Object.keys(BottomTabRouters) as Array<
		keyof typeof BottomTabRouters
	>;
	const routerName =
		navigation.getState().routes[navigation.getState().index].name;

	if (routerName === 'Form') return null;

	return (
		<Box bg="black" width="100%" alignSelf="center">
			<HStack bg="white" alignItems="center" safeAreaBottom shadow={6}>
				{routerNames.map((route, index) => (
					<Item
						navigation={navigation}
						name={route}
						title={BottomTabRouters[route].title}
						iconSelected={BottomTabRouters[route].selected}
						iconDefault={BottomTabRouters[route].default}
						key={index}
					/>
				))}
			</HStack>
		</Box>
	);
};

export default Index;
