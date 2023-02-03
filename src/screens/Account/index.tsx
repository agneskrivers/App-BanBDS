import React, {
	FunctionComponent,
	useState,
	useEffect,
	useContext,
} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
	StatusBar,
	Linking,
	ImageSourcePropType,
	Platform,
} from 'react-native';
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

// Components
import { LoadingComponent } from '@components';

// Config
import { host, LinkDefault } from '@configs';

// Context
import { Context } from '@context';

// Helpers
import { storages } from '@helpers';

// Interfaces
import type {
	ICompositeNavigationBottomTabs,
	ILinkJSON,
	IPostStatus,
} from '@interfaces';

// Props
interface Props {
	navigation: ICompositeNavigationBottomTabs<'Account'>;
}

const Index: FunctionComponent<Props> = ({ navigation }) => {
	// States
	const [isLogout, setIsLogout] = useState<boolean>(false);

	const [links, setLinks] = useState<ILinkJSON | null>(null);

	// Hooks
	const { onLogout, user } = useContext(Context);

	// Effect
	useEffect(() => {
		const getData = async () => {
			const getLinks = await storages.get.obj<ILinkJSON>('links');

			if (getLinks) {
				setLinks(getLinks);
			}
		};

		getData();
	}, []);
	useEffect(() => {
		if (!user) {
			navigation.navigate('Home');
		}
	}, [navigation, user]);
	useEffect(() => {
		let id: NodeJS.Timeout;

		if (isLogout) {
			onLogout();

			id = setTimeout(() => {
				setIsLogout(false);
				navigation.navigate('Home');
			}, 1000);
		}

		return () => clearTimeout(id);
	}, [isLogout, navigation, onLogout]);

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
		handleOpenInApp(!links || !links.Contact ? LinkDefault : links.Contact);
	const handlePressUserManual = () =>
		handleOpenInApp(!links || !links.Guide ? LinkDefault : links.Guide);
	const handlePressMyPosts = (status: Exclude<IPostStatus, 'sold'>) =>
		navigation.navigate('MyPosts', { status });
	const handlePressLogout = () => setIsLogout(true);
	const handlePressProfile = () => {
		if (user) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { posts: _, ...data } = user;

			navigation.navigate('Profile', {
				data,
			});
		}
	};

	if (!user) return <LoadingComponent />;

	const avatar: ImageSourcePropType = user.avatar
		? { uri: `${host}/images/avatar/${user.avatar}` }
		: AvatarDefault;

	return (
		<>
			<StatusBar barStyle="dark-content" />
			<Box px={4} safeArea flex={1}>
				<Pressable
					onPress={handlePressProfile}
					isDisabled={isLogout}
					mt={Platform.OS === 'android' ? 4 : 0}
				>
					<HStack alignItems="center">
						<Avatar
							source={avatar}
							alignSelf="center"
							bg="gray.300"
							w={16}
							h={16}
						/>
						<Box ml={4}>
							<Text fontSize={20} fontWeight="bold">
								{user.fullName}
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
						<Pressable onPress={() => handlePressMyPosts('accept')}>
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
										{`Tin đã đăng (${user.posts.accept})`}
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
						<Pressable
							onPress={() => handlePressMyPosts('pending')}
						>
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
										{`Tin chờ duyệt (${user.posts.pending})`}
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
					_text={{
						fontSize: 16,
						fontWeight: 'bold',
						color: 'dark.400',
					}}
					isLoading={isLogout}
					isDisabled={isLogout}
					isLoadingText="Đăng xuất"
					onPress={handlePressLogout}
				>
					Đăng xuất
				</Button>
			</Box>
		</>
	);
};

export default Index;
