/* eslint-disable no-mixed-spaces-and-tabs */
import React, {
	FunctionComponent,
	useState,
	useEffect,
	useRef,
	useContext,
} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import RenderHTML from 'react-native-render-html';
import { RouteProp } from '@react-navigation/native';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import {
	Dimensions,
	NativeSyntheticEvent,
	NativeScrollEvent,
	GestureResponderEvent,
	Share,
	StatusBar,
	StyleSheet,
	Platform,
} from 'react-native';
import {
	Box,
	Text,
	ScrollView,
	Icon,
	Image,
	Pressable,
	HStack,
	Center,
	Badge,
	Skeleton,
	useDisclose,
} from 'native-base';

// Components
import { MapComponent } from '@components';

// Configs
import { host } from '@configs';

// Context
import { Context } from '@context';

// Helpers
import {
	getName,
	getPricePerAcreage,
	storages,
	renewTokenDevice,
} from '@helpers';

// Services
import services from '@services';

// Interfaces
import type {
	IProjectInfo,
	ICompositeNavigationStacks,
	IStackParams,
} from '@interfaces';

// Props
interface Props {
	navigation: ICompositeNavigationStacks<'Project'>;
	route: RouteProp<IStackParams, 'Project'>;
}

const convertPrices = (min: number, max: number): string => {
	let isBillion = false;

	if (min >= 1000 || max >= 1000) {
		isBillion = true;
	}

	const convertMin = min / (isBillion ? 1000 : 1);
	const convertMax = max / (isBillion ? 1000 : 1);
	const unit = isBillion ? 'Tỷ/m²' : 'Triệu/m²';

	return `${convertMin} - ${convertMax} ${unit}`;
};

const Index: FunctionComponent<Props> = ({ navigation, route }) => {
	// Constants
	const { width: screenWidth } = Dimensions.get('screen');

	// States
	const [isScroll, setIsScroll] = useState<boolean>(false);

	const [data, setData] = useState<IProjectInfo | null>(null);

	const [index, setIndex] = useState<number>(0);

	// Ref
	const carouselRef = useRef<Carousel<string>>(null);

	// Hooks
	const { onNotification, isNetwork } = useContext(Context);
	const { isOpen, onClose, onOpen } = useDisclose();

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

			const result = await services.projects.info(
				signal,
				token,
				route.params.projectID,
			);

			if (!result) {
				onNotification(
					'toast-screen-news-info-no-result',
					'Máy chủ bị lỗi',
					'Vui lòng thử lại sau',
					'error',
				);

				setTimeout(() => navigation.navigate('Projects'), 1000);

				return;
			}

			if (result === 'BadRequest') {
				onNotification(
					'toast-screen-news-info-bad-request',
					'Lỗi tải tin',
					undefined,
					'warning',
				);

				setTimeout(() => navigation.navigate('Projects'), 1000);

				return;
			}

			if (result === 'UnauthorizedDevice') {
				const renewToken = await renewTokenDevice(signal);

				if (!renewToken) {
					onNotification(
						'toast-screen-news-info-no-result',
						'Máy chủ bị lỗi',
						'Vui lòng thử lại sau',
						'error',
					);

					setTimeout(() => navigation.navigate('Projects'), 1000);

					return;
				}

				return getData(signal, renewToken);
			}

			setData(result);
		};

		if (isNetwork) {
			getData(controller.signal);
		} else {
			onNotification(
				'toast-screen-project-no-network',
				'Vui lòng bật mạng!',
				'Không có mạng',
				'warning',
			);

			navigation.navigate('Home');
		}

		return () => controller.abort();
	}, [isNetwork, onNotification, navigation, route]);

	// Handles
	const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
		const { y } = e.nativeEvent.contentOffset;

		if (y >= 170 && !isScroll) {
			setIsScroll(true);
		}

		if (y < 170 && isScroll) {
			setIsScroll(false);
		}
	};
	const handleSnapToItem = (value: number) => setIndex(value);

	const handlePressImage = (e: GestureResponderEvent) => {
		const halfScreen = screenWidth / 2;

		const { locationX } = e.nativeEvent;

		if (carouselRef.current) {
			if (locationX < halfScreen) {
				carouselRef.current.snapToPrev();
			} else {
				carouselRef.current.snapToNext();
			}
		}
	};
	const handlePressClose = () => {
		if (navigation.canGoBack()) {
			navigation.goBack();
		} else {
			navigation.push('Root', { screen: 'Home', params: undefined });
		}
	};
	const handlePressShare = async (link: string) => {
		const url = `${host}/${link}`;

		await Share.share({
			url,
		});
	};
	const handlePressAddress = () => {
		if (data) return onOpen();
	};

	return (
		<>
			<StatusBar barStyle="dark-content" />
			<Box flex={1} position="relative" bg="white" safeAreaBottom>
				<HStack
					px={4}
					pb={4}
					zIndex={2}
					justifyContent="space-between"
					position="absolute"
					w="100%"
					bg="white"
					backgroundColor={isScroll ? 'white' : 'transparent'}
					borderBottomColor="gray.200"
					borderBottomWidth={isScroll ? 1 : 0}
					safeAreaTop
					pt={Platform.OS === 'android' ? 4 : 0}
				>
					<Pressable
						p={1}
						rounded="full"
						background={
							isScroll || !data ? 'transparent' : '#0000008a'
						}
						onPress={handlePressClose}
					>
						<Icon
							as={MaterialCommunityIcons}
							name="close"
							color={isScroll || !data ? 'muted.500' : 'white'}
							size={isScroll || !data ? 'lg' : 'md'}
						/>
					</Pressable>
					{data && (
						<Pressable
							p={1}
							rounded="full"
							background={isScroll ? 'transparent' : '#0000008a'}
							onPress={() => handlePressShare(data.link)}
						>
							<Icon
								as={MaterialCommunityIcons}
								name="share-variant"
								color={isScroll ? 'muted.500' : 'white'}
								size={isScroll ? 'lg' : 'md'}
							/>
						</Pressable>
					)}
				</HStack>
				<ScrollView
					showsHorizontalScrollIndicator={false}
					showsVerticalScrollIndicator={false}
					scrollEventThrottle={16}
					onScroll={handleScroll}
				>
					<Skeleton h={250} isLoaded={data !== null}>
						{data && (
							<Center position="relative" h={250}>
								<Carousel
									ref={carouselRef}
									sliderWidth={screenWidth}
									itemWidth={screenWidth}
									data={data.images}
									renderItem={({ item }) => (
										<Pressable onPress={handlePressImage}>
											<Image
												source={{
													uri: `${host}/images/projects/${item}`,
												}}
												resizeMode="cover"
												h={250}
												w={screenWidth}
												alt={`Image Project ${item}`}
											/>
										</Pressable>
									)}
									onSnapToItem={handleSnapToItem}
									vertical={false}
								/>
								<Box zIndex={2} position="absolute" bottom={0}>
									<Pagination
										dotsLength={data.images.length}
										activeDotIndex={index}
										dotStyle={styles.carouselDot}
										inactiveDotStyle={
											styles.carouselInactiveDot
										}
										containerStyle={
											styles.carouselContainer
										}
									/>
								</Box>
							</Center>
						)}
					</Skeleton>
					<Box px={4}>
						<Box
							borderBottomColor="gray.100"
							borderBottomWidth={2}
							py={4}
						>
							<Skeleton.Text
								fontSize={16}
								isLoaded={data !== null}
								lines={1}
							>
								{data && (
									<>
										<Text
											fontWeight="bold"
											textTransform="uppercase"
											color="blue.800"
											fontSize={16}
										>
											{decodeURI(data.title)}
										</Text>
										<Badge
											colorScheme={
												data.status === 'onSale'
													? 'success'
													: data.status ===
													  'handedOver'
													? 'danger'
													: 'primary'
											}
											borderRadius="sm"
											zIndex={1}
											variant="solid"
											alignSelf="flex-start"
											_text={{
												fontSize: 12,
												fontWeight: 600,
											}}
											mt={1}
										>
											{getName.project.status(
												data.status,
											)}
										</Badge>
									</>
								)}
							</Skeleton.Text>
							<Skeleton.Text
								fontSize={14}
								isLoaded={data !== null}
								lines={2}
								mt={2}
							>
								{data && (
									<Pressable onPress={handlePressAddress}>
										<HStack mt={2} alignItems="center">
											<Icon
												as={MaterialIcons}
												name="location-pin"
												color="gray.400"
												size={5}
												mr={1}
												alignSelf="flex-start"
												mt={0.5}
											/>
											<Text
												color="gray.400"
												fontWeight="medium"
												fontSize={14}
												numberOfLines={2}
												flex={1}
											>
												{data.address}
											</Text>
										</HStack>
									</Pressable>
								)}
							</Skeleton.Text>
						</Box>
						<Box py={4}>
							<Text fontSize={18} fontWeight="semibold">
								Tổng quan
							</Text>
							<Skeleton.Text
								fontSize={14}
								lines={1}
								isLoaded={data !== null}
								py={2}
							>
								{data && (
									<HStack
										borderBottomColor="gray.100"
										borderBottomWidth={1}
										alignItems="center"
										py={2}
									>
										<Text flex={1} fontWeight="medium">
											Diện tích:
										</Text>
										<Text flex={1} fontWeight="bold">
											{data.acreages}
										</Text>
									</HStack>
								)}
							</Skeleton.Text>
							<Skeleton.Text
								fontSize={14}
								lines={1}
								isLoaded={data !== null}
								py={2}
							>
								{data && data.prices && (
									<HStack
										borderBottomColor="gray.100"
										borderBottomWidth={1}
										alignItems="center"
										py={2}
									>
										<Text flex={1} fontWeight="medium">
											Khoảng giá:
										</Text>
										<Text flex={1} fontWeight="bold">
											{`${
												typeof data.prices === 'number'
													? getPricePerAcreage(
															1,
															data.prices,
													  )
													: convertPrices(
															data.prices.min,
															data.prices.max,
													  )
											}`}
										</Text>
									</HStack>
								)}
							</Skeleton.Text>
							{data && data.overview && (
								<>
									<HStack
										borderBottomColor="gray.100"
										borderBottomWidth={1}
										alignItems="center"
										py={2}
									>
										<Text flex={1} fontWeight="medium">
											Số căn hộ:
										</Text>
										<Text flex={1} fontWeight="bold">
											{data.overview.numberOfApartments.toLocaleString(
												'en',
											)}
										</Text>
									</HStack>
									{data.overview.courtNumber > 1 && (
										<HStack
											borderBottomColor="gray.100"
											borderBottomWidth={1}
											alignItems="center"
											py={2}
										>
											<Text flex={1} fontWeight="medium">
												Số tòa:
											</Text>
											<Text flex={1} fontWeight="bold">
												{data.overview.courtNumber}
											</Text>
										</HStack>
									)}
									<HStack
										borderBottomColor="gray.100"
										borderBottomWidth={1}
										alignItems="center"
										py={2}
									>
										<Text flex={1} fontWeight="medium">
											Pháp lý:
										</Text>
										<Text flex={1} fontWeight="bold">
											{data.overview.legal}
										</Text>
									</HStack>
								</>
							)}
						</Box>
						<Box mb={4}>
							<Skeleton.Text
								fontSize={14}
								lines={20}
								isLoaded={data !== null}
							>
								{data && (
									<RenderHTML
										source={{
											html: decodeURI(data.content),
										}}
										contentWidth={screenWidth - 30}
									/>
								)}
							</Skeleton.Text>
						</Box>
					</Box>
					{data && data.investor && (
						<HStack
							px={4}
							mx={4}
							py={2}
							mb={4}
							alignItems="center"
							borderColor="gray.300"
							borderWidth={1}
							borderRadius="lg"
						>
							{data.investor.avatar && (
								<Image
									source={{
										uri: `${host}/images/avatars/${data.investor.avatar}`,
									}}
									w={70}
									h={70}
									resizeMethod="resize"
									resizeMode="contain"
									mr={2}
									alt={`Avatar ${data.investor.name}`}
								/>
							)}
							<Text
								flex={1}
								fontSize={16}
								fontWeight="semibold"
								color="danger.700"
							>
								{data.investor.name}
							</Text>
						</HStack>
					)}
				</ScrollView>
			</Box>
			{data && (
				<MapComponent
					isOpen={isOpen}
					onClose={onClose}
					{...data.coordinate}
				/>
			)}
		</>
	);
};

const styles = StyleSheet.create({
	carouselContainer: {
		paddingVertical: 5,
	},
	carouselDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: 'rgba(255, 255, 255, 0.92)',
		marginHorizontal: 0,
	},
	carouselInactiveDot: {
		backgroundColor: 'rgba(0,0,0,0.8)',
		width: 15,
		height: 15,
		borderRadius: 999,
	},
});

export default Index;
