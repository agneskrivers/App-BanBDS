import React, { FunctionComponent, useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Context
import { Context } from '@context';

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
	ProfileScreen,
} from '@screens';

// Interfaces
import type { IStackParams } from '@interfaces';

const Stack = createStackNavigator<IStackParams>();

const Index: FunctionComponent = () => {
	// Hooks
	const { user } = useContext(Context);

	return (
		<Stack.Navigator
			initialRouteName="Root"
			screenOptions={{ headerShown: false }}
		>
			{user && (
				<>
					<Stack.Screen name="MyPosts" component={MyPostsScreen} />
					<Stack.Screen name="MyPost" component={MyPostScreen} />
					<Stack.Screen name="EditPost" component={EditPostScreen} />
					<Stack.Screen name="Profile" component={ProfileScreen} />
				</>
			)}
			<Stack.Screen name="Root" component={Root} />
			<Stack.Screen name="Login" component={LoginScreen} />
			<Stack.Screen name="Confirm" component={ConfirmScreen} />
			<Stack.Screen name="User" component={UserScreen} />
			<Stack.Screen name="Project" component={ProjectScreen} />
			<Stack.Screen name="Form" component={FormScreen} />
			<Stack.Screen name="Posts" component={PostsScreen} />
			<Stack.Screen name="Post" component={PostScreen} />
			<Stack.Screen name="NewsInfo" component={NewsInfoScreen} />
		</Stack.Navigator>
	);
};

export default Index;
