import React, {
	FunctionComponent,
	useState,
	useEffect,
	useContext,
	useCallback,
} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
	StatusBar,
	TouchableWithoutFeedback,
	Keyboard,
	StyleSheet,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import {
	Box,
	HStack,
	Text,
	Icon,
	Pressable,
	FlatList,
	Skeleton,
	Input,
	ScrollView,
	Button,
	Select,
	Actionsheet,
	useDisclose,
} from 'native-base';

// Components
import {
	NoDataComponent,
	PostComponent,
	FooterFlatListComponent,
	LoadingComponent,
} from '@components';

// Configs
import {
	FilterAcreages,
	FilterPrices,
	Sorts,
	ListPostCompactDefault,
} from '@configs';

// Context
import { Context } from '@context';

// Helpers
import { storages, renewTokenDevice } from '@helpers';

// Services
import services from '@services';

// Interfaces
import type {
	ISort,
	IPostCompact,
	IPostCategory,
	ICompositeNavigationStacks,
	IStackParams,
	IPostType,
	IDistrictInfo,
	IPostSortValue,
} from '@interfaces';

// Type
type FetchData = (
	signal: AbortSignal,
	page: number,
	type: IPostType,
	tokenDevice?: string,
	region?: string,
	district?: string,
	search?: string,
	category?: IPostCategory,
	pricesMin?: number,
	pricesMax?: number,
	acreagesMin?: number,
	acreagesMax?: number,
	prices?: IPostSortValue,
	acreages?: IPostSortValue,
	createdAt?: IPostSortValue,
) => Promise<void>;

// Interface
interface DataStorage {
	data: IPostCompact[];
	totals: number;
	pages: number;
}

// Props
interface Props {
	navigation: ICompositeNavigationStacks<'Posts'>;
	route: RouteProp<IStackParams, 'Posts'>;
}

const Index: FunctionComponent<Props> = ({ navigation, route }) => {
	// States
	const [isLoaded, setIsLoaded] = useState<boolean>(false);
	const [isLoadMore, setIsLoadMore] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const [data, setData] = useState<IPostCompact[] | null>(null);
	const [totals, setTotals] = useState<number | null>(null);
	const [pages, setPages] = useState<number | null>(null);
	const [page, setPage] = useState<number>(1);

	const [sort, setSort] = useState<ISort>(() => Sorts[0]);

	const [districts, setDistricts] = useState<IDistrictInfo[]>();

	const [search, setSearch] = useState<string>();
	const [searchTemp, setSearchTemp] = useState<string>();
	const [type, setType] = useState<IPostType>(() => route.params.type);
	const [category, setCategory] = useState<IPostCategory | ''>('');
	const [region, setRegion] = useState<string>();
	const [district, setDistrict] = useState<string>();
	const [prices, setPrices] = useState<string>();
	const [acreages, setAcreages] = useState<string>();

	// Hooks
	const {
		onClose: handleCloseSort,
		onOpen: handleOpenSort,
		isOpen: isSort,
	} = useDisclose();
	const { regions, isNetwork, onNotification } = useContext(Context);

	const getDataStorage = useCallback(async () => {
		try {
			const posts = await storages.get.obj<DataStorage>('posts');

			if (!posts) throw new Error();

			setData(posts.data);
			setPages(posts.pages);
			setTotals(posts.totals);
		} catch (_) {
			setPages(0);
			setData([]);
			setTotals(0);
		}
	}, []);
	const fetchData: FetchData = useCallback(
		async (
			signal,
			nextPage,
			postType,
			tokenDevice,
			postRegion,
			postDistrict,
			postSearch,
			postCategory,
			pricesMin,
			pricesMax,
			acreagesMin,
			acreagesMax,
			postPrices,
			postAcreages,
			createdAt,
		) => {
			let token: string | undefined | null = tokenDevice;

			if (!token) {
				token = await storages.get.str('device');
			}

			if (!token) {
				token = await renewTokenDevice(signal);
			}

			if (!token) throw new Error();

			const result = await services.posts.shortlist(
				signal,
				token,
				postType,
				nextPage,
				postRegion,
				postDistrict,
				postSearch,
				postCategory,
				pricesMin,
				pricesMax,
				acreagesMin,
				acreagesMax,
				postPrices,
				postAcreages,
				createdAt,
			);

			if (!result || result === 'BadRequest') throw new Error();

			if (result === 'UnauthorizedDevice') {
				if (tokenDevice) throw new Error();

				const renewToken = await renewTokenDevice(signal);

				if (!renewToken) throw new Error();

				return fetchData(
					signal,
					nextPage,
					postType,
					renewToken,
					postRegion,
					postDistrict,
					postSearch,
					postCategory,
					pricesMin,
					pricesMax,
					acreagesMin,
					acreagesMax,
					postPrices,
					postAcreages,
					createdAt,
				);
			}

			if (
				postRegion === undefined &&
				postSearch === undefined &&
				postCategory === undefined &&
				pricesMin === undefined &&
				pricesMax === undefined &&
				acreagesMin === undefined &&
				acreagesMax === undefined &&
				postPrices === undefined &&
				postAcreages === undefined &&
				createdAt === undefined &&
				postDistrict === undefined
			) {
				const dataStorage: DataStorage = {
					data: result.posts,
					pages: result.pages,
					totals: result.totals,
				};

				await storages.set('posts', JSON.stringify(dataStorage));
			}

			setData(result.posts);
			setTotals(result.totals);
			setPages(result.pages);
		},
		[],
	);

	// Effects
	useEffect(() => {
		const controller = new AbortController();

		if (!isLoaded && sort) {
			if (isNetwork) {
				fetchData(controller.signal, 1, type)
					.catch(() => {
						onNotification(
							'toast-screen-posts-error',
							'Vui lòng thử lại!',
							'Máy chủ bị lỗi',
							'error',
						);

						getDataStorage();
					})
					.finally(() => setIsLoaded(true));
			} else {
				getDataStorage();
			}
		}

		return () => controller.abort();
	}, [
		isNetwork,
		sort,
		isLoaded,
		type,
		onNotification,
		fetchData,
		getDataStorage,
	]);
	useEffect(() => {
		const id = setTimeout(() => setSearch(searchTemp), 100);

		return () => clearTimeout(id);
	}, [searchTemp]);
	useEffect(() => {
		if (isLoaded) {
			setIsLoading(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sort, search, type, category, region, district, prices, acreages]);
	useEffect(() => {
		const controller = new AbortController();

		if (isLoading) {
			let postCategory: undefined | IPostCategory;

			let postAcreages: undefined | IPostSortValue;
			let postPrices: undefined | IPostSortValue;
			let createdAt: undefined | IPostSortValue;

			let pricesMin: undefined | number;
			let pricesMax: undefined | number;
			let acreagesMin: undefined | number;
			let acreagesMax: undefined | number;

			if (sort.value !== 'normally') {
				switch (sort.value) {
					case 'acreageAsc':
						postAcreages = 'asc';
						break;
					case 'acreageDesc':
						postAcreages = 'desc';
						break;
					case 'latest':
						createdAt = 'asc';
						break;
					case 'oldest':
						createdAt = 'desc';
						break;
					case 'priceAsc':
						postPrices = 'asc';
						break;
					case 'priceDesc':
						postPrices = 'desc';
						break;
				}
			}

			if (prices) {
				const findPrices = [...FilterPrices].find(
					item => item.id === prices,
				);

				if (findPrices) {
					pricesMin = findPrices.min;
					pricesMax = findPrices.max;
				}
			}

			if (acreages) {
				const findAcreages = [...FilterAcreages].find(
					item => item.id === acreages,
				);

				if (findAcreages) {
					acreagesMin = findAcreages.min;
					acreagesMax = findAcreages.max;
				}
			}

			if (category) {
				postCategory = category;
			}

			fetchData(
				controller.signal,
				1,
				type,
				undefined,
				region,
				district,
				search,
				postCategory,
				pricesMin,
				pricesMax,
				acreagesMin,
				acreagesMax,
				postPrices,
				postAcreages,
				createdAt,
			)
				.catch(() => {
					onNotification(
						'toast-screen-posts-error',
						'Vui lòng thử lại!',
						'Máy chủ bị lỗi',
						'error',
					);
				})
				.finally(() => setIsLoading(false));
		}

		return () => controller.abort();
	}, [
		isLoading,
		sort,
		search,
		type,
		category,
		region,
		district,
		prices,
		acreages,
		fetchData,
		onNotification,
	]);
	useEffect(() => {
		const controller = new AbortController();

		if (isLoadMore) {
			let postCategory: undefined | IPostCategory;

			let postAcreages: undefined | IPostSortValue;
			let postPrices: undefined | IPostSortValue;
			let createdAt: undefined | IPostSortValue;

			let pricesMin: undefined | number;
			let pricesMax: undefined | number;
			let acreagesMin: undefined | number;
			let acreagesMax: undefined | number;

			if (sort.value !== 'normally') {
				switch (sort.value) {
					case 'acreageAsc':
						postAcreages = 'asc';
						break;
					case 'acreageDesc':
						postAcreages = 'desc';
						break;
					case 'latest':
						createdAt = 'asc';
						break;
					case 'oldest':
						createdAt = 'desc';
						break;
					case 'priceAsc':
						postPrices = 'asc';
						break;
					case 'priceDesc':
						postPrices = 'desc';
						break;
				}
			}

			if (prices) {
				const findPrices = [...FilterPrices].find(
					item => item.id === prices,
				);

				if (findPrices) {
					pricesMin = findPrices.min;
					pricesMax = findPrices.max;
				}
			}

			if (acreages) {
				const findAcreages = [...FilterAcreages].find(
					item => item.id === acreages,
				);

				if (findAcreages) {
					acreagesMin = findAcreages.min;
					acreagesMax = findAcreages.max;
				}
			}

			if (category) {
				postCategory = category;
			}

			fetchData(
				controller.signal,
				page + 1,
				type,
				undefined,
				region,
				district,
				search,
				postCategory,
				pricesMin,
				pricesMax,
				acreagesMin,
				acreagesMax,
				postPrices,
				postAcreages,
				createdAt,
			)
				.then(() => setPage(prePage => prePage + 1))
				.catch(() => {
					onNotification(
						'toast-screen-posts-error',
						'Vui lòng thử lại!',
						'Máy chủ bị lỗi',
						'error',
					);
				})
				.finally(() => setIsLoadMore(false));
		}

		return () => controller.abort();
	}, [
		isLoadMore,
		page,
		sort,
		search,
		type,
		category,
		region,
		district,
		prices,
		acreages,
		fetchData,
		onNotification,
	]);
	useEffect(() => {
		const controller = new AbortController();

		const getData = async (
			signal: AbortSignal,
			id: string,
			tokenDevice?: string,
		): Promise<void> => {
			let token: string | undefined | null = tokenDevice;

			if (!token) {
				token = await storages.get.str('device');
			}

			if (!token) {
				token = await renewTokenDevice(signal);
			}

			if (!token) throw new Error();

			const result = await services.common.address.districts(signal, id);

			if (!result) throw new Error();

			if (result === 'BadRequest') {
				onNotification(
					'toast-screen-posts-districts-bad-request',
					'Lấy danh sách Quận/Huyện không thành công!',
					undefined,
					'error',
				);

				return;
			}

			setDistricts(result);
		};

		if (region && isNetwork) {
			getData(controller.signal, region);
		}

		return () => controller.abort();
	}, [onNotification, region, isNetwork]);

	// Handles
	const handleLoadMore = () => {
		if (pages && pages > 0 && pages !== page) {
			setIsLoadMore(true);
		}
	};

	const handleSelectType = (value: string) => {
		if (value === type) return;

		setType(value as IPostType);
	};
	const handleSelectCategory = (value: string) => {
		if (value === category) return setCategory('');

		setCategory(value as IPostCategory);
	};
	const handleSelectRegion = (value: string) => {
		if (region === value) return setRegion('');

		setRegion(value);
	};
	const handleSelectDistrict = (value: string) => {
		if (district === value) return setDistrict('');

		setDistrict(value);
	};
	const handleSelectPrices = (value: string) => {
		const findPrices = [...FilterPrices].find(item => item.id === value);

		if (!findPrices || value === prices) return setPrices('');

		setPrices(value);
	};
	const handleSelectAcreages = (value: string) => {
		const findAcreages = [...FilterAcreages].find(
			item => item.id === value,
		);

		if (!findAcreages || value === acreages) return setAcreages('');

		setAcreages(value);
	};

	const handlePressClean = () => {
		setCategory('');
		setRegion('');
		setDistrict('');
		setPrices('');
		setAcreages('');
		setSort(Sorts[0]);
	};
	const handlePressSort = (value: string) => {
		const findSort = [...Sorts].find(item => item.value === value);

		if (findSort) {
			setSort(findSort);
			handleCloseSort();
		}
	};
	const handlePressGoBack = () => {
		if (navigation.canGoBack()) {
			navigation.goBack();
		} else {
			navigation.navigate('Home');
		}
	};
	const handlePressPost = (postID: number) =>
		navigation.navigate('Post', {
			postID,
		});

	const handleChangeSearch = (value: string) => setSearchTemp(value);

	return (
		<>
			<StatusBar barStyle="dark-content" />
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<Box flex={1}>
					<Box
						safeAreaTop
						bg="white"
						borderBottomColor="gray.100"
						borderBottomWidth={1}
						px={4}
						py={2}
						shadow={1}
						mb={data && data.length === 0 ? 0 : 4}
					>
						<HStack
							alignItems="center"
							justifyContent="space-between"
						>
							<Pressable onPress={handlePressGoBack}>
								<Icon
									as={MaterialCommunityIcons}
									name="arrow-left"
									size={6}
									color="dark.400"
								/>
							</Pressable>
							<Input
								h={10}
								w="90%"
								placeholder="Nhập địa chỉ hoặc từ khóa"
								leftElement={
									<Icon
										as={MaterialIcons}
										name="search"
										size={5}
										color="gray.400"
										ml={4}
									/>
								}
								placeholderTextColor="gray.400"
								borderColor="gray.100"
								backgroundColor="gray.100"
								borderRadius={7}
								_focus={{ borderColor: 'gray.200' }}
								onChangeText={handleChangeSearch}
								isDisabled={
									!isLoaded || isLoadMore || isLoading
								}
							/>
						</HStack>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							showsVerticalScrollIndicator={false}
							contentContainerStyle={styles.scrollViewContainer}
							mt={2}
						>
							<Button
								variant="unstyled"
								p={0}
								pr={2}
								onPress={handlePressClean}
								isDisabled={
									category === undefined &&
									region === undefined &&
									district === undefined &&
									prices === undefined &&
									acreages === undefined
								}
							>
								<HStack alignItems="center">
									<Icon
										as={MaterialIcons}
										name="filter-list-alt"
										color="dark.500"
										mr={1}
									/>
									<Text
										color="dark.500"
										fontWeight="semibold"
									>
										Lọc
									</Text>
								</HStack>
							</Button>
							<Box
								w={0}
								h={6}
								borderLeftColor="gray.300"
								borderLeftWidth={1}
							/>
							<Select
								isDisabled={
									!isLoaded || isLoading || isLoadMore
								}
								px={2}
								borderWidth={0}
								selectedValue={type}
								color="blue.500"
								fontSize={14}
								fontWeight="medium"
								dropdownIcon={
									<Icon
										as={MaterialCommunityIcons}
										name="chevron-down"
										size={5}
										color="gray.400"
										mr={2}
										ml={-2}
									/>
								}
								_item={{
									_text: {
										fontWeight: 'medium',
									},
								}}
								_selectedItem={{
									_text: {
										color: 'blue.500',
										fontWeight: 'medium',
									},
								}}
								onValueChange={handleSelectType}
							>
								<Select.Item value="sell" label="Mua Bán" />
								<Select.Item value="rent" label="Cho Thuê" />
							</Select>
							<Box
								w={0}
								h={6}
								borderLeftColor="gray.300"
								borderLeftWidth={1}
							/>
							<Select
								isDisabled={
									!isLoaded || isLoading || isLoadMore
								}
								px={2}
								color="blue.500"
								fontWeight="medium"
								fontSize={14}
								placeholder="Loại nhà đất"
								borderRightColor="gray.200"
								borderWidth={0}
								dropdownIcon={
									<Icon
										as={MaterialCommunityIcons}
										name="chevron-down"
										size={5}
										color="gray.400"
										mr={2}
										ml={-2}
									/>
								}
								placeholderTextColor="gray.400"
								_item={{
									_text: {
										fontWeight: 'medium',
									},
								}}
								_selectedItem={{
									_text: {
										color: 'blue.500',
										fontWeight: 'medium',
									},
								}}
								onValueChange={handleSelectCategory}
								selectedValue={category}
							>
								<Select.Item
									value="apartment"
									label="Chung Cư"
								/>
								<Select.Item value="house" label="Nhà Riêng" />
								<Select.Item value="soil" label="Đất Nền" />
							</Select>
							<Box
								w={0}
								h={6}
								borderLeftColor="gray.300"
								borderLeftWidth={1}
							/>
							<Select
								isDisabled={
									!isLoaded || isLoading || isLoadMore
								}
								px={2}
								color="blue.500"
								fontWeight="medium"
								fontSize={14}
								placeholder="Tỉnh/Thành phố"
								borderRightColor="gray.200"
								borderWidth={0}
								dropdownIcon={
									<Icon
										as={MaterialCommunityIcons}
										name="chevron-down"
										size={5}
										color="gray.400"
										mr={2}
										ml={-2}
									/>
								}
								placeholderTextColor="gray.400"
								_item={{
									_text: {
										fontWeight: 'medium',
									},
								}}
								_selectedItem={{
									_text: {
										color: 'blue.500',
										fontWeight: 'medium',
									},
								}}
								onValueChange={handleSelectRegion}
								selectedValue={region}
							>
								{regions.map(item => (
									<Select.Item
										key={item.id}
										value={item.regionID}
										label={item.name}
									/>
								))}
							</Select>
							{region !== undefined &&
								districts !== undefined && (
									<>
										<Box
											w={0}
											h={6}
											borderLeftColor="gray.300"
											borderLeftWidth={1}
										/>
										<Select
											isDisabled={
												!isLoaded ||
												isLoading ||
												isLoadMore
											}
											px={2}
											color="blue.500"
											fontWeight="medium"
											fontSize={14}
											placeholder="Quận/Huyện"
											borderRightColor="gray.200"
											borderWidth={0}
											dropdownIcon={
												<Icon
													as={MaterialCommunityIcons}
													name="chevron-down"
													size={5}
													color="gray.400"
													mr={2}
													ml={-2}
												/>
											}
											placeholderTextColor="gray.400"
											_item={{
												_text: {
													fontWeight: 'medium',
												},
											}}
											_selectedItem={{
												_text: {
													color: 'blue.500',
													fontWeight: 'medium',
												},
											}}
											onValueChange={handleSelectDistrict}
											selectedValue={district}
										>
											{districts.map(item => (
												<Select.Item
													key={item.districtID}
													value={item.districtID}
													label={item.name}
												/>
											))}
										</Select>
									</>
								)}
							<Box
								w={0}
								h={6}
								borderLeftColor="gray.300"
								borderLeftWidth={1}
							/>
							<Select
								isDisabled={
									!isLoaded || isLoading || isLoadMore
								}
								px={2}
								color="blue.500"
								fontWeight="medium"
								fontSize={14}
								placeholder="Khoảng Giá"
								borderRightColor="gray.200"
								borderWidth={0}
								dropdownIcon={
									<Icon
										as={MaterialCommunityIcons}
										name="chevron-down"
										size={5}
										color="gray.400"
										mr={2}
										ml={-2}
									/>
								}
								placeholderTextColor="gray.400"
								_item={{
									_text: {
										fontWeight: 'medium',
									},
								}}
								_selectedItem={{
									_text: {
										color: 'blue.500',
										fontWeight: 'medium',
									},
								}}
								onValueChange={handleSelectPrices}
								selectedValue={prices}
							>
								{FilterPrices.map(({ id, min, max }) => {
									if (min === 0)
										return (
											<Select.Item
												key={id}
												value={id}
												label="Dưới 1 tỷ"
											/>
										);

									if (min === 1000)
										return (
											<Select.Item
												key={id}
												value={id}
												label="Trên 1.000 tỷ"
											/>
										);

									return (
										<Select.Item
											key={id}
											value={id}
											label={`${min} tỷ - ${max} tỷ`}
										/>
									);
								})}
							</Select>
							<Box
								w={0}
								h={6}
								borderLeftColor="gray.300"
								borderLeftWidth={1}
							/>
							<Select
								isDisabled={
									!isLoaded || isLoading || isLoadMore
								}
								px={2}
								color="blue.500"
								fontWeight="medium"
								fontSize={14}
								placeholder="Diện tích"
								borderRightColor="gray.200"
								borderWidth={0}
								dropdownIcon={
									<Icon
										as={MaterialCommunityIcons}
										name="chevron-down"
										size={5}
										color="gray.400"
										mr={2}
										ml={-2}
									/>
								}
								placeholderTextColor="gray.400"
								_item={{
									_text: {
										fontWeight: 'medium',
									},
								}}
								_selectedItem={{
									_text: {
										color: 'blue.500',
										fontWeight: 'medium',
									},
								}}
								onValueChange={handleSelectAcreages}
								selectedValue={acreages}
							>
								{FilterAcreages.map(({ id, min, max }) => {
									if (min === 0)
										return (
											<Select.Item
												key={id}
												value={id}
												label="Dưới 20 m²"
											/>
										);

									if (min === 100000)
										return (
											<Select.Item
												key={id}
												value={id}
												label={`Trên ${min.toLocaleString(
													'en',
												)} m²`}
											/>
										);

									return (
										<Select.Item
											key={id}
											value={id}
											label={`${min.toLocaleString(
												'en',
											)} m² - ${max.toLocaleString(
												'en',
											)} m²`}
										/>
									);
								})}
							</Select>
						</ScrollView>
					</Box>
					{data && data.length !== 0 && (
						<Box px={4}>
							<Pressable onPress={handleOpenSort}>
								<HStack alignItems="center" mb={2}>
									<Text color="dark.400">{`Sắp xếp: ${sort.name}`}</Text>
									<Icon
										as={MaterialIcons}
										name="keyboard-arrow-down"
										size={4}
										ml={0.5}
										color="dark.400"
									/>
								</HStack>
							</Pressable>
						</Box>
					)}
					<FlatList
						data={data ? data : ListPostCompactDefault}
						keyExtractor={({ id }) => id}
						contentContainerStyle={styles.flatListContainer}
						renderItem={({ item, index }) => (
							<Pressable
								px={4}
								my={2}
								mt={
									totals !== null && index === 0
										? 0
										: index === 0
										? 4
										: 2
								}
								onPress={() => handlePressPost(item.postID)}
							>
								<PostComponent
									data={item}
									isLoaded={isLoaded && !isLoading}
								/>
							</Pressable>
						)}
						ListHeaderComponent={
							totals && isLoaded ? (
								<Box py={2} px={4} bgColor="white">
									<Skeleton.Text lines={1} isLoaded={true}>
										<Text
											color="gray.400"
											fontWeight="medium"
											textAlign="right"
										>
											{`Có ${totals.toLocaleString(
												'en',
											)} tin bất động sản`}
										</Text>
									</Skeleton.Text>
								</Box>
							) : null
						}
						ListFooterComponent={
							<>
								<FooterFlatListComponent
									isLoad={
										pages !== null &&
										pages > 0 &&
										pages !== page
									}
								/>
								<Box safeAreaBottom m={0} p={0} />
							</>
						}
						ListEmptyComponent={
							isLoaded && !isLoading ? (
								<NoDataComponent message="Không có bài đăng" />
							) : (
								<LoadingComponent />
							)
						}
						onEndReached={handleLoadMore}
						onEndReachedThreshold={0.5}
					/>
				</Box>
			</TouchableWithoutFeedback>
			<Actionsheet isOpen={isSort} onClose={handleCloseSort}>
				<Actionsheet.Content>
					{[...Sorts].map(({ value, name }) => (
						<Actionsheet.Item
							key={value}
							onPress={() => handlePressSort(value)}
							_text={{
								fontWeight: 'medium',
							}}
							isDisabled={sort.value === value}
						>
							{name}
						</Actionsheet.Item>
					))}
				</Actionsheet.Content>
			</Actionsheet>
		</>
	);
};

const styles = StyleSheet.create({
	scrollViewContainer: {
		alignItems: 'center',
	},
	flatListContainer: {
		flexGrow: 1,
		backgroundColor: 'white',
	},
});

export default Index;
