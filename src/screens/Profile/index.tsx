import React, {
	FunctionComponent,
	useState,
	useContext,
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
	ImageSourcePropType,
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
} from 'native-base';
import { launchImageLibrary, Asset } from 'react-native-image-picker';

// Assets
import AvatarDefault from '@assets/images/avatar-default.png';

// Configs
import { host } from '@configs';

// Context
import { Context } from '@context';

// Helpers
import { formatPhoneNumber, storages, renewTokenDevice } from '@helpers';

// Services
import services from '@services';

// Interfaces
import type {
	ICompositeNavigationStacks,
	IStackParams,
	IUserUpdate,
} from '@interfaces';

// Props
interface Props {
	navigation: ICompositeNavigationStacks<'Profile'>;
	route: RouteProp<IStackParams, 'Profile'>;
}

const Index: FunctionComponent<Props> = ({ navigation, route }) => {
	// Props
	const { data } = route.params;

	// Constants
	const OneYearMilliseconds = 364 * 24 * 60 * 60 * 1000;

	// States
	const [isUpdating, setIsUpdating] = useState<boolean>(false);

	const [avatar, setAvatar] = useState<string>();
	const [avatarTemp, setAvatarTemp] = useState<Asset>();
	const [fullName, setFullName] = useState<string>();
	const [birthday, setBirthday] = useState<number>();
	const [address, setAddress] = useState<string>();

	const [isModalDate, setIsModalDate] = useState<boolean>(false);

	// Hooks
	const _dateTimePickerByAndroid = () => {
		DateTimePickerAndroid.open({
			value: new Date(birthday ? birthday : data.birthday),
			onChange: handleChangeDatePicker,
			mode: 'date',
			minimumDate: new Date(1960, 0, 1),
			maximumDate: new Date(Date.now() - 4 * OneYearMilliseconds),
		});
	};
	const { onNotification, onUpdateUser } = useContext(Context);

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
					'toast-screen-profile-no-image',
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
					'toast-screen-profile-image-not-found',
					'Không có hình ảnh!',
					undefined,
					'warning',
				);

				return;
			}

			if (result === 'ImageFormat') {
				setAvatarTemp(undefined);

				onNotification(
					'toast-screen-profile-image-format',
					'Vui lòng chọn ảnh khác!',
					'Định dạng ảnh không hỗ trợ',
					'info',
				);

				return;
			}

			if (result === 'ImageToBig') {
				setAvatarTemp(undefined);

				onNotification(
					'toast-screen-profile-image-to-big',
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
				onNotification(
					'toast-screen-profile-error',
					'Máy chủ bị lỗi',
					'Vui lòng thử lại sau!',
					'error',
				);

				setAvatarTemp(undefined);
			});
		}

		return () => controller.abort();
	}, [avatarTemp, onNotification]);
	useEffect(() => {
		const controller = new AbortController();

		const getData = async (
			signal: AbortSignal,
			phoneNumber: string,
			tokenDevice?: string,
		): Promise<void> => {
			if (!fullName && !birthday && !address && !avatar) {
				setIsUpdating(false);

				onNotification(
					'toast-screen-profile-no-update',
					'Không có thay đổi!',
					undefined,
					'warning',
				);

				return;
			}

			const user = await storages.get.str('user');

			if (!user) {
				setIsUpdating(false);

				onNotification(
					'toast-screen-profile-user-token',
					'Bạn không có quyền!',
					undefined,
					'error',
				);

				setTimeout(() => {
					navigation.navigate('Home');
				}, 500);

				return;
			}

			let device: string | undefined | null = tokenDevice;

			if (!device) {
				device = await storages.get.str('device');
			}

			if (!device) {
				device = await renewTokenDevice(signal);
			}

			if (!device) throw new Error();

			let body: IUserUpdate = {};

			if (avatar) {
				body = { ...body, avatar };
			}

			if (fullName) {
				body = { ...body, fullName };
			}

			if (birthday) {
				body = { ...body, birthday };
			}

			if (address) {
				body = { ...body, address };
			}

			const result = await services.user.update(
				signal,
				device,
				user,
				body,
			);

			if (!result) throw new Error();

			if (result === 'UnauthorizedUser') {
				setIsUpdating(false);

				onNotification(
					'toast-screen-profile-result-unauthorized-user',
					'Bạn không có quyền!',
					undefined,
					'error',
				);

				setTimeout(() => {
					navigation.navigate('Home');
				}, 500);

				return;
			}

			if (result === 'UnauthorizedDevice') {
				if (tokenDevice) throw new Error();

				const renewToken = await renewTokenDevice(signal);

				if (!renewToken) throw new Error();

				return getData(signal, phoneNumber, renewToken);
			}

			if (result === 'BadRequest') {
				setIsUpdating(false);
				handleReset();

				onNotification(
					'toast-screen-profile-result-bad-request',
					'Cập nhập không thành công. Vui lòng thử lại sau!',
					undefined,
					'error',
				);

				setTimeout(() => navigation.navigate('Account'), 500);

				return;
			}

			setIsUpdating(false);
			handleReset();

			onNotification(
				'toast-screen-profile-result-success',
				'Cập nhập thành công!',
			);
			onUpdateUser(body);

			setTimeout(() => navigation.navigate('Account'), 500);
		};

		if (isUpdating) {
			getData(controller.signal, data.phoneNumber).catch(() => {
				onNotification(
					'toast-screen-profile-error',
					'Máy chủ bị lỗi',
					'Vui lòng thử lại sau!',
					'error',
				);

				setIsUpdating(false);
			});
		}

		return () => controller.abort();
	}, [
		navigation,
		isUpdating,
		address,
		avatar,
		birthday,
		data,
		fullName,
		onNotification,
		onUpdateUser,
	]);

	// Handles
	const handleReset = () => {
		setAvatar(undefined);
		setAvatarTemp(undefined);
		setFullName(undefined);
		setBirthday(undefined);
		setAddress(undefined);
	};
	const handleOpenModalDate = () => setIsModalDate(true);
	const handleCloseModalDate = () => setIsModalDate(false);

	const handleChangeDatePicker = (e: DateTimePickerEvent) => {
		if (e.nativeEvent.timestamp) {
			if (Platform.OS === 'android') {
				setBirthday(e.nativeEvent.timestamp);
			} else {
				setBirthday(e.nativeEvent.timestamp);
			}
		}
	};
	const handleChangeFullName = (value: string) => setFullName(value);
	const handleChangeAddress = (value: string) => setAddress(value);

	const handlePressBirthday = () =>
		Platform.OS === 'ios'
			? handleOpenModalDate()
			: _dateTimePickerByAndroid();
	const handlePressCancelModalDate = () => {
		setBirthday(undefined);
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
	const handlePressUpdateProfile = () => setIsUpdating(true);

	// Validator
	const avatarValidator: ImageSourcePropType = avatar
		? { uri: `${host}/temp/${avatar}` }
		: data.avatar
		? `${host}/images/avatar/${data.avatar}`
		: AvatarDefault;
	const fullNameValidator = fullName !== undefined ? fullName : data.fullName;
	const birthdayValidator = birthday !== undefined ? birthday : data.birthday;
	const addressValidator = address !== undefined ? address : data.address;

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
							<Pressable>
								<Icon
									as={MaterialIcons}
									name="arrow-back"
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
								Thông tin cá nhân
							</Text>
						</HStack>
						<ScrollView
							showsHorizontalScrollIndicator={false}
							showsVerticalScrollIndicator={false}
						>
							<Pressable
								onPress={handlePressUploadAvatar}
								isDisabled={
									isUpdating || avatarTemp !== undefined
								}
							>
								<HStack alignItems="center">
									<Avatar
										source={avatarValidator}
										size="xl"
									/>
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
									value={formatPhoneNumber(data.phoneNumber)}
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
										isUpdating || avatarTemp !== undefined
									}
									value={fullNameValidator}
									onChangeText={handleChangeFullName}
								/>
							</FormControl>
							<Pressable
								onPress={handlePressBirthday}
								isDisabled={
									isUpdating || avatarTemp !== undefined
								}
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
										>
											{format(
												birthdayValidator,
												'dd/MM/yyyy',
											)}
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
										isUpdating || avatarTemp !== undefined
									}
									value={addressValidator}
									onChangeText={handleChangeAddress}
								/>
							</FormControl>
						</ScrollView>
						<Button
							bg="info.500"
							isDisabled={
								isUpdating ||
								(!fullName && !birthday && !address)
							}
							_text={{
								fontSize: 16,
								color: 'white',
								fontWeight: 'semibold',
							}}
							mb={2}
							onPress={handlePressUpdateProfile}
							isLoading={isUpdating}
							isLoadingText="Cập nhập tài khoản"
						>
							Cập nhập tài khoản
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
							value={
								new Date(birthday ? birthday : data.birthday)
							}
							display="spinner"
							minimumDate={new Date(1960, 0, 1)}
							maximumDate={
								new Date(Date.now() - 4 * OneYearMilliseconds)
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
							disabled={birthday === undefined}
							onPress={handleCloseModalDate}
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
