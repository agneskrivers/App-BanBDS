import React, {
	FunctionComponent,
	useState,
	useEffect,
	useContext,
} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
	Box,
	Icon,
	Pressable,
	Text,
	Button,
	Image,
	PresenceTransition,
	HStack,
	Spinner,
	Center,
} from 'native-base';
import { StatusBar, Platform } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import {
	CodeField,
	Cursor,
	useBlurOnFulfill,
	useClearByFocusCell,
} from 'react-native-confirmation-code-field';

// Styles
import Styles from './styles';

// Assets
import LogoDark from '@assets/images/logo-dark.png';

// Configs
import { LimitFailed, LimitRenew } from '@configs';

// Context
import { Context } from '@context';

// Helpers
import {
	formatPhoneNumber,
	formatTime,
	renewTokenDevice,
	storages,
} from '@helpers';

// Services
import services from '@services';

// Interfaces
import type { ICompositeNavigationStacks, IStackParams } from '@interfaces';

// Props
interface Props {
	navigation: ICompositeNavigationStacks<'Login'>;
	route: RouteProp<IStackParams, 'Confirm'>;
}

const Index: FunctionComponent<Props> = ({ navigation, route }) => {
	// States
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isResend, setIsResend] = useState<boolean>(false);
	const [isLogin, setIsLogin] = useState<boolean>(false);
	const [isCheck, setIsCheck] = useState<boolean>(false);

	const [device, setDevice] = useState<string>();
	const [user, setUser] = useState<string>();

	const [value, setValue] = useState<string>('');
	const [count, setCount] = useState<number>(59);

	const [failed, setFailed] = useState<number>(0);
	const [resend, setResend] = useState<number>(0);

	// Hooks
	const ref = useBlurOnFulfill({ value, cellCount: 4 });
	const [props, getCellOnLayoutHandler] = useClearByFocusCell({
		value,
		setValue,
	});
	const { onNotification, onLogin } = useContext(Context);

	// Effect
	useEffect(() => {
		if (ref && ref.current) {
			ref.current.focus();
		}
	}, [ref]);
	useEffect(() => {
		let id: NodeJS.Timeout;

		if (count <= 0) return () => clearTimeout(id);

		id = setTimeout(() => setCount(preCount => preCount - 1), 1000);

		return () => clearTimeout(id);
	}, [count]);
	useEffect(() => {
		if (value.length === 4) {
			setIsLoading(true);
			setIsCheck(true);
		}
	}, [value]);
	useEffect(() => {
		const controller = new AbortController();

		const getData = async (
			signal: AbortSignal,
			tokenDevice?: string,
		): Promise<void> => {
			const now = Date.now();
			const date = new Date(now).getDate();

			const keyFailed = `failed-${route.params.phoneNumber}`;
			const keyRenew = `renew-${route.params.phoneNumber}`;

			if (failed >= LimitFailed) {
				onNotification(
					'toast-screen-login-failed',
					'Vui l??ng th??? l???i sau 30 ph??t n???a!',
					'Nh???p Sai Qu?? Nhi???u',
					'warning',
				);

				const isSetFailed = await storages.set(
					keyFailed,
					now.toString(),
				);

				setIsLoading(false);

				if (isSetFailed) {
					setTimeout(() => navigation.navigate('Login'), 1000);
				}

				return;
			}

			if (resend >= LimitRenew) {
				onNotification(
					'toast-screen-login-renew',
					'Vui l??ng quay l???i v??o ng??y mai!',
					'L???y M?? X??c Nh???n Qu?? Nhi???u',
					'warning',
				);

				setIsLoading(false);

				const isSetRenew = await storages.set(
					keyRenew,
					date.toString(),
				);

				if (isSetRenew) {
					setTimeout(() => navigation.navigate('Home'), 1000);
				}

				return;
			}

			const checkFailed = await storages.get.str(keyFailed);
			const checkRenew = await storages.get.str(keyRenew);

			if (checkRenew && !isNaN(parseInt(checkRenew, 10))) {
				const dateRenew = parseInt(checkRenew, 10);

				if (date === dateRenew) {
					onNotification(
						'toast-screen-confirm-renew',
						'Vui l??ng quay l???i v??o ng??y mai!',
						'L???y M?? X??c Nh???n Qu?? Nhi???u',
						'warning',
					);

					setIsLoading(false);

					setTimeout(() => navigation.navigate('Home'), 1000);

					return;
				}
			}

			if (checkFailed && !isNaN(parseInt(checkFailed, 10))) {
				const timeFailed = parseInt(checkFailed, 10);

				if (timeFailed > Date.now()) {
					const renameTime = Math.floor(
						(now - timeFailed) / 1000 / 60,
					);

					onNotification(
						'toast-screen-login-failed',
						`Vui l??ng th??? l???i sau ${renameTime} ph??t n???a!`,
						'Nh???p Sai Qu?? Nhi???u',
						'warning',
					);

					setIsLoading(false);

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

			const result = await services.login.check(
				signal,
				token,
				route.params.phoneNumber,
				value,
			);

			if (!result) throw new Error();

			if (result === 'UnauthorizedDevice') {
				const renewToken = await renewTokenDevice(signal);

				if (!renewToken) throw new Error();

				return getData(signal, renewToken);
			}

			if (result === 'BadRequest') {
				onNotification(
					'toast-screen-confirm-otp-not-valid',
					'M?? x??c nh???n kh??ng ????ng. Vui l??ng th??? l???i!',
					'Kh??ng H???p L???',
					'warning',
				);

				setIsLoading(false);
				setFailed(preFailed => preFailed + 1);
				setValue('');

				if (ref && ref.current) {
					ref.current.focus();
				}

				return;
			}

			if (result.isCreated) {
				setDevice(token);
				setUser(result.token);
				setIsLogin(true);

				return;
			}

			setIsLoading(false);

			return navigation.navigate('User', {
				phoneNumber: route.params.phoneNumber,
			});
		};

		if (isLoading && value.length === 4 && isCheck) {
			getData(controller.signal)
				.catch(() => {
					onNotification(
						'toast-screen-confirm-login-no-result',
						'Vui l??ng th??? l???i sau!',
						'M??y ch??? b??? l???i',
						'error',
					);

					setIsLoading(false);
				})
				.finally(() => setIsCheck(false));
		}

		return () => controller.abort();
	}, [
		failed,
		resend,
		isLoading,
		isCheck,
		ref,
		value,
		navigation,
		onNotification,
		route.params.phoneNumber,
	]);
	useEffect(() => {
		const controller = new AbortController();

		const getData = async (
			signal: AbortSignal,
			tokenDevice?: string,
		): Promise<void> => {
			if (device && user) {
				const result = await services.user.info(
					signal,
					tokenDevice ? tokenDevice : device,
					user,
				);

				if (!result) throw new Error();

				if (result === 'UnauthorizedDevice') {
					if (tokenDevice) throw new Error();

					const renewToken = await renewTokenDevice(signal);

					if (!renewToken) throw new Error();

					return getData(signal, renewToken);
				}

				if (result === 'UnauthorizedUser') {
					setTimeout(() => {
						onNotification(
							'toast-screen-confirm-user-info-unauthorized',
							'????ng nh???p th???t b???i!',
							undefined,
							'warning',
						);

						setIsLoading(false);
						navigation.navigate('Login');
					}, 500);

					return;
				}

				const isLoginContext = await onLogin(user, result);

				if (!isLoginContext) {
					setTimeout(() => {
						onNotification(
							'toast-screen-confirm-user-info-unauthorized',
							'????ng nh???p th???t b???i!',
							undefined,
							'warning',
						);
						setIsLoading(false);
						navigation.navigate('Login');
					}, 500);

					return;
				}

				setTimeout(() => {
					onNotification(
						'toast-screen-confirm-login-success',
						'????ng nh???p th??nh c??ng',
					);
					setIsLoading(false);
					navigation.navigate('Home');
				}, 500);
			}
		};

		if (isLoading && device && user && isLogin) {
			getData(controller.signal)
				.catch(() => {
					onNotification(
						'toast-screen-confirm-error',
						'Vui l??ng th??? l???i sau!',
						'M??y ch??? b??? l???i',
						'error',
					);
					setIsLoading(false);
					navigation.navigate('Home');
				})
				.finally(() => setIsLogin(false));
		}

		return () => controller.abort();
	}, [isLoading, isLogin, device, user, onLogin, onNotification, navigation]);
	useEffect(() => {
		const controller = new AbortController();

		const getData = async (
			signal: AbortSignal,
			tokenDevice?: string,
		): Promise<void> => {
			const now = Date.now();
			const date = new Date(now).getDate();

			const keyFailed = `failed-${route.params.phoneNumber}`;
			const keyRenew = `renew-${route.params.phoneNumber}`;

			if (failed >= LimitFailed) {
				onNotification(
					'toast-screen-login-failed',
					'Vui l??ng th??? l???i sau 30 ph??t n???a!',
					'Nh???p Sai Qu?? Nhi???u',
					'warning',
				);

				const isSetFailed = await storages.set(
					keyFailed,
					now.toString(),
				);

				setIsResend(false);

				if (isSetFailed) {
					setTimeout(() => navigation.navigate('Login'), 1000);
				}

				return;
			}

			if (resend >= LimitRenew) {
				onNotification(
					'toast-screen-login-renew',
					'Vui l??ng quay l???i v??o ng??y mai!',
					'L???y M?? X??c Nh???n Qu?? Nhi???u',
					'warning',
				);

				setIsResend(false);

				const isSetRenew = await storages.set(
					keyRenew,
					date.toString(),
				);

				if (isSetRenew) {
					setTimeout(() => navigation.navigate('Home'), 1000);
				}

				return;
			}

			const checkFailed = await storages.get.str(keyFailed);
			const checkRenew = await storages.get.str(keyRenew);

			if (checkRenew && !isNaN(parseInt(checkRenew, 10))) {
				const dateRenew = parseInt(checkRenew, 10);

				if (date === dateRenew) {
					onNotification(
						'toast-screen-confirm-renew',
						'Vui l??ng quay l???i v??o ng??y mai!',
						'L???y M?? X??c Nh???n Qu?? Nhi???u',
						'warning',
					);

					setIsResend(false);

					setTimeout(() => navigation.navigate('Home'), 1000);

					return;
				}
			}

			if (checkFailed && !isNaN(parseInt(checkFailed, 10))) {
				const timeFailed = parseInt(checkFailed, 10);

				const renameTime = (now - timeFailed) / 1000 / 60;

				onNotification(
					'toast-screen-login-failed',
					`Vui l??ng th??? l???i sau ${renameTime} ph??t n???a!`,
					'Nh???p Sai Qu?? Nhi???u',
					'warning',
				);

				setIsResend(false);

				setTimeout(() => navigation.navigate('Login'), 1000);

				return;
			}

			let token: string | null | undefined = tokenDevice;

			if (!token) {
				token = await storages.get.str('device');
			}

			if (!token) {
				token = await renewTokenDevice(signal);
			}

			if (!token) throw new Error('Error');

			const result = await services.login.send(
				signal,
				token,
				route.params.phoneNumber,
			);

			if (!result) throw new Error('Error');

			if (result === 'UnauthorizedDevice') {
				const renewToken = await renewTokenDevice(signal);

				if (!renewToken) throw new Error('Error');

				return getData(signal, renewToken);
			}

			if (result === 'BadRequest') {
				onNotification(
					'toast-screen-login-resend-failed',
					'Vui l??ng ki???m tra l???i s??? ??i???n tho???i ho???c th??? l???i!',
					'G???i M?? X??c Nh???n B??? L???i',
					'warning',
				);

				setIsResend(false);

				return;
			}

			if (result === 'Failed') {
				let renameTime = 30;

				const checkTimeFailed = await storages.get.str(keyFailed);

				if (checkTimeFailed && !isNaN(parseInt(checkTimeFailed, 10))) {
					const timeFailed = parseInt(checkTimeFailed, 10);

					renameTime = (now - timeFailed) / 1000 / 60;

					onNotification(
						'toast-screen-login-failed',
						`B???n ???? nh???p sai m?? x??c nh???n qu?? nhi???u. Vui l??ng th??? l???i sau ${renameTime} ph??t n???a!`,
						'Nh???p Sai Qu?? Nhi???u',
						'warning',
					);

					setIsResend(false);

					setTimeout(() => navigation.navigate('Login'), 1000);

					return;
				}
			}

			if (result === 'Renew') {
				let isRenew = false;

				const checkDateRenew = await storages.get.str(keyRenew);

				if (checkDateRenew) {
					if (
						isNaN(parseInt(checkDateRenew, 10)) ||
						parseInt(checkDateRenew, 10) === date
					) {
						await storages.remove(keyRenew);

						isRenew = true;
					}
				}

				if (isRenew) {
					await storages.set(keyRenew, date.toString());
				}

				onNotification(
					'toast-screen-login-renew',
					'B???n ???? g???i y??u c???u l???y m?? x??c nh???n qu?? nhi???u. Vui l??ng quay l???i v??o ng??y mai!',
					'Qu?? S??? L???n G???i M?? X??c Nh???n',
					'warning',
				);

				setIsResend(false);

				setTimeout(() => navigation.navigate('Home'), 1000);

				return;
			}

			onNotification(
				'toast-screen-confirm-resend-success',
				'G???i m?? x??c nh???n th??nh c??ng. Vui l??ng ki???m tra ??i???n tho???i!',
				'Th??nh C??ng',
			);

			setResend(preResend => preResend + 1);
			setValue('');
			setCount(30);
			setIsResend(false);

			if (ref && ref.current) {
				ref.current.focus();
			}
		};

		if (isResend && resend <= LimitRenew) {
			getData(controller.signal);
		}

		return () => controller.abort();
	}, [
		failed,
		resend,
		isResend,
		ref,
		navigation,
		onNotification,
		route.params.phoneNumber,
	]);

	// Handles
	const handlePressGoBack = () => {
		if (navigation.canGoBack()) {
			navigation.goBack();
		} else {
			navigation.push('Root', { screen: 'Home', params: undefined });
		}
	};
	const handlePressResend = () => {
		if (resend < LimitRenew) return setIsResend(true);
	};

	return (
		<>
			<StatusBar barStyle="dark-content" />
			<Box flex={1} safeArea px={4} backgroundColor="white">
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
				<Box alignItems="center">
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
						color="dark.200"
						fontWeight="bold"
						mb={2}
						mt={5}
					>
						Nh???p m?? x??c nh???n
					</Text>
					<Text
						fontSize="md"
						mb={8}
						color="dark.400"
						textAlign="center"
					>
						{`M?? x??c minh v???a g???i v??o s??? ??i???n tho???i ${formatPhoneNumber(
							route.params.phoneNumber,
						)} c???a b???n`}
					</Text>
					<CodeField
						ref={ref}
						{...props}
						value={value}
						onChangeText={setValue}
						cellCount={4}
						rootStyle={Styles.codeFieldRoot}
						keyboardType="number-pad"
						textContentType="oneTimeCode"
						renderCell={({ index, symbol, isFocused }) => (
							<Box
								onLayout={getCellOnLayoutHandler(index)}
								key={index}
								style={[
									Styles.cellRoot,
									isFocused && Styles.focusCell,
								]}
							>
								<Text style={Styles.cellText}>
									{symbol || (isFocused ? <Cursor /> : null)}
								</Text>
							</Box>
						)}
					/>
					<HStack mt={6} alignItems="center">
						<Text
							fontSize={15}
							fontWeight="medium"
							color="muted.600"
						>
							{count <= 0
								? 'Kh??ng nh???n ???????c m???'
								: 'G???i l???i m?? sau'}
						</Text>
						{count <= 0 ? (
							<Button
								variant="unstyled"
								p={0}
								_text={{
									color: 'info.600',
									fontWeight: 'semibold',
									fontSize: 16,
								}}
								ml={1}
								onPress={handlePressResend}
								disabled={resend >= LimitRenew}
							>
								G???i l???i m??
							</Button>
						) : (
							<Text
								color="info.600"
								fontWeight="semibold"
								fontSize={16}
							>{` 00:${formatTime(count)}`}</Text>
						)}
					</HStack>
				</Box>
			</Box>
			{(isLoading || isResend) && (
				<Center
					position="absolute"
					top={0}
					left={0}
					bgColor="#00000060"
					width="100%"
					height="100%"
					zIndex={2}
				>
					<Spinner size="lg" color="white" />
				</Center>
			)}
		</>
	);
};

export default Index;
