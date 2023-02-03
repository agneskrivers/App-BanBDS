import React, { FunctionComponent, useContext } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Pressable, Center, Text, Image, Icon, Box } from 'native-base';
import type { BottomTabNavigationEventMap } from '@react-navigation/bottom-tabs';
import type {
	ParamListBase,
	NavigationHelpers,
} from '@react-navigation/native';

// Assets
import LocationPNG from '@assets/images/location.png';

// Context
import { Context } from '@context';

// Interfaces
import type { IBottomTabNames } from '@interfaces';

// Props
interface Props {
	name: IBottomTabNames | 'Form';
	title: string;
	iconDefault: string;
	iconSelected: string;
	navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
}

const Index: FunctionComponent<Props> = props => {
	// Props
	const { iconDefault, iconSelected, name, navigation, title } = props;

	const stateNavigation = navigation.getState();
	const routeName = stateNavigation.routes[stateNavigation.index].name;

	// Hooks
	const { user } = useContext(Context);

	// Handles
	const handlePress = () => {
		if ((name === 'Form' || name === 'Account') && !user)
			return navigation.navigate('Login');

		if (name === 'Form')
			return navigation.navigate('Form', { isRequest: false });

		return navigation.navigate(name);
	};

	// Validator
	const icon = routeName === name ? iconSelected : iconDefault;
	const opacity = routeName === name ? 1 : 0.5;
	const color = routeName === name ? 'blue.600' : 'coolGray.400';

	if (name === 'Form')
		return (
			<Pressable
				alignItems="center"
				justifyContent="center"
				py={2}
				mx={5}
				flex={1}
				onPress={handlePress}
			>
				<Center>
					<Image
						source={LocationPNG}
						alt="Create Product Image"
						size={55}
						position="absolute"
						top={-33}
					/>
					<Text
						opacity={opacity}
						mt={6}
						color={color}
						fontSize={10}
						fontWeight="bold"
					>
						{title}
					</Text>
				</Center>
			</Pressable>
		);

	return (
		<Pressable py={2} flex={1} onPress={handlePress}>
			<Center>
				<Box
					position="relative"
					alignItems="center"
					justifyContent="center"
				>
					<Icon
						as={MaterialCommunityIcons}
						name={icon}
						color={color}
						size="lg"
						opacity={opacity}
					/>
				</Box>
				<Text
					color={color}
					fontSize={10}
					fontWeight="bold"
					opacity={opacity}
				>
					{title}
				</Text>
			</Center>
		</Pressable>
	);
};

export default Index;
