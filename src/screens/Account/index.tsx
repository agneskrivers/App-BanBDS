import React, {
	FunctionComponent,
	useState,
	useEffect,
	useContext,
} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StatusBar, Linking } from 'react-native';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import {
	Text,
	Box,
	Icon,
	HStack,
	Avatar,
	Pressable,
	Button,
} from 'native-base';

// Assets
import AvatarDefault from '@assets/images/avatar-default.png';

// Context
import { Context } from '@context';

// Interfaces
import type { ICompositeNavigationBottomTabs } from '@interfaces';

// Props
interface Props {
	navigation: ICompositeNavigationBottomTabs<'Account'>;
}

const Index: FunctionComponent<Props> = ({ navigation }) => {
	// Handle
	const handleOpenInApp = async (uri: string) => {
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

	const handlePressSupportCenter = () =>
		handleOpenInApp('https://claimether.com');
	const handlePressUserManual = () =>
		handleOpenInApp('https://claimether.com');
	const handlePressMyPosts = () => navigation.navigate('MyPosts');

	return (
		<>
			<StatusBar barStyle="dark-content" />
			<Box px={4} safeArea flex={1}>
				<Pressable>
					<HStack alignItems="center">
						<Avatar
							source={AvatarDefault}
							alignSelf="center"
							bg="gray.300"
							w={16}
							h={16}
						/>
						<Box ml={4}>
							<Text fontSize={20} fontWeight="bold">
								Huy Hoàng
							</Text>
							<Text
								fontSize={12}
								fontWeight="medium"
								color="info.600"
							>
								Trang hồ sơ cá nhân
							</Text>
						</Box>
					</HStack>
				</Pressable>
				<Box mt={6}>
					<Text fontSize={17} fontWeight="semibold">
						Quản lý tin đăng
					</Text>
					<Box pl={4}>
						<Pressable onPress={handlePressMyPosts}>
							<HStack alignItems="center">
								<Icon
									as={MaterialCommunityIcons}
									name="file"
									size="lg"
									color="gray.400"
								/>
								<HStack
									alignItems="center"
									flex={1}
									justifyContent="space-between"
									ml={3}
									borderBottomColor="gray.200"
									borderBottomWidth={1}
									py={4}
								>
									<Text
										fontWeight="light"
										fontSize={15}
										color="gray.700"
									>
										Tin đã đăng (10)
									</Text>
									<Icon
										as={MaterialIcons}
										name="arrow-forward-ios"
										size="xs"
										color="gray.400"
										mr={3}
									/>
								</HStack>
							</HStack>
						</Pressable>
						<Pressable>
							<HStack alignItems="center">
								<Icon
									as={MaterialCommunityIcons}
									name="clock-alert"
									size="lg"
									color="gray.400"
								/>
								<HStack
									alignItems="center"
									flex={1}
									py={4}
									justifyContent="space-between"
									ml={3}
								>
									<Text
										fontWeight="light"
										fontSize={15}
										color="gray.700"
									>
										Tin chờ duyệt (1)
									</Text>
									<Icon
										as={MaterialIcons}
										name="arrow-forward-ios"
										size="xs"
										color="gray.400"
										mr={3}
									/>
								</HStack>
							</HStack>
						</Pressable>
					</Box>
				</Box>
				<Box mt={6}>
					<Text fontSize={17} fontWeight="semibold">
						Hướng dẫn
					</Text>
					<Box pl={4}>
						<Pressable onPress={handlePressSupportCenter}>
							<HStack alignItems="center">
								<Icon
									as={MaterialIcons}
									name="perm-phone-msg"
									size="lg"
									color="gray.400"
								/>
								<HStack
									alignItems="center"
									flex={1}
									justifyContent="space-between"
									ml={3}
									borderBottomColor="gray.200"
									borderBottomWidth={1}
									py={4}
								>
									<Text
										fontWeight="light"
										fontSize={15}
										color="gray.700"
									>
										Trung tâm hỗ trợ
									</Text>
									<Icon
										as={MaterialIcons}
										name="arrow-forward-ios"
										size="xs"
										color="gray.400"
										mr={3}
									/>
								</HStack>
							</HStack>
						</Pressable>
						<Pressable onPress={handlePressUserManual}>
							<HStack alignItems="center">
								<Icon
									as={Ionicons}
									name="ios-newspaper-outline"
									size="lg"
									color="gray.400"
								/>
								<HStack
									alignItems="center"
									flex={1}
									py={4}
									justifyContent="space-between"
									ml={3}
								>
									<Text
										fontWeight="light"
										fontSize={15}
										color="gray.700"
									>
										Hướng dẫn sử dụng
									</Text>
									<Icon
										as={MaterialIcons}
										name="arrow-forward-ios"
										size="xs"
										color="gray.400"
										mr={3}
									/>
								</HStack>
							</HStack>
						</Pressable>
					</Box>
				</Box>
				<Button
					variant="outline"
					mt={10}
					borderRadius="lg"
					borderColor="gray.400"
				>
					<Text fontSize={16} fontWeight="bold" color="dark.400">
						Đăng xuất
					</Text>
				</Button>
			</Box>
		</>
	);
};

export default Index;
