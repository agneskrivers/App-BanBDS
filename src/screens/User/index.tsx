import React, { FunctionComponent, useState } from 'react';
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
	TextInput,
	StatusBar,
	TouchableWithoutFeedback,
	Keyboard,
	StyleSheet,
	View,
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
	useToast,
	Stack,
	KeyboardAvoidingView,
	Spinner,
} from 'native-base';
import { launchImageLibrary } from 'react-native-image-picker';

// Assets
import AvatarDefault from '@assets/images/avatar-default.png';

// Context
import { Context } from '@context';

// Helpers
import { formatPhoneNumber } from '@helpers';

// Interfaces
import type { ICompositeNavigationStacks, IStackParams } from '@interfaces';

// Props
interface Props {
	navigation: ICompositeNavigationStacks<'User'>;
	route: RouteProp<IStackParams, 'User'>;
}

const Index: FunctionComponent<Props> = ({ navigation, route }) => {
	// Constants
	const OneYearMilliseconds = 364 * 24 * 60 * 60 * 1000;

	// States
	const [isUploading, setIsUploading] = useState<boolean>(false);
	const [isCreating, setIsCreating] = useState<boolean>(false);

	const [avatar, setAvatar] = useState<string>();
	const [fullName, setFullName] = useState<string>();
	const [birthday, setBirthday] = useState<number>();
	const [address, setAddress] = useState<string>();

	const [isModalDate, setIsModalDate] = useState<boolean>(false);

	// Hooks
	const _dateTimePickerByAndroid = () => {
		DateTimePickerAndroid.open({
			value: new Date(Date.now()),
			onChange: handleChangeDatePicker,
			mode: 'date',
		});
	};

	const handleOpenModalDate = () => setIsModalDate(true);
	const handleCloseModalDate = () => setIsModalDate(false);

	const handleChangeDatePicker = (e: DateTimePickerEvent) => {
		if (e.nativeEvent.timestamp) {
			setBirthday(e.nativeEvent.timestamp);
		}
	};

	const handlePressBirthday = () =>
		Platform.OS === 'ios'
			? handleOpenModalDate()
			: _dateTimePickerByAndroid();
	const handlePressCancelModalDate = () => {
		setBirthday(undefined);
		setIsModalDate(false);
	};
	const handlePressUploadAvatar = async () => {
		const test = await launchImageLibrary({
			mediaType: 'photo',
		});

		if (!test.didCancel) {
			console.log(test.assets);
		}
	};

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
								Chỉnh sửa thông tin
							</Text>
						</HStack>
						<ScrollView
							showsHorizontalScrollIndicator={false}
							showsVerticalScrollIndicator={false}
						>
							<Pressable
								onPress={handlePressUploadAvatar}
								isDisabled={isCreating}
							>
								<HStack alignItems="center">
									<Avatar source={AvatarDefault} size="xl" />
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
									isDisabled={isCreating}
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
										>
											Vui lòng chọn ngày sinh
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
									isDisabled={isCreating}
								/>
							</FormControl>
						</ScrollView>
						<Button
							bg="info.500"
							isDisabled={
								isCreating ||
								isUploading ||
								(!fullName && !birthday && !address)
							}
							isLoadingText="Đang tạo tài khoản"
							isLoading={isCreating}
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
							value={new Date(birthday ? birthday : Date.now())}
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
