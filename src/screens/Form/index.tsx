import React, { FunctionComponent, useState, useContext } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
	StyleSheet,
	Platform,
	TouchableWithoutFeedback,
	Keyboard,
} from 'react-native';
import {
	ScrollView,
	HStack,
	Box,
	Text,
	Icon,
	Image,
	Center,
	Button,
	Pressable,
	KeyboardAvoidingView,
} from 'native-base';

// Assets
import Background from '@assets/images/bg.png';
import LogoLight from '@assets/images/logo-light.png';

// Components
import { FormComponent } from '@components';

// Interfaces
import type { ICompositeNavigationStacks, IStackParams } from '@interfaces';

// Type
type FormType = 'sell' | 'rent' | 'request';

// Props
interface Props {
	navigation: ICompositeNavigationStacks<'Form'>;
	route: RouteProp<IStackParams, 'Form'>;
}

const Index: FunctionComponent<Props> = () => {
	// States
	const [type, setType] = useState<FormType>('sell');

	// Hooks
	const insets = useSafeAreaInsets();

	// Handles
	const handlePressFormType = (value: FormType) => setType(value);

	return (
		<KeyboardAvoidingView
			flex={1}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<ScrollView
					showsHorizontalScrollIndicator={false}
					showsVerticalScrollIndicator={false}
					bg="white"
				>
					<Image
						source={Background}
						height={insets.top + 50}
						alt="Create Product Background"
					/>
					<Center mt={-50} position="relative">
						<Image
							source={LogoLight}
							height={8}
							alt="logo"
							style={{ aspectRatio: 226 / 50 }}
						/>
						<Pressable position="absolute" left={5}>
							<Icon
								as={MaterialCommunityIcons}
								name="arrow-left"
								size={7}
								color="white"
							/>
						</Pressable>
					</Center>
					<Box px={4} mt={4}>
						<Text
							textAlign="center"
							fontWeight="bold"
							color="dark.300"
							fontSize="2xl"
							py={4}
						>
							Đăng Tin
						</Text>
						<HStack>
							<Button
								style={[
									styles.buttonType,
									styles.buttonTypeLeft,
									type === 'sell'
										? styles.buttonTypeActive
										: null,
								]}
								onPress={() => handlePressFormType('sell')}
							>
								<Text
									style={[
										styles.textType,
										type === 'sell'
											? styles.textTypeActive
											: null,
									]}
								>
									Mua Bán
								</Text>
							</Button>
							<Button
								style={[
									styles.buttonType,
									type === 'rent'
										? styles.buttonTypeActive
										: null,
								]}
								onPress={() => handlePressFormType('rent')}
							>
								<Text
									style={[
										styles.textType,
										type === 'rent'
											? styles.textTypeActive
											: null,
									]}
								>
									Cho Thuê
								</Text>
							</Button>
							<Button
								style={[
									styles.buttonType,
									styles.buttonTypeRight,
									type === 'request'
										? styles.buttonTypeActive
										: null,
								]}
								onPress={() => handlePressFormType('request')}
							>
								<Text
									style={[
										styles.textType,
										type === 'request'
											? styles.textTypeActive
											: null,
									]}
								>
									Cần Mua
								</Text>
							</Button>
						</HStack>
					</Box>
					<Box mt={4} px={4} safeAreaBottom>
						<FormComponent.Request />
					</Box>
				</ScrollView>
			</TouchableWithoutFeedback>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	buttonType: {
		borderRadius: 0,
		borderWidth: 1,
		borderStyle: 'solid',
		backgroundColor: '#ffffff',
		borderColor: '#cccccc',
		flex: 1,
	},
	textType: {
		color: '#999',
		fontSize: 13,
		fontWeight: '600',
	},
	buttonTypeLeft: {
		borderBottomStartRadius: 5,
		borderTopStartRadius: 5,
		borderRightWidth: 0,
	},
	buttonTypeRight: {
		borderBottomEndRadius: 5,
		borderTopEndRadius: 5,
		borderLeftWidth: 0,
	},
	buttonTypeActive: {
		backgroundColor: '#f2f2f2',
	},
	textTypeActive: {
		color: '#000',
	},
});

export default Index;
