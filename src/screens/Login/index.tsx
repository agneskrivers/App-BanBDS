import React, {
	FunctionComponent,
	useState,
	useEffect,
	useContext,
} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import { Keyboard, TouchableWithoutFeedback, Linking } from 'react-native';
import {
	Box,
	Icon,
	Pressable,
	Text,
	Button,
	Image,
	PresenceTransition,
	Input,
	HStack,
	Link,
	Spinner,
} from 'native-base';

// Assets
import LogoDark from '@assets/images/logo-dark.png';

// Context
import { Context } from '@context';

// Helpers
import { isValidPhoneNumber } from '@helpers';

// Interfaces
import type { ICompositeNavigationStacks } from '@interfaces';

// Props
interface Props {
	navigation: ICompositeNavigationStacks<'Login'>;
}

const Index: FunctionComponent<Props> = ({ navigation }) => {
	// States
	const [isValid, setIsValid] = useState<boolean>();
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const [phoneNumber, setPhoneNumber] = useState<string>();
	const [phoneNumberTemp, setPhoneNumberTemp] = useState<string>();

	// Hooks
	const { onNotification } = useContext(Context);

	// Effects
	useEffect(() => {
		const id = setTimeout(() => setPhoneNumber(phoneNumberTemp), 500);

		() => clearTimeout(id);
	}, [phoneNumberTemp]);
	useEffect(() => {
		if (phoneNumber && phoneNumber.length === 10) {
			const isPhoneNumber = isValidPhoneNumber(phoneNumber);

			setIsValid(isPhoneNumber);
		} else {
			setIsValid(undefined);
		}
	}, [phoneNumber]);
	useEffect(() => {
		if (phoneNumber && phoneNumber.length === 10 && isValid) {
			Keyboard.dismiss();
		}
	}, [phoneNumber, isValid]);
	useEffect(() => {
		const getData = async (phone: string) => {
			setTimeout(() => {
				setIsLoading(false);
				navigation.push('Confirm', {
					phoneNumber: phone,
				});
			}, 2000);
		};

		if (isLoading && phoneNumber && phoneNumber.length === 10 && isValid) {
			getData(phoneNumber);
		}
	}, [isLoading, phoneNumber, isValid, navigation]);

	// Handles
	const handlePressTerms = async () => {
		const url = 'https://claimether.com';

		if (await InAppBrowser.isAvailable()) {
			await InAppBrowser.open(url, {
				// iOS Properties
				dismissButtonStyle: 'cancel',
				preferredControlTintColor: '#58a6ff',
				readerMode: false,
				animated: true,
				modalPresentationStyle: 'fullScreen',
				modalTransitionStyle: 'coverVertical',
				modalEnabled: true,
				enableBarCollapsing: false,

				// Android Properties

				showTitle: true,
				secondaryToolbarColor: 'black',
				navigationBarColor: 'black',
				navigationBarDividerColor: 'white',
				enableUrlBarHiding: true,
				enableDefaultShare: true,
				forceCloseOnRedirection: false,

				// Specify full animation resource identifier(package:anim/name)
				// or only resource name(in case of animation bundled with app).
				animations: {
					startEnter: 'slide_in_right',
					startExit: 'slide_out_left',
					endEnter: 'slide_in_left',
					endExit: 'slide_out_right',
				},
			});
		} else {
			Linking.openURL(url);
		}
	};
	const handlePressCleanInput = () => setPhoneNumberTemp('');
	const handlePressNext = () => {
		if (phoneNumber && phoneNumber.length === 10 && isValid) {
			setIsLoading(true);
		}
	};
	const handlePressGoBack = () => {
		if (navigation.canGoBack()) {
			navigation.goBack();
		} else {
			navigation.push('Root', { screen: 'Home', params: undefined });
		}
	};

	const handleChangePhoneNumber = (value: string) =>
		setPhoneNumberTemp(value);

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
			<Box
				flex={1}
				safeArea
				px={4}
				backgroundColor="white"
				justifyContent="space-between"
			>
				<Box>
					<Pressable mb={5} onPress={handlePressGoBack}>
						<Icon
							as={MaterialCommunityIcons}
							name="arrow-left"
							size={7}
							color="dark.400"
						/>
					</Pressable>
				</Box>
				<Box py={3} mb={10} alignItems="center">
					<PresenceTransition
						visible
						initial={{
							opacity: 0,
							scale: 0,
						}}
						animate={{
							opacity: 1,
							scale: 1,
							transition: {
								duration: 250,
							},
						}}
					>
						<Image
							source={LogoDark}
							height={45}
							mb={10}
							alt="Logo"
							style={{ aspectRatio: 226 / 50 }}
						/>
					</PresenceTransition>
					<Text
						fontSize="xl"
						fontWeight="bold"
						mb={1}
						color="dark.200"
					>
						Xin chào,
					</Text>
					<Text
						fontSize="md"
						mb="8"
						fontWeight={500}
						color="dark.400"
					>
						Đăng nhập hoặc tạo tài khoản
					</Text>
					<Input
						_focus={{ borderColor: 'blue.500' }}
						isRequired
						size="lg"
						height={55}
						keyboardType="numeric"
						InputLeftElement={
							<Icon
								as={MaterialCommunityIcons}
								name="cellphone-wireless"
								size={6}
								mx={4}
								color="blue.500"
							/>
						}
						InputRightElement={
							phoneNumberTemp && phoneNumberTemp.length > 0 ? (
								<Pressable
									mr={4}
									onPress={handlePressCleanInput}
								>
									<Icon
										as={MaterialCommunityIcons}
										size={6}
										name="close-circle-outline"
										color="gray.600"
									/>
								</Pressable>
							) : undefined
						}
						placeholder="Số điện thoại"
						maxLength={10}
						onChangeText={handleChangePhoneNumber}
						isDisabled={isLoading}
						value={phoneNumberTemp}
					/>
					{isValid === false && (
						<Text
							color="danger.800"
							fontSize={12}
							fontWeight={500}
							mt={2}
						>
							Số điện thoại định dạng không đúng
						</Text>
					)}
					<Button
						colorScheme="blue"
						_text={{ fontWeight: 'bold', fontSize: 16 }}
						borderRadius="lg"
						shadow={2}
						height={45}
						width="100%"
						mt={4}
						// disabled={!isValid || isLoading}
						onPress={handlePressNext}
					>
						{isLoading ? (
							<Spinner size="sm" color="white" />
						) : (
							'Tiếp tục'
						)}
					</Button>
				</Box>
				<HStack
					px="10"
					py="3"
					alignItems="center"
					flexWrap="wrap"
					justifyContent="center"
					mt={10}
				>
					<Text fontSize="sm" textAlign="center">
						Bằng việc tiếp tục, bạn đồng ý với{' '}
					</Text>
					<Button
						color="blue.500"
						fontWeight="bold"
						_text={{
							color: 'blue.500',
							fontWeight: 'bold',
						}}
						variant="unstyled"
						p={0}
						onPress={handlePressTerms}
					>
						điều khoản sử dụng
					</Button>
					<Text fontSize="sm" textAlign="center">
						{' '}
						của{' '}
					</Text>
					<Link
						color="blue.500"
						fontWeight="bold"
						href="https://google.com"
						_text={{
							color: 'blue.600',
							fontWeight: 'bold',
							textDecoration: 'none',
						}}
						p={0}
					>
						BanBds.vn
					</Link>
				</HStack>
			</Box>
		</TouchableWithoutFeedback>
	);
};

export default Index;
