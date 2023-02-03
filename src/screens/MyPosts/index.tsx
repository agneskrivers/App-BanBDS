import React, {
	FunctionComponent,
	useState,
	useEffect,
	useContext,
	useCallback,
} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { StyleSheet, Platform } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import {
	Box,
	Text,
	HStack,
	Icon,
	Button,
	FlatList,
	Pressable,
} from 'native-base';

// Components
import {
	PostComponent,
	LoadingComponent,
	NoDataComponent,
	FooterFlatListComponent,
} from '@components';

// Configs
import { ListPostCompactDefault } from '@configs';

// Context
import { Context } from '@context';

// Helpers
import { storages, renewTokenDevice } from '@helpers';

// Services
import services from '@services';

// Interfaces
import type {
	IStackParams,
	ICompositeNavigationStacks,
	IPostType,
	IPostCompact,
	IPostStatus,
} from '@interfaces';

// Type
type FetchData = (
	signal: AbortSignal,
	status: Exclude<IPostStatus, 'sold'>,
	type: IPostType,
	page: number,
	tokenDevice?: string,
) => Promise<void>;

// Props
interface Props {
	navigation: ICompositeNavigationStacks<'MyPosts'>;
	route: RouteProp<IStackParams, 'MyPosts'>;
}

const Index: FunctionComponent<Props> = ({ navigation, route }) => {
	// States
	const [isLoaded, setIsLoaded] = useState<boolean>(false);
	const [isLoadMore, setIsLoadMore] = useState<boolean>(false);
	const [isType, setIsType] = useState<boolean>(false);

	const [type, setType] = useState<IPostType>('sell');
	const [data, setData] = useState<IPostCompact[] | null>(null);

	const [pages, setPages] = useState<number | null>(null);
	const [page, setPage] = useState<number>(1);

	// Hooks
	const { isNetwork, user, onNotification, onLogout } = useContext(Context);

	const fetchData: FetchData = useCallback(
		async (signal, status, typePost, pagePost, tokenDevice) => {
			let device: string | undefined | null = tokenDevice;

			if (!device) {
				device = await storages.get.str('device');
			}

			if (!device) {
				device = await renewTokenDevice(signal);
			}

			if (!device) throw new Error();

			const userToken = await storages.get.str('user');

			if (!userToken) {
				onNotification(
					'toast-screen-my-posts-fetch-data-no-user-token',
					'Không thể thực hiện',
					undefined,
					'error',
				);

				setTimeout(() => navigation.navigate('Login'));

				return;
			}

			const result = await services.posts.myShortlist(
				signal,
				device,
				userToken,
				pagePost,
				status,
				typePost,
			);

			if (!result) throw new Error();

			if (result === 'UnauthorizedUser') {
				onLogout();

				onNotification(
					'toast-screen-my-posts-fetch-data-no-user-token',
					'Không thể thực hiện',
					undefined,
					'error',
				);

				setTimeout(() => navigation.navigate('Login'));

				return;
			}

			if (result === 'UnauthorizedDevice') {
				if (tokenDevice) throw new Error();

				const renewToken = await renewTokenDevice(signal);

				if (!renewToken) throw new Error();

				return fetchData(
					signal,
					status,
					typePost,
					pagePost,
					renewToken,
				);
			}

			if (result === 'BadRequest') {
				onNotification(
					'toast-screen-my-posts-result-bad-request',
					'Có lỗi xảy ra!',
					undefined,
					'warning',
				);

				setData([]);
				setPages(1);

				return;
			}

			setData(result.posts);
			setPages(result.pages);
		},
		[onNotification, navigation, onLogout],
	);

	// Effects
	useEffect(() => {
		const getData = async () => {
			const checkLogin = await storages.get.str('user');

			if (!checkLogin || !user) {
				onLogout();
				navigation.navigate('Login');
			}
		};

		getData();
	}, [navigation, onLogout, user]);
	useEffect(() => {
		const controller = new AbortController();

		if (!isLoaded) {
			if (isNetwork) {
				fetchData(controller.signal, route.params.status, type, 1)
					.catch(() => {
						onNotification(
							'toast-screen-my-posts-error',
							'Vui lòng thử lại sau!',
							'Máy chủ bị lỗi',
							'error',
						);

						setData([]);
						setPages(1);
					})
					.finally(() => setIsLoaded(true));
			} else {
				onNotification(
					'toast-screen-my-posts-no-network',
					'Vui lòng kết nối mạng',
					'Không có mạng',
					'warning',
				);

				navigation.navigate('Home');
			}
		}

		return () => controller.abort();
	}, [
		fetchData,
		onNotification,
		route.params.status,
		type,
		isNetwork,
		isLoaded,
		navigation,
	]);
	useEffect(() => {
		const controller = new AbortController();

		if (isType) {
			if (isNetwork) {
				fetchData(controller.signal, route.params.status, type, 1)
					.catch(() => {
						onNotification(
							'toast-screen-my-posts-error',
							'Vui lòng thử lại sau!',
							'Máy chủ bị lỗi',
							'error',
						);

						setData([]);
						setPages(1);
					})
					.finally(() => setIsType(false));
			} else {
				onNotification(
					'toast-screen-my-posts-no-network',
					'Vui lòng kết nối mạng',
					'Không có mạng',
					'warning',
				);

				navigation.navigate('Home');
			}
		}

		return () => controller.abort();
	}, [
		fetchData,
		isNetwork,
		isType,
		navigation,
		onNotification,
		route.params.status,
		type,
	]);
	useEffect(() => {
		const controller = new AbortController();

		if (isLoadMore) {
			if (isNetwork) {
				fetchData(
					controller.signal,
					route.params.status,
					type,
					page + 1,
				)
					.then(() => setPage(prePage => prePage + 1))
					.catch(() => {
						onNotification(
							'toast-screen-my-posts-error',
							'Vui lòng thử lại sau!',
							'Máy chủ bị lỗi',
							'error',
						);
					})
					.finally(() => setIsLoadMore(false));
			} else {
				onNotification(
					'toast-screen-my-posts-no-network',
					'Vui lòng kết nối mạng',
					'Không có mạng',
					'warning',
				);

				navigation.navigate('Home');
			}
		}

		return () => controller.abort();
	}, [
		fetchData,
		isNetwork,
		isLoadMore,
		page,
		navigation,
		onNotification,
		route.params.status,
		type,
	]);

	// Handles
	const handleLoadMore = () => {
		if (pages && pages > 0 && pages !== page) {
			setIsLoadMore(true);
		}
	};

	const handlePressType = (value: IPostType) => {
		setType(value);
		setIsType(true);
	};
	const handlePressGoBack = () => {
		if (navigation.canGoBack()) {
			navigation.goBack();
		} else {
			navigation.navigate('Account');
		}
	};
	const handlePressMyPost = (postID: number) =>
		navigation.navigate('MyPost', { postID });

	return (
		<Box bg="white" flexGrow={1}>
			<Box
				safeAreaTop
				px={4}
				pb={2}
				pt={Platform.OS === 'android' ? 2 : 0}
				borderBottomColor="gray.300"
				borderBottomWidth={1}
				mb={4}
				shadow={0.5}
				bg="gray.50"
			>
				<HStack alignItems="center" mb={2}>
					<Pressable onPress={handlePressGoBack}>
						<Icon
							as={MaterialCommunityIcons}
							name="arrow-left"
							size="lg"
							mr={4}
						/>
					</Pressable>
					<Text fontSize={18} fontWeight="bold" color="dark.300">
						{`Quản lý tin đăng ${
							route.params.status === 'accept'
								? 'đã đăng'
								: 'chờ duyệt'
						} `}
					</Text>
				</HStack>
				<HStack alignItems="center">
					<Button
						bgColor={type === 'sell' ? 'blue.500' : 'white'}
						borderRadius="full"
						mr={1}
						flex={1}
						variant={type === 'sell' ? 'solid' : 'outline'}
						borderColor="blue.500"
						onPress={() => handlePressType('sell')}
					>
						<Text
							color={type === 'sell' ? 'white' : 'blue.500'}
							fontWeight={type === 'sell' ? 'semibold' : 'medium'}
							fontSize={16}
						>
							Mua Bán
						</Text>
					</Button>
					<Button
						bgColor={type === 'rent' ? 'blue.500' : 'white'}
						ml={1}
						borderRadius="full"
						flex={1}
						variant={type === 'rent' ? 'solid' : 'outline'}
						borderColor="blue.500"
						onPress={() => handlePressType('rent')}
					>
						<Text
							color={type === 'rent' ? 'white' : 'blue.500'}
							fontSize={16}
							fontWeight={type === 'rent' ? 'semibold' : 'medium'}
						>
							Cho thuê
						</Text>
					</Button>
				</HStack>
			</Box>
			<FlatList
				data={data ? data : ListPostCompactDefault}
				keyExtractor={({ id }) => `${route.params.status}-${id}`}
				contentContainerStyle={styles.container}
				renderItem={({ item, index }) => (
					<Pressable
						px={4}
						my={2}
						mt={index === 0 ? 4 : 2}
						onPress={() => handlePressMyPost(item.postID)}
					>
						<PostComponent
							data={item}
							isLoaded={isLoaded && !isLoadMore && !isType}
						/>
					</Pressable>
				)}
				ListFooterComponent={
					<>
						<FooterFlatListComponent
							isLoad={
								pages !== null && pages > 0 && pages !== page
							}
						/>
						<Box safeAreaBottom m={0} p={0} />
					</>
				}
				ListEmptyComponent={
					isLoaded && !isLoadMore && !isType ? (
						<NoDataComponent message="Không có bài đăng" />
					) : (
						<LoadingComponent />
					)
				}
				onEndReachedThreshold={0.5}
				onEndReached={handleLoadMore}
			/>
		</Box>
	);
};

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
	},
});

export default Index;
