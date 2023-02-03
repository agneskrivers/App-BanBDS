import React, {
	FunctionComponent,
	useContext,
	useState,
	useEffect,
} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker, {
	DateTimePickerEvent,
	DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { RouteProp } from '@react-navigation/native';
import {
	Platform,
	StatusBar,
	TouchableWithoutFeedback,
	Keyboard,
	Alert,
} from 'react-native';
import {
	Text,
	Box,
	Avatar,
	Button,
	HStack,
	FormControl,
	Icon,
	Pressable,
	ScrollView,
	Input,
	Modal,
	KeyboardAvoidingView,
	Spinner,
	Center,
} from 'native-base';
import { launchImageLibrary, Asset } from 'react-native-image-picker';

// Assets
import AvatarDefault from '@assets/images/avatar-default.png';

// Config
import { host } from '@configs';

// Context
import { Context } from '@context';

// Helpers
import { formatPhoneNumber, renewTokenDevice, storages } from '@helpers';

// Services
import services from '@services';

// Interfaces
import type {
	ICompositeNavigationStacks,
	IStackParams,
	IUserCreate,
} from '@interfaces';

// Props
interface Props {
	navigation: ICompositeNavigationStacks<'User'>;
	route: RouteProp<IStackParams, 'User'>;
}

const Index: FunctionComponent<Props> = ({ navigation, route }) => {
	// Constants
	const FourYearMilliseconds = 364 * 24 * 60 * 60 * 1000;

	// States
	const [isCreating, setIsCreating] = useState<boolean>(false);

	const [avatar, setAvatar] = useState<string>();
	const [avatarTemp, setAvatarTemp] = useState<Asset>();
	const [fullName, setFullName] = useState<string>();
	const [birthday, setBirthday] = useState<number>();
	const [birthdayTemp, setBirthdayTemp] = useState<number>();
	const [address, setAddress] = useState<string>();

	const [isModalDate, setIsModalDate] = useState<boolean>(false);

	// Hooks
	const { onNotification, onLogin } = useContext(Context);

	// Effects
	useEffect(() => {
		const controller = new AbortController();

		const getData = async (
			signal: AbortSignal,
			image: Asset,
			tokenDevice?: string,
		): Promise<void> => {
			const { fileName, uri, type } = image;

			if (!fileName || !uri || !type) {
				setAvatarTemp(undefined);

				onNotification(
					'toast-screen-user-no-image',
					'Vui lòng chọn hình ảnh!',
					undefined,
					'warning',
				);

				return;
			}

			let token: string | null | undefined = tokenDevice;

			if (!token) {
				token = await storages.get.str('device');
			}

			if (!token) {
				token = await renewTokenDevice(signal);
			}

			if (!token) throw new Error();

			const body = new FormData();

			body.append('file', {
				name: fileName,
				uri,
				type,
			});
			body.append('avatar', 'true');

			const result = await services.common.images.upload(
				signal,
				token,
				body,
			);

			if (!result) throw new Error();

			if (result === 'Unauthorized') {
				if (tokenDevice) throw new Error();

				const renewToken = await renewTokenDevice(signal);

				if (!renewToken) throw new Error();

				return getData(signal, image, renewToken);
			}

			if (result === 'NotFound') {
				setAvatarTemp(undefined);

				onNotification(
					'toast-screen-user-image-not-found',
					'Không có hình ảnh!',
					undefined,
					'warning',
				);

				return;
			}

			if (result === 'ImageFormat') {
				setAvatarTemp(undefined);

				onNotification(
					'toast-screen-user-image-format',
					'Vui lòng chọn ảnh khác!',
					'Định dạng ảnh không hỗ trợ',
					'info',
				);

				return;
			}

			if (result === 'ImageToBig') {
				setAvatarTemp(undefined);

				onNotification(
					'toast-screen-user-image-to-big',
					'Vui lòng chọn ảnh khác!',
					'Hình ảnh quá lớn',
					'info',
				);

				return;
			}

			setAvatarTemp(undefined);
			setAvatar(result);
		};

		if (avatarTemp) {
			getData(controller.signal, avatarTemp).catch(() => {
				setAvatarTemp(undefined);

				onNotification(
					'toast-screen-user-error',
					'Máy chủ bị lỗi',
					'Vui lòng thử lại sau!',
					'error',
				);
			});
		}

		return () => controller.abort();
	}, [avatarTemp, onNotification]);
	useEffect(() => {
		const controller = new AbortController();

		const getData = async (
			signal: AbortSignal,
			phone: string,
			tokenDevice?: string,
		): Promise<void> => {
			if (!fullName) {
				setIsCreating(false);

				onNotification(
					'toast-screen-user-require',
					'Vui lòng nhập họ và tên!',
					undefined,
					'info',
				);

				return;
			}

			if (!birthday) {
				setIsCreating(false);

				onNotification(
					'toast-screen-user-require',
					'Vui lòng nhập ngày sinh!',
					undefined,
					'info',
				);

				return;
			}

			if (!address) {
				setIsCreating(false);

				onNotification(
					'toast-screen-user-require',
					'Vui lòng nhập địa chỉ!',
					undefined,
					'info',
				);

				return;
			}

			let token: string | null | undefined = tokenDevice;

			if (!token) {
				token = await storages.get.str('device');
			}

			if (!token) {
				token = await renewTokenDevice(signal);
			}

			if (!token) throw new Error();

			const body: IUserCreate = {
				address,
				birthday,
				fullName,
				phoneNumber: phone,
				avatar: avatar ? avatar : null,
			};

			const result = await services.user.create(signal, token, body);

			if (!result) throw new Error();

			if (result === 'UnauthorizedDevice') {
				if (tokenDevice) throw new Error();

				const renewToken = await renewTokenDevice(signal);

				if (!renewToken) throw new Error();

				return getData(signal, phone, renewToken);
			}

			if (result === 'BadRequest') {
				setIsCreating(false);

				onNotification(
					'toast-screen-user-bad-request',
					'Vui lòng thử lại!',
					'Tạo tài khoản không thành công',
					'warning',
				);

				return;
			}

			return login(signal, token, result);
		};

		const login = async (
			signal: AbortSignal,
			device: string,
			user: string,
		): Promise<void> => {
			const result = await services.user.info(signal, device, user);

			if (!result) throw new Error();

			if (result === 'UnauthorizedDevice') throw new Error();

			if (result === 'UnauthorizedUser') {
				onNotification(
					'toast-screen-user-login-unauthorized-user',
					'Vui lòng thử lại!',
					'Có lỗi xảy ra',
					'warning',
				);

				setIsCreating(false);

				return;
			}

			const isLogin = await onLogin(user, result);

			if (!isLogin) {
				setIsCreating(false);

				onNotification(
					'toast-screen-user-login-failed',
					'Vui lòng thử lại!',
					'Tạo tài khoản không thành công',
					'warning',
				);

				return;
			}

			setIsCreating(false);

			onNotification(
				'toast-screen-user-login-success',
				'Tạo tài khoản thành công',
			);

			setTimeout(() => navigation.navigate('Home'), 500);
		};

		if (isCreating) {
			getData(controller.signal, route.params.phoneNumber).catch(() => {
				setIsCreating(false);

				Alert.alert('Máy chủ bị lỗi', 'Bạn có muốn thử lại không?', [
					{
						text: 'Thử lại',
						style: 'default',
					},
					{
						text: 'Thoát',
						onPress: () => navigation.navigate('Home'),
					},
				]);
			});
		}

		return () => controller.abort();
	}, [
		route,
		navigation,
		isCreating,
		address,
		avatar,
		birthday,
		fullName,
		onLogin,
		onNotification,
	]);
	useEffect(() => {
		Alert.alert('Máy chủ bị lỗi', 'Bạn có muốn thử lại không?', [
			{
				text: 'Thử lại',
				style: 'default',
			},
			{
				text: 'Thoát',
				onPress: () => navigation.navigate('Home'),
			},
		]);
	}, [navigation]);

	// Handle
	const _dateTimePickerByAndroid = () => {
		DateTimePickerAndroid.open({
			value: validatorBirthday,
			onChange: handleChangeDatePicker,
			mode: 'date',
			minimumDate: new Date(1960, 0, 1),
			maximumDate: new Date(Date.now() - FourYearMilliseconds),
		});
	};

	const handleOpenModalDate = () => setIsModalDate(true);
	const handleCloseModalDate = () => setIsModalDate(false);

	const handleChangeDatePicker = (e: DateTimePickerEvent) => {
		if (e.nativeEvent.timestamp) {
			if (Platform.OS === 'android') {
				setBirthday(e.nativeEvent.timestamp);
			} else {
				setBirthdayTemp(e.nativeEvent.timestamp);
			}
		}
	};
	const handleChangeFullName = (value: string) => setFullName(value);
	const handleChangeAddress = (value: string) => setAddress(value);

	const handlePressClose = () => navigation.navigate('Login');
	const handlePressBirthday = () =>
		Platform.OS === 'ios'
			? handleOpenModalDate()
			: _dateTimePickerByAndroid();
	const handlePressCancelModalDate = () => {
		setBirthday(undefined);
		setBirthdayTemp(undefined);
		setIsModalDate(false);
	};
	const handlePressUploadAvatar = async () => {
		const image = await launchImageLibrary({
			mediaType: 'photo',
		});

		if (!image.didCancel && image.assets && image.assets.length === 1) {
			setAvatarTemp(image.assets[0]);
		}
	};
	const handlePressCreate = () => {
		if (fullName && birthday && address) {
			setIsCreating(true);
		}
	};
	const handlePressSelectBirthday = () => {
		if (birthdayTemp) {
			setBirthday(birthdayTemp);
			setIsModalDate(false);
		}
	};

	// Validator
	const validatorAvatar =
		avatar === undefined
			? AvatarDefault
			: { uri: `${host}/temp/${avatar}` };
	const validatorBirthday = birthdayTemp
		? new Date(birthdayTemp)
		: new Date(Date.now() - FourYearMilliseconds);

	return (
		<>
			<StatusBar barStyle="dark-content" />
			<KeyboardAvoidingView
				flex={1}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<Box
						flex={1}
						px={4}
						bg="white"
						justifyContent="space-between"
						safeArea
					>
						<HStack alignItems="center" bgColor="white">
							<Pressable onPress={handlePressClose}>
								<Icon
									as={MaterialIcons}
									name="close"
									size="md"
									color="dark.200"
								/>
							</Pressable>
							<Text
								py={3}
								ml={4}
								fontSize={18}
								fontWeight="semibold"
								color="dark.200"
							>
								Tạo người dùng
							</Text>
						</HStack>
						<ScrollView
							showsHorizontalScrollIndicator={false}
							showsVerticalScrollIndicator={false}
						>
							<Pressable
								onPress={handlePressUploadAvatar}
								isDisabled={
									isCreating || avatarTemp !== undefined
								}
							>
								<HStack alignItems="center">
									{avatarTemp !== undefined ? (
										<Center w={24} h={24}>
											<Spinner size="lg" />
										</Center>
									) : (
										<Avatar
											source={validatorAvatar}
											w={24}
											h={24}
										/>
									)}
									<Box
										ml={4}
										flex={1}
										alignItems="flex-start"
									>
										<Button
											py={0}
											px={2}
											mb={2}
											bgColor="info.200"
											leftIcon={
												<Icon
													as={MaterialCommunityIcons}
													name="plus-circle"
													size="xs"
													color="info.600"
												/>
											}
											w="auto"
											size="sm"
										>
											<Text
												fontWeight="medium"
												color="info.600"
											>
												Tải ảnh lên
											</Text>
										</Button>
										<Text
											fontSize={14}
											fontWeight="light"
											color="gray.400"
										>
											Chỉ tải ảnh lớn nhất là 10MB
										</Text>
									</Box>
								</HStack>
							</Pressable>
							<FormControl
								py={2}
								px={4}
								borderColor="gray.300"
								borderWidth={1}
								borderRadius="lg"
								mt={4}
							>
								<FormControl.Label>
									Số điện thoại
								</FormControl.Label>
								<Input
									variant="unstyled"
									px={0}
									value={formatPhoneNumber(
										route.params.phoneNumber,
									)}
									fontSize={14}
									fontWeight="medium"
									rightElement={
										<Icon
											as={MaterialIcons}
											name="check-circle"
											size="md"
											color="success.600"
										/>
									}
									isDisabled
								/>
							</FormControl>
							<FormControl
								py={2}
								px={4}
								mt={4}
								borderColor="gray.300"
								borderWidth={1}
								borderRadius="lg"
							>
								<FormControl.Label>Họ và tên</FormControl.Label>
								<Input
									variant="unstyled"
									px={0}
									fontSize={14}
									fontWeight="light"
									isDisabled={
										isCreating || avatarTemp !== undefined
									}
									onChangeText={handleChangeFullName}
								/>
							</FormControl>
							<Pressable
								onPress={handlePressBirthday}
								isDisabled={isCreating}
							>
								<Box
									mt={4}
									py={2}
									px={4}
									borderColor="gray.300"
									borderWidth={1}
									borderRadius="lg"
								>
									<Text
										lineHeight={21}
										fontSize={14}
										fontWeight="medium"
										color="muted.500"
									>
										Ngày sinh
									</Text>
									<HStack
										alignItems="center"
										justifyContent="space-between"
									>
										<Text
											py={2}
											fontSize={14}
											fontWeight="light"
											color={
												isCreating ||
												avatarTemp !== undefined
													? 'muted.400'
													: 'muted.900'
											}
										>
											{birthday
												? format(birthday, 'dd/MM/yyyy')
												: 'Vui lòng chọn ngày sinh'}
										</Text>
										<Icon
											as={MaterialCommunityIcons}
											name="calendar-account"
											size="lg"
											color="muted.500"
										/>
									</HStack>
								</Box>
							</Pressable>
							<FormControl
								py={2}
								px={4}
								mt={4}
								borderColor="gray.300"
								borderWidth={1}
								borderRadius="lg"
								mb={4}
							>
								<FormControl.Label>Địa chỉ</FormControl.Label>
								<Input
									variant="unstyled"
									px={0}
									fontSize={14}
									fontWeight="light"
									isDisabled={
										isCreating || avatarTemp !== undefined
									}
									onChangeText={handleChangeAddress}
								/>
							</FormControl>
						</ScrollView>
						<Button
							bg="info.500"
							isDisabled={
								isCreating ||
								avatarTemp !== undefined ||
								(!fullName && !birthday && !address)
							}
							isLoadingText="Đang tạo tài khoản"
							isLoading={isCreating}
							_text={{
								fontWeight: 600,
							}}
							onPress={handlePressCreate}
							mb={Platform.OS === 'android' ? 4 : 0}
						>
							Tạo tài khoản
						</Button>
					</Box>
				</TouchableWithoutFeedback>
			</KeyboardAvoidingView>
			<Modal isOpen={isModalDate} onClose={handleCloseModalDate}>
				<Modal.Content mt="auto" mb={0} w="100%" safeAreaBottom>
					<Modal.Header
						borderBottomWidth={0}
						justifyContent="center"
						alignItems="center"
					>
						<Text fontSize={18} fontWeight="medium">
							Chọn ngày
						</Text>
					</Modal.Header>
					<Modal.Body position="relative">
						<DateTimePicker
							value={validatorBirthday}
							display="spinner"
							minimumDate={new Date(1960, 0, 1)}
							maximumDate={
								new Date(Date.now() - FourYearMilliseconds)
							}
							onChange={handleChangeDatePicker}
							mode="date"
						/>
					</Modal.Body>
					<Modal.Footer borderTopWidth={0} alignItems="center">
						<Button
							variant="outline"
							flex={1}
							mr={2}
							onPress={handlePressCancelModalDate}
						>
							Hủy
						</Button>
						<Button
							bg="info.600"
							flex={1}
							ml={2}
							disabled={birthdayTemp === undefined}
							onPress={handlePressSelectBirthday}
							_text={{
								fontWeight: 600,
							}}
						>
							Chọn
						</Button>
					</Modal.Footer>
				</Modal.Content>
			</Modal>
		</>
	);
};

export default Index;
