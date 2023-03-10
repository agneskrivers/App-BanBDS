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
					'S??? ??i???n tho???i ???? g???i qu?? nhi???u M?? X??c Nh???n.Vui l??ng quay l???i v??o ng??y mai!',
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
						`S??? ??i???n tho???i ???? nh???p sai qu?? nhi???u. Vui l??ng th??? l???i sau ${renameTime} ph??t n???a!`,
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
					'Vui l??ng ki???m tra l???i s??? ??i???n tho???i ho???c th??? l???i!',
					'G???i M?? X??c Nh???n B??? L???i',
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
					'S??? ??i???n tho???i ???? nh???p sai qu?? nhi???u. Vui l??ng th??? l???i sau 30 ph??t n???a!',
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
					'S??? ??i???n tho???i ???? g???i qu?? nhi???u M?? X??c Nh???n.Vui l??ng quay l???i v??o ng??y mai!',
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
					'M??y ch??? b??? l???i',
					'Vui l??ng th??? l???i sau!',
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
						Xin ch??o,
					</Text>
					<Text
						fontSize="md"
						mb="8"
						fontWeight={500}
						color="dark.400"
					>
						????ng nh???p ho???c t???o t??i kho???n
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
						placeholder="S??? ??i???n tho???i"
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
							S??? ??i???n tho???i ?????nh d???ng kh??ng ????ng
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
						Ti???p t???c
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
						B???ng vi???c ti???p t???c, b???n ?????ng ?? v???i{' '}
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
						??i???u kho???n s??? d???ng
					</Button>
					<Text fontSize="sm" textAlign="center">
						{' '}
						c???a{' '}
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
