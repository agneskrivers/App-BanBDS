import React, { FunctionComponent, useState, useEffect } from 'react';
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

// Interfaces
import type { ISort, IPostCompact, IPostCategory } from '@interfaces';

const Index: FunctionComponent = () => {
	// States
	const [isLoaded, setIsLoaded] = useState<boolean>(false);
	const [isLoadMore, setIsLoadMore] = useState<boolean>(false);

	const [data, setData] = useState<IPostCompact[] | null>(null);
	const [totals, setTotals] = useState<number | null>(null);
	const [pages, setPages] = useState<number | null>(null);
	const [page, setPage] = useState<number>(1);

	const [sort, setSort] = useState<ISort>(() => Sorts[0]);

	const [search, setSearch] = useState<string>();
	const [searchTemp, setSearchTemp] = useState<string>();
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

	// Effects
	useEffect(() => {
		const getData = async () => {
			setTimeout(() => {
				setData([]);
				setPages(0);
				setTotals(0);
				setIsLoaded(true);
			}, 2000);
		};

		getData();
	}, []);

	// Handles
	const handleLoadMore = () => {
		if (pages && pages > 0 && pages !== page) {
			setIsLoadMore(true);
		}
	};

	const handlePressSort = (value: string) => {
		const findSort = [...Sorts].find(item => item.value === value);

		if (findSort) {
			setSort(findSort);
			handleCloseSort();
		}
	};

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
							<Pressable>
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
							/>
						</HStack>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							showsVerticalScrollIndicator={false}
							contentContainerStyle={styles.scrollViewContainer}
							mt={2}
						>
							<Button variant="unstyled" p={0} pr={2}>
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
								px={2}
								borderWidth={0}
								selectedValue="sell"
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
						keyExtractor={({ postID }) => postID.toString()}
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
							>
								<PostComponent
									data={item}
									isLoaded={isLoaded}
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
							isLoaded ? (
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
