import React, { FunctionComponent } from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Navigation
import Root from '@navigation/BottomTab';

// Screens
import {
	LoginScreen,
	ConfirmScreen,
	UserScreen,
	ProjectScreen,
	FormScreen,
	PostsScreen,
	NewsInfoScreen,
	MyPostsScreen,
	MyPostScreen,
	PostScreen,
	EditPostScreen,
} from '@screens';

// Interfaces
import type { IStackParams } from '@interfaces';

const Stack = createStackNavigator<IStackParams>();

const Index: FunctionComponent = () => {
	return (
		<Stack.Navigator
			initialRouteName="Root"
			screenOptions={{ headerShown: false }}
		>
			<Stack.Screen name="Root" component={Root} />
			<Stack.Screen name="Login" component={LoginScreen} />
			<Stack.Screen name="Confirm" component={ConfirmScreen} />
			<Stack.Screen name="User" component={UserScreen} />
			<Stack.Screen name="Project" component={ProjectScreen} />
			<Stack.Screen name="Form" component={FormScreen} />
			<Stack.Screen name="Posts" component={PostsScreen} />
			<Stack.Screen name="NewsInfo" component={NewsInfoScreen} />
			<Stack.Screen name="MyPosts" component={MyPostsScreen} />
			<Stack.Screen name="Post" component={PostScreen} />
			<Stack.Screen name="MyPost" component={MyPostScreen} />
			<Stack.Screen name="EditPost" component={EditPostScreen} />
		</Stack.Navigator>
	);
};

export default Index;
