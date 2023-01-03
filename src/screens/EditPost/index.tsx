import React, { FunctionComponent, useState, useRef } from 'react';
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
	useToast,
	ScrollView,
	KeyboardAvoidingView,
} from 'native-base';

// Components
import { FormComponent, LoadingComponent } from '@components';

// Interfaces
import type { ICompositeNavigationStacks, IStackParams } from '@interfaces';

// Props
interface Props {
	navigation: ICompositeNavigationStacks<'EditPost'>;
	route: RouteProp<IStackParams, 'EditPost'>;
}

const Index: FunctionComponent<Props> = ({ navigation, route }) => {
	// States
	const [isAlertRemove, setIsAlertRemove] = useState<boolean>(false);
	const [isAlertSold, setIsAlertSold] = useState<boolean>(false);

	// Ref
	const buttonCancelRemoveRef = useRef<ButtonNative>(null);
	const buttonCancelSoldRef = useRef<ButtonNative>(null);

	// Handles
	const handlePressOpenAlertRemove = () => setIsAlertRemove(true);
	const handlePressCloseAlertRemove = () => setIsAlertRemove(false);
	const handlePressOpenAlertSold = () => setIsAlertSold(true);
	const handlePressCloseAlertSold = () => setIsAlertSold(false);

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
							borderBottomColor="gray.300"
							borderBottomWidth={1}
							mb={4}
						>
							<HStack alignItems="center">
								<Pressable>
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
							<Pressable onPress={handlePressOpenAlertRemove}>
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
						>
							<FormComponent.Post
								status="edit"
								data={route.params.data}
								onSold={handlePressOpenAlertSold}
							/>
						</ScrollView>
					</Box>
				</TouchableWithoutFeedback>
			</KeyboardAvoidingView>
			<AlertDialog
				leastDestructiveRef={buttonCancelRemoveRef}
				isOpen={isAlertRemove}
				onClose={handlePressCloseAlertRemove}
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
								onPress={handlePressCloseAlertRemove}
								ref={buttonCancelRemoveRef}
							>
								Hủy
							</Button>
							<Button
								colorScheme="danger"
								onPress={handlePressCloseAlertRemove}
								_text={{
									fontWeight: 'medium',
								}}
							>
								Xóa
							</Button>
						</Button.Group>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog>
			<AlertDialog
				leastDestructiveRef={buttonCancelSoldRef}
				isOpen={isAlertSold}
				onClose={handlePressCloseAlertSold}
			>
				<AlertDialog.Content>
					<AlertDialog.CloseButton />
					<AlertDialog.Header>Tin đăng đã bán</AlertDialog.Header>
					<AlertDialog.Body>
						Bạn xác nhận tin đăng này đã bán và tin đăng này sẽ
						không hiện lên trang nữa?
					</AlertDialog.Body>
					<AlertDialog.Footer>
						<Button.Group space={2}>
							<Button
								variant="unstyled"
								colorScheme="coolGray"
								onPress={handlePressCloseAlertSold}
								ref={buttonCancelSoldRef}
							>
								Hủy
							</Button>
							<Button
								colorScheme="success"
								onPress={handlePressCloseAlertSold}
								_text={{
									fontWeight: 'medium',
								}}
							>
								Đã bán
							</Button>
						</Button.Group>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog>
		</>
	);
};

export default Index;
