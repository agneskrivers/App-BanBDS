import React, { FunctionComponent } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Components
import { FooterComponent } from '@components';

// Screens
import {
	HomeScreen,
	NewsScreen,
	ZoningScreen,
	AccountScreen,
	ProjectsScreen,
} from '@screens';

// Interfaces
import type { IBottomTabParams } from '@interfaces';

const BottomTab = createBottomTabNavigator<IBottomTabParams>();

const Index: FunctionComponent = () => {
	return (
		<BottomTab.Navigator
			initialRouteName="Home"
			screenOptions={{ headerShown: false }}
			tabBar={props => <FooterComponent {...props} />}
			backBehavior="initialRoute"
		>
			<BottomTab.Screen name="Home" component={HomeScreen} />
			<BottomTab.Screen name="News" component={NewsScreen} />
			<BottomTab.Screen name="Zoning" component={ZoningScreen} />
			<BottomTab.Screen name="Account" component={AccountScreen} />
			<BottomTab.Screen name="Projects" component={ProjectsScreen} />
		</BottomTab.Navigator>
	);
};

export default Index;
