import React, {
	FunctionComponent,
	useState,
	useEffect,
	useContext,
} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import {
	Keyboard,
	TouchableWithoutFeedback,
	Linking,
	Platform,
} from 'react-native';
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
} from 'native-base';

// Assets
import LogoDark from '@assets/images/logo-dark.png';

// Configs
import { LinkDefault, WebsiteNameDefault } from '@configs';

// Context
import { Context } from '@context';

// Helpers
import {
	isValidPhoneNumber,
	storages,
	renewTokenDevice,
	formatPhoneNumber,
} from '@helpers';

// Services
import services from '@services';

// Interfaces
import type { ICompositeNavigationStacks, ILinkJSON } from '@interfaces';

// Props
interface Props {
	navigation: ICompositeNavigationStacks<'Login'>;
}

const Index: FunctionComponent<Props> = ({ navigation }) => {
	// States
	const [isValid, setIsValid] = useState<boolean>();
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const [links, setLinks] = useState<ILinkJSON | null>(null);

	const [phoneNumber, setPhoneNumber] = useState<string>();
	const [phoneNumberTemp, setPhoneNumberTemp] = useState<string>();

	// Hooks
	const { onNotification } = useContext(Context);

	// Effects
	useEffect(() => {
		const getData = async () => {
			const data = await storages.get.obj<ILinkJSON>('links');

			if (data) {
				setLinks(data);
			}
		};

		getData();
	}, []);
	useEffect(() => {
		const id = setTimeout(() => setPhoneNumber(phoneNumberTemp), 100);

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
		const controller = new AbortController();

		const getData = async (
			signal: AbortSignal,
			phone: string,
			tokenDevice?: string,
		): Promise<void> => {
			const now = Date.now();

			const date = new Date(now).getDate();
			const month = new Date(now).getMonth() + 1;
			const year = new Date(now).getFullYear();

			const day = `${date}/${month}/${year}`;

			const keyFailed = `failed-${phone}`;
			const keyRenew = `renew-${phone}`;

			const checkFailed = await storages.get.str(keyFailed);
			const checkRenew = await storages.get.str(keyRenew);

			if (checkRenew && day === checkRenew) {
				onNotification(
					'toast-screen-login-check-renew',
					'Số điện thoại đã gửi quá nhiều Mã Xác Nhận.Vui lòng quay lại vào ngày mai!',
					formatPhoneNumber(phone),
					'warning',
				);

				setIsLoading(false);
				setPhoneNumberTemp('');

				setTimeout(() => navigation.navigate('Home'), 1000);

				return;
			}

			if (checkFailed && !isNaN(parseInt(checkFailed, 10))) {
				const timeFailed = parseInt(checkFailed, 10);

				const renameTime =
					30 - Math.floor((now - timeFailed) / 1000 / 60);

				if (renameTime > 0) {
					onNotification(
						'toast-screen-login-check-failed',
						`Số điện thoại đã nhập sai quá nhiều. Vui lòng thử lại sau ${renameTime} phút nữa!`,
						formatPhoneNumber(phone),
						'warning',
					);

					setIsLoading(false);
					setPhoneNumberTemp('');

					return;
				}
			}

			let token: string | null | undefined = tokenDevice;

			if (!token) {
				token = await storages.get.str('device');
			}

			if (!token) {
				token = await renewTokenDevice(signal);
			}

			if (!token) throw new Error();

			const result = await services.login.send(signal, token, phone);

			if (!result) throw new Error();

			if (result === 'UnauthorizedDevice') {
				if (tokenDevice) throw new Error();

				const renewToken = await renewTokenDevice(signal);

				if (!renewToken) throw new Error();

				return getData(signal, phone, renewToken);
			}

			if (result === 'BadRequest') {
				onNotification(
					'toast-screen-login-result-bad-request',
					'Vui lòng kiểm tra lại số điện thoại hoặc thử lại!',
					'Gửi Mã Xác Nhận Bị Lỗi',
					'warning',
				);

				setIsLoading(false);

				return;
			}

			if (result === 'Failed') {
				if (checkFailed) {
					await storages.remove(keyFailed);
				}

				await storages.set(keyFailed, Date.now().toString());

				onNotification(
					'toast-screen-login-result-failed',
					'Số điện thoại đã nhập sai quá nhiều. Vui lòng thử lại sau 30 phút nữa!',
					formatPhoneNumber(phone),
					'warning',
				);

				setIsLoading(false);
				setPhoneNumberTemp('');

				return;
			}

			if (result === 'Renew') {
				if (checkRenew) {
					await storages.remove(keyRenew);
				}

				await storages.set(keyRenew, day);

				onNotification(
					'toast-screen-login-result-renew',
					'Số điện thoại đã gửi quá nhiều Mã Xác Nhận.Vui lòng quay lại vào ngày mai!',
					formatPhoneNumber(phone),
					'warning',
				);

				setIsLoading(false);
				setPhoneNumberTemp('');

				setTimeout(() => navigation.navigate('Home'), 1000);

				return;
			}

			setIsLoading(false);

			navigation.navigate('Confirm', {
				phoneNumber: phone,
			});
		};

		if (isLoading && phoneNumber && phoneNumber.length === 10 && isValid) {
			getData(controller.signal, phoneNumber).catch(() => {
				onNotification(
					'toast-screen-login-error',
					'Máy chủ bị lỗi',
					'Vui lòng thử lại sau!',
					'error',
				);

				setPhoneNumberTemp('');
				setIsLoading(false);

				return;
			});
		}

		return () => controller.abort();
	}, [isLoading, isValid, phoneNumber, navigation, onNotification]);

	// Handles
	const handlePressTerms = async () => {
		const uri = links && links.Rules ? links.Rules : LinkDefault;

		if (await InAppBrowser.isAvailable()) {
			await InAppBrowser.open(uri, {
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
			Linking.openURL(uri);
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
				<Box mt={Platform.OS === 'android' ? 2 : 0}>
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
						disabled={
							!isValid ||
							isLoading ||
							(phoneNumber === undefined &&
								phoneNumberTemp === undefined)
						}
						onPress={handlePressNext}
						isLoading={isLoading}
					>
						Tiếp tục
					</Button>
				</Box>
				<HStack
					px="10"
					py={Platform.OS === 'android' ? 5 : 3}
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
						href={
							links && links.HomePage
								? links.HomePage
								: LinkDefault
						}
						_text={{
							color: 'blue.600',
							fontWeight: 'bold',
							textDecoration: 'none',
						}}
						p={0}
					>
						{links && links.WebsiteName
							? links.WebsiteName
							: WebsiteNameDefault}
					</Link>
				</HStack>
			</Box>
		</TouchableWithoutFeedback>
	);
};

export default Index;
