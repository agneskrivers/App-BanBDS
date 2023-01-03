import React, { FunctionComponent, useState, useEffect } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import {
	NativeSyntheticEvent,
	NativeScrollEvent,
	RefreshControl,
	StyleSheet,
} from 'react-native';
import {
	Box,
	Text,
	Pressable,
	Image,
	Center,
	FlatList,
	Skeleton,
	useToast,
} from 'native-base';

// Components
import {
	HeaderComponent,
	NewsComponent,
	NoDataComponent,
	FooterFlatListComponent,
	LoadingComponent,
} from '@components';

// Configs
import { ListNewsCompactDefault, HotNewsCompactDefault } from '@configs';

// Interfaces
import type {
	INewsCompact,
	IHotNewsCompact,
	IStackParams,
	ICompositeNavigationBottomTabs,
} from '@interfaces';

// Props
interface Props {
	navigation: ICompositeNavigationBottomTabs<'News'>;
}

// Demo
import { hotNewsCompact, newsCompact } from '../../../demo';

const Index: FunctionComponent<Props> = ({ navigation }) => {
	// States
	const [isLoaded, setIsLoaded] = useState<boolean>(false);

	const [isScroll, setIsScroll] = useState<boolean>(false);
	const [isRefresh, setIsRefresh] = useState<boolean>(false);
	const [isLoadMore, setIsLoadMore] = useState<boolean>(false);

	const [hotNews, setHotNews] = useState<IHotNewsCompact | null>(null);
	const [news, setNews] = useState<INewsCompact[] | null>(null);

	const [pages, setPages] = useState<number | null>(null);
	const [page, setPage] = useState<number>(1);

	useEffect(() => {
		const getData = () => {
			let list: string[] = [];

			let data: INewsCompact[] = [];

			for (let i = 0; i < 10; i++) {
				const generateID = (): string => {
					const id = Math.floor(
						Math.random() * Math.pow(10, 6),
					).toString();

					if (list.indexOf(id) < 0) {
						list = [...list, id];

						return id;
					}

					return generateID();
				};

				const id = generateID();

				data = [...data, { ...newsCompact, id }];
			}

			setTimeout(() => {
				setNews(data);
				setHotNews(hotNewsCompact);

				setIsLoaded(true);
				setPages(0);
			}, 2000);
		};

		getData();
	}, []);
	useEffect(() => {
		const getData = async () => {
			setTimeout(() => setIsRefresh(false), 2000);
		};

		if (isRefresh) {
			getData();
		}
	}, [isRefresh]);

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

	const handlePressNews = () => navigation.navigate('NewsInfo');

	// Elements
	const HeaderFlatListLoaded = () =>
		!hotNews ? null : (
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
						<Skeleton h={200} borderRadius="xl" isLoaded={isLoaded}>
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
								isLoaded={isLoaded}
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
								isLoaded={isLoaded}
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
					<Pressable px={4} my={4} onPress={handlePressNews}>
						<NewsComponent
							data={item}
							isLoaded={isLoaded}
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
					isLoaded && !isLoadMore && !isRefresh ? (
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
