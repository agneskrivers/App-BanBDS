import React, {
	FunctionComponent,
	useState,
	useRef,
	useContext,
	useEffect,
} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { RouteProp } from '@react-navigation/native';
import {
	StatusBar,
	Keyboard,
	TouchableWithoutFeedback,
	Platform,
	Button as ButtonNative,
} from 'react-native';
import {
	Text,
	Box,
	HStack,
	Pressable,
	Icon,
	Button,
	AlertDialog,
	ScrollView,
	KeyboardAvoidingView,
	useDisclose,
} from 'native-base';

// Components
import { FormComponent } from '@components';

// Context
import { Context } from '@context';

// Helpers
import { storages, renewTokenDevice } from '@helpers';

// Services
import services from '@services';

// Interfaces
import type { ICompositeNavigationStacks, IStackParams } from '@interfaces';

// Props
interface Props {
	navigation: ICompositeNavigationStacks<'EditPost'>;
	route: RouteProp<IStackParams, 'EditPost'>;
}

const Index: FunctionComponent<Props> = ({ navigation, route }) => {
	// States
	const [isRemove, setIsRemove] = useState<boolean>(false);

	// Ref
	const buttonCancelRemoveRef = useRef<ButtonNative>(null);

	// Context
	const { onNotification, isNetwork } = useContext(Context);
	const { isOpen, onOpen, onClose } = useDisclose();

	// Effects
	useEffect(() => {
		const controller = new AbortController();

		const getData = async (
			signal: AbortSignal,
			postID: number,
			tokenDevice?: string,
		): Promise<void> => {
			const user = await storages.get.str('user');

			if (!user) {
				setIsRemove(false);

				onNotification(
					'toast-screen-edit-post-no-user-token',
					'Không thể thực hiện',
					undefined,
					'error',
				);

				navigation.navigate('Home');

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

			const result = await services.posts.remove(
				signal,
				device,
				user,
				postID,
			);

			if (!result) throw new Error();

			if (result === 'UnauthorizedUser') {
				setIsRemove(false);

				onNotification(
					'toast-screen-edit-post-no-user-token',
					'Không thể thực hiện',
					undefined,
					'error',
				);

				navigation.navigate('Home');

				return;
			}

			if (result === 'UnauthorizedDevice') {
				if (tokenDevice) throw new Error();

				const renewToken = await renewTokenDevice(signal);

				if (!renewToken) throw new Error();

				return getData(signal, postID, renewToken);
			}

			if (result === 'BadRequest') {
				setIsRemove(false);

				onNotification(
					'toast-screen-edit-post-remove-bad-request',
					'Vui lòng thử lại sau!',
					'Có lỗi xảy ra',
					'warning',
				);

				return;
			}

			setIsRemove(false);

			onNotification(
				'toast-screen-edit-post-remove-success',
				'Xóa thành công',
			);

			navigation.navigate('MyPosts', { status: 'accept' });
		};

		if (isRemove) {
			if (isNetwork) {
				getData(controller.signal, route.params.data.postID)
					.catch(() => {
						setIsRemove(false);

						onNotification(
							'toast-screen-edit-post-error',
							'Vui lòng thử lại sau!',
							'Máy chủ bị lỗi',
							'error',
						);
					})
					.finally(() => onClose());
			} else {
				setIsRemove(false);
				onClose();

				onNotification(
					'toast-screen-edit-post-no-network',
					'Vui lòng kết nối mạng!',
					'Không có mạng',
					'warning',
				);
			}
		}

		return () => controller.abort();
	}, [isNetwork, isRemove, navigation, route, onNotification, onClose]);

	// Handles
	const handlePressRemove = () => onOpen();

	const handlePressAcceptRemove = () => {
		setIsRemove(true);
	};
	const handlePressGoBack = () => {
		if (navigation.canGoBack()) {
			navigation.goBack();
		} else {
			navigation.navigate('MyPosts', {
				status:
					route.params.data.status === 'sold'
						? 'accept'
						: route.params.data.status,
			});
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
					<Box flex={1} bg="white" safeAreaBottom>
						<HStack
							alignItems="center"
							justifyContent="space-between"
							safeAreaTop
							px={4}
							pb={4}
							pt={Platform.OS === 'android' ? 4 : 0}
							borderBottomColor="gray.300"
							borderBottomWidth={1}
						>
							<HStack alignItems="center">
								<Pressable onPress={handlePressGoBack}>
									<Icon
										as={MaterialCommunityIcons}
										name="arrow-left"
										size="lg"
										mr={4}
									/>
								</Pressable>
								<Text
									fontSize={18}
									fontWeight="bold"
									color="dark.300"
								>
									Chỉnh sửa tin
								</Text>
							</HStack>
							<Pressable onPress={handlePressRemove}>
								<Icon
									as={MaterialCommunityIcons}
									name="trash-can-outline"
									size="lg"
									color="danger.500"
								/>
							</Pressable>
						</HStack>
						<ScrollView
							showsHorizontalScrollIndicator={false}
							showsVerticalScrollIndicator={false}
							px={4}
							flex={1}
						>
							<FormComponent.Post
								status="edit"
								data={route.params.data}
							/>
						</ScrollView>
					</Box>
				</TouchableWithoutFeedback>
			</KeyboardAvoidingView>
			<AlertDialog
				leastDestructiveRef={buttonCancelRemoveRef}
				isOpen={isOpen}
				onClose={onClose}
			>
				<AlertDialog.Content>
					<AlertDialog.CloseButton />
					<AlertDialog.Header>Xóa bài đăng</AlertDialog.Header>
					<AlertDialog.Body>
						Bạn có chắc khi xóa bài viết này không?
					</AlertDialog.Body>
					<AlertDialog.Footer>
						<Button.Group space={2}>
							<Button
								variant="unstyled"
								colorScheme="coolGray"
								onPress={onClose}
								ref={buttonCancelRemoveRef}
							>
								Hủy
							</Button>
							<Button
								colorScheme="danger"
								onPress={handlePressAcceptRemove}
								_text={{
									fontWeight: 'medium',
								}}
								isLoading={isRemove}
								isLoadingText="Vui lòng chờ"
							>
								Xác nhận
							</Button>
						</Button.Group>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog>
		</>
	);
};

export default Index;
