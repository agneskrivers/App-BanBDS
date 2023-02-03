import React, {
	FunctionComponent,
	useState,
	useEffect,
	useCallback,
	useContext,
} from 'react';
import {
	NativeSyntheticEvent,
	NativeScrollEvent,
	RefreshControl,
	StyleSheet,
} from 'react-native';
import { Box, Text, Pressable, Image, FlatList, Skeleton } from 'native-base';

// Components
import {
	HeaderComponent,
	NewsComponent,
	NoDataComponent,
	FooterFlatListComponent,
	LoadingComponent,
} from '@components';

// Configs
import { ListNewsCompactDefault } from '@configs';

// Context
import { Context } from '@context';

// Helpers
import { storages, renewTokenDevice } from '@helpers';

// Services
import services from '@services';

// Interfaces
import type {
	INewsCompact,
	IHotNewsCompact,
	ICompositeNavigationBottomTabs,
} from '@interfaces';

// Interfaces
interface DataStorage {
	hot: IHotNewsCompact | null;
	news: INewsCompact[];
	pages: number;
	region: string;
}

// Props
interface Props {
	navigation: ICompositeNavigationBottomTabs<'News'>;
}

const Index: FunctionComponent<Props> = ({ navigation }) => {
	// States
	const [isLoaded, setIsLoaded] = useState<boolean>(false);

	const [isScroll, setIsScroll] = useState<boolean>(false);
	const [isRefresh, setIsRefresh] = useState<boolean>(false);
	const [isLoadMore, setIsLoadMore] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const [hotNews, setHotNews] = useState<IHotNewsCompact | null>(null);
	const [news, setNews] = useState<INewsCompact[] | null>(null);

	const [pages, setPages] = useState<number | null>(null);
	const [page, setPage] = useState<number>(1);

	const [region, setRegion] = useState<string>();

	// Hooks
	const { location, onNotification, isNetwork, onLocation } =
		useContext(Context);

	const getDataStorage = useCallback(async (province: string) => {
		try {
			const data = await storages.get.obj<DataStorage>('news');

			if (!data || data.region !== province) throw new Error();

			setIsLoaded(true);
			setHotNews(data.hot);
			setNews(data.news);
			setPages(data.pages);
		} catch (_) {
			setIsLoaded(true);
			setHotNews(null);
			setNews([]);
			setPages(0);
		}
	}, []);

	// Effects
	useEffect(() => {
		const controller = new AbortController();

		const getData = async (
			signal: AbortSignal,
			tokenDevice?: string,
		): Promise<void> => {
			let token: string | null | undefined = tokenDevice;

			if (!token) {
				token = await storages.get.str('device');
			}

			if (!token) {
				token = await renewTokenDevice(signal);
			}

			if (!token) throw new Error('Error');

			const data = await services.news.shortlist(
				signal,
				token,
				location,
				1,
			);

			if (!data || data === 'BadRequest') throw new Error('Error');

			if (data === 'UnauthorizedDevice') {
				if (tokenDevice) throw new Error();

				const renewToken = await renewTokenDevice(signal);

				if (!renewToken) throw new Error('Error');

				return getData(signal, renewToken);
			}

			const dataStorage: DataStorage = {
				...data,
				region: location,
			};

			await storages.set('news', JSON.stringify(dataStorage));

			setIsLoaded(true);
			setRegion(location);
			setHotNews(data.hot);
			setNews(data.news);
			setPages(data.pages);
		};

		if (!isLoaded) {
			if (isNetwork) {
				getData(controller.signal).catch(() =>
					getDataStorage(location),
				);
			} else {
				getDataStorage(location);
			}
		}

		return () => controller.abort();
	}, [isNetwork, isLoaded, location, onNotification, getDataStorage]);
	useEffect(() => {
		const controller = new AbortController();

		const getData = async (
			signal: AbortSignal,
			tokenDevice?: string,
		): Promise<void> => {
			let token: string | null | undefined = tokenDevice;

			if (!token) {
				token = await storages.get.str('device');
			}

			if (!token) {
				token = await renewTokenDevice(signal);
			}

			if (!token) throw new Error();

			const data = await services.news.shortlist(
				signal,
				token,
				location,
				1,
			);

			if (!data) throw new Error();

			if (data === 'UnauthorizedDevice') {
				if (tokenDevice) throw new Error();

				const renewToken = await renewTokenDevice(signal);

				if (!renewToken) throw new Error('Error');

				return getData(signal, renewToken);
			}

			if (data === 'BadRequest') {
				setIsRefresh(false);

				onNotification(
					'toast-screen-news-refresh-bad-request',
					'Vui lòng thử lại!',
					'Có lỗi xảy ra',
					'warning',
				);

				return;
			}

			setIsRefresh(false);
			setHotNews(data.hot);
			setNews(data.news);
			setPages(data.pages);
		};

		if (isRefresh) {
			if (isNetwork) {
				getData(controller.signal).catch(() => {
					setIsRefresh(false);

					onNotification(
						'toast-screen-news-error',
						'Vui lòng thử lại!',
						'Máy chủ bị lỗi',
						'error',
					);
				});
			} else {
				setIsRefresh(false);

				onNotification(
					'toast-screen-news-no-network',
					'Vui lòng kết nối mạng!',
					'Không có kết nối mạng',
					'warning',
				);
			}
		}

		return () => controller.abort();
	}, [isNetwork, isRefresh, location, onNotification]);
	useEffect(() => {
		const controller = new AbortController();

		const getData = async (
			signal: AbortSignal,
			tokenDevice?: string,
		): Promise<void> => {
			let token: string | null | undefined = tokenDevice;

			if (!token) {
				token = await storages.get.str('device');
			}

			if (!token) {
				token = await renewTokenDevice(signal);
			}

			if (!token) throw new Error();

			const data = await services.news.shortlist(
				signal,
				token,
				location,
				1,
			);

			if (!data) throw new Error();

			if (data === 'UnauthorizedDevice') {
				if (tokenDevice) throw new Error();

				const renewToken = await renewTokenDevice(signal);

				if (!renewToken) throw new Error('Error');

				return getData(signal, renewToken);
			}

			if (data === 'BadRequest') {
				setIsLoading(false);

				onNotification(
					'toast-screen-news-loading-bad-request',
					'Vui lòng thử lại!',
					'Có lỗi xảy ra',
					'warning',
				);

				return;
			}

			setRegion(location);
			setIsLoading(false);
			setHotNews(data.hot);
			setNews(data.news);
			setPages(data.pages);
		};

		if (isLoading && region !== location) {
			if (isNetwork) {
				getData(controller.signal).catch(() => {
					setIsLoading(false);
					onLocation(region ? region : 'HN');

					onNotification(
						'toast-screen-news-error',
						'Vui lòng thử lại!',
						'Máy chủ bị lỗi',
						'error',
					);
				});
			} else {
				setIsLoading(false);
				onLocation(region ? region : 'HN');

				onNotification(
					'toast-screen-news-no-network',
					'Vui lòng kết nối mạng!',
					'Không có kết nối mạng',
					'warning',
				);
			}
		}

		return () => controller.abort();
	}, [
		isNetwork,
		isLoading,
		location,
		region,
		onNotification,
		getDataStorage,
		onLocation,
	]);
	useEffect(() => {
		const controller = new AbortController();

		const getData = async (
			signal: AbortSignal,
			tokenDevice?: string,
		): Promise<void> => {
			let token: string | null | undefined = tokenDevice;

			if (!token) {
				token = await storages.get.str('device');
			}

			if (!token) {
				token = await renewTokenDevice(signal);
			}

			if (!token) throw new Error();

			const data = await services.news.shortlist(
				signal,
				token,
				location,
				page + 1,
			);

			if (!data) throw new Error();

			if (data === 'UnauthorizedDevice') {
				if (tokenDevice) throw new Error();

				const renewToken = await renewTokenDevice(signal);

				if (!renewToken) throw new Error('Error');

				return getData(signal, renewToken);
			}

			if (data === 'BadRequest') {
				setIsLoadMore(false);

				onNotification(
					'toast-screen-news-loading-bad-request',
					'Vui lòng thử lại!',
					'Có lỗi xảy ra',
					'warning',
				);

				return;
			}

			setIsLoadMore(false);
			setNews(data.news);
		};

		if (isLoadMore) {
			if (isNetwork) {
				getData(controller.signal)
					.then(() => setPage(prePage => prePage + 1))
					.catch(() => {
						setIsLoadMore(false);

						onNotification(
							'toast-screen-news-error',
							'Vui lòng thử lại!',
							'Máy chủ bị lỗi',
							'error',
						);
					});
			} else {
				setIsLoadMore(false);

				onNotification(
					'toast-screen-news-no-network',
					'Vui lòng kết nối mạng!',
					'Không có kết nối mạng',
					'warning',
				);
			}
		}

		return () => controller.abort();
	}, [isLoadMore, location, page, onNotification, isNetwork]);
	useEffect(() => {
		if (region !== undefined && region !== location && !isLoading) {
			setIsLoading(true);
		}
	}, [location, region, isLoading]);

	// Handle
	const handleRefresh = () => setIsRefresh(true);
	const handleLoadMore = () => {
		if (pages !== null && pages > 0 && pages !== page) {
			setIsLoadMore(true);
		}
	};
	const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
		const { y } = e.nativeEvent.contentOffset;

		if (y <= 100) return setIsScroll(false);

		setIsScroll(true);
	};

	const handlePressNews = (id: string) =>
		navigation.navigate('NewsInfo', { id });

	// Elements
	const HeaderFlatListLoaded = () =>
		!hotNews ? null : (
			<Box my={5} px={4}>
				<Pressable onPress={() => handlePressNews(hotNews.id)}>
					<Box
						pb={2}
						bg="white"
						borderRadius={8}
						shadow={9}
						borderTopLeftRadius={15}
						borderTopRightRadius={15}
					>
						<Skeleton
							h={200}
							borderRadius="xl"
							isLoaded={isLoaded && !isLoading && !isRefresh}
						>
							<Image
								borderRadius="xl"
								source={{
									uri: hotNews.thumbnail,
								}}
								width="100%"
								h={200}
								alt={`Image ${hotNews.title}`}
								resizeMode="cover"
							/>
						</Skeleton>
						<Box p={4}>
							<Skeleton.Text
								lines={2}
								fontSize={17}
								isLoaded={isLoaded && !isLoading && !isRefresh}
							>
								<Text
									fontWeight="bold"
									fontSize={17}
									color="secondary.700"
									numberOfLines={2}
								>
									{decodeURI(hotNews.title)}
								</Text>
							</Skeleton.Text>
							<Skeleton.Text
								mt={2}
								lines={4}
								fontSize={14}
								lineHeight={24}
								isLoaded={isLoaded && !isLoading && !isRefresh}
							>
								<Text
									fontSize={14}
									color="dark.500"
									mt="2"
									lineHeight={24}
									numberOfLines={4}
								>
									{decodeURI(hotNews.description)}
								</Text>
							</Skeleton.Text>
						</Box>
					</Box>
				</Pressable>
			</Box>
		);
	const HeaderFlatListNoLoaded = () => (
		<Box my={5} px={4}>
			<Pressable>
				<Box
					pb={2}
					bg="white"
					borderRadius={8}
					shadow={9}
					borderTopLeftRadius={15}
					borderTopRightRadius={15}
				>
					<Skeleton h={200} borderRadius="xl">
						<Box h={200} />
					</Skeleton>
					<Box p={4}>
						<Skeleton.Text lines={2} fontSize={17}>
							<Text
								fontWeight="bold"
								fontSize={17}
								color="secondary.700"
								numberOfLines={2}
							/>
						</Skeleton.Text>
						<Skeleton.Text
							mt={2}
							lines={4}
							fontSize={14}
							lineHeight={24}
						>
							<Text
								fontSize={14}
								color="dark.500"
								mt="2"
								lineHeight={24}
								numberOfLines={4}
							/>
						</Skeleton.Text>
					</Box>
				</Box>
			</Pressable>
		</Box>
	);
	const HeaderFlatList = () => (
		<>
			<HeaderComponent isDark={isScroll} />
			{isLoaded ? <HeaderFlatListLoaded /> : <HeaderFlatListNoLoaded />}
		</>
	);

	return (
		<Box bg="white" flexGrow={1} position="relative">
			<FlatList
				data={news ? news : ListNewsCompactDefault}
				keyExtractor={({ id }) => id}
				contentContainerStyle={styles.container}
				renderItem={({ item, index }) => (
					<Pressable
						px={4}
						my={4}
						onPress={() => handlePressNews(item.id)}
					>
						<NewsComponent
							data={item}
							isLoaded={isLoaded && !isLoading && !isRefresh}
							isFirst={hotNews === null && index === 0}
						/>
					</Pressable>
				)}
				ListHeaderComponent={<HeaderFlatList />}
				ListFooterComponent={
					<FooterFlatListComponent
						isLoad={pages !== null && pages > 0 && pages !== page}
					/>
				}
				ListEmptyComponent={
					isLoaded && !isRefresh && !isLoading ? (
						<NoDataComponent message="Không có tin tức" />
					) : (
						<LoadingComponent />
					)
				}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={isRefresh}
						onRefresh={handleRefresh}
						colors={['#0891b2', '#4ade80']}
					/>
				}
				onEndReachedThreshold={0.5}
				onEndReached={handleLoadMore}
				onScroll={handleScroll}
			/>
		</Box>
	);
};

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		backgroundColor: 'white',
	},
});

export default Index;
