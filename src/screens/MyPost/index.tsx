import React, {
	FunctionComponent,
	useEffect,
	useState,
	useRef,
	useContext,
} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import YoutubeIframe from 'react-native-youtube-iframe';
import { format } from 'date-fns';
import { RouteProp } from '@react-navigation/native';
import {
	Dimensions,
	GestureResponderEvent,
	NativeSyntheticEvent,
	NativeScrollEvent,
	StatusBar,
	StyleSheet,
	LayoutChangeEvent,
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
	Button,
	Skeleton,
	Center,
	useDisclose,
} from 'native-base';

// Component
import { MapComponent } from '@components';

// Configs
import { host } from '@configs';

// Context
import { Context } from '@context';

// Helpers
import {
	getName,
	getPricePerAcreage,
	formatPhoneNumber,
	storages,
	renewTokenDevice,
} from '@helpers';

// Services
import services from '@services';

// Interfaces
import type {
	IMyPostInfo,
	ICompositeNavigationStacks,
	IStackParams,
} from '@interfaces';

// Props
interface Props {
	navigation: ICompositeNavigationStacks<'MyPost'>;
	route: RouteProp<IStackParams, 'MyPost'>;
}

const Index: FunctionComponent<Props> = ({ navigation, route }) => {
	// Constants
	const { width: screenWidth } = Dimensions.get('screen');

	// States
	const [isScroll, setIsScroll] = useState<boolean>(false);
	const [isHeight, setIsHeight] = useState<boolean>(true);
	const [isLoadMore, setIsLoadMore] = useState<boolean>(false);

	const [data, setData] = useState<IMyPostInfo | null>(null);
	const [index, setIndex] = useState<number>(0);

	// Ref
	const carouselRef = useRef<Carousel<string>>(null);

	// Hooks
	const { onClose, onOpen, isOpen } = useDisclose();
	const { isNetwork, onLogout, onNotification } = useContext(Context);

	// Effects
	useEffect(() => {
		const controller = new AbortController();

		const getData = async (
			signal: AbortSignal,
			postID: number,
			tokenDevice?: string,
		): Promise<void> => {
			let device: string | undefined | null = tokenDevice;

			if (!device) {
				device = await storages.get.str('device');
			}

			if (!device) {
				device = await renewTokenDevice(signal);
			}

			if (!device) throw new Error();

			const user = await storages.get.str('user');

			if (!user) {
				onNotification(
					'toast-screen-my-post-no-user-token',
					'Không thể thực hiện!',
					undefined,
					'warning',
				);

				onLogout();

				setTimeout(() => navigation.navigate('Login'), 500);

				return;
			}

			const result = await services.posts.myPostInfo(
				signal,
				device,
				user,
				postID,
			);

			if (!result) throw new Error();

			if (result === 'UnauthorizedDevice') {
				if (tokenDevice) throw new Error();

				const renewToken = await renewTokenDevice(signal);

				if (!renewToken) throw new Error();

				return getData(signal, postID, renewToken);
			}

			if (result === 'UnauthorizedUser') {
				onNotification(
					'toast-screen-my-post-no-user-token',
					'Không thể thực hiện!',
					undefined,
					'warning',
				);

				onLogout();

				setTimeout(() => navigation.navigate('Login'), 500);

				return;
			}

			if (result === 'BadRequest') {
				onNotification(
					'toast-screen-my-post-result-bad-request',
					'Có vấn đề xảy ra!',
					undefined,
					'warning',
				);

				if (navigation.canGoBack()) {
					navigation.goBack();
				} else {
					navigation.navigate('Account');
				}

				return;
			}

			setData(result);
		};

		if (!data) {
			if (isNetwork) {
				getData(controller.signal, route.params.postID).catch(() => {
					onNotification(
						'toast-screen-my-post-error',
						'Vui lòng thử lại sau!',
						'Máy chủ bị lỗi',
						'error',
					);

					navigation.navigate('Account');
				});
			} else {
				onNotification(
					'toast-screen-my-post-no-network',
					'Vui lòng kết nối mạng!',
					'Không có mạng',
					'warning',
				);

				navigation.navigate('Home');
			}
		}

		return () => controller.abort();
	}, [
		data,
		isNetwork,
		navigation,
		onLogout,
		onNotification,
		route.params.postID,
	]);

	// Handles
	const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
		const { y } = e.nativeEvent.contentOffset;

		if (y >= 175 && !isScroll) {
			setIsScroll(true);
		}

		if (y < 175 && isScroll) {
			setIsScroll(false);
		}
	};
	const handleSnapToItem = (value: number) => setIndex(value);
	const handleTouchEnd = (e: GestureResponderEvent) => {
		if (data && carouselRef && carouselRef.current) {
			const width = screenWidth / 2;

			const location = e.nativeEvent.locationX;

			let newIndex = index + (location > width ? 1 : -1);

			if (newIndex < 0) {
				newIndex = data.images.length - 1;
			}

			if (newIndex >= data.images.length) {
				newIndex = 0;
			}

			setIndex(newIndex);

			carouselRef.current.snapToItem(newIndex);
		}
	};
	const handleLayoutContent = (e: LayoutChangeEvent) => {
		const { height } = e.nativeEvent.layout;

		const minHeight = 14 * 1.75 * 6;

		if (height <= minHeight && isHeight) {
			setIsHeight(false);
		}
	};

	const handlePressEdit = () => {
		if (data) {
			navigation.navigate('EditPost', {
				data: { ...data, postID: route.params.postID },
			});
		}
	};
	const handlePressClose = () => {
		if (navigation.canGoBack()) {
			navigation.goBack();
		} else {
			navigation.navigate('Account');
		}
	};
	const handlePressAddress = () => {
		if (data) return onOpen();
	};
	const handlePressLoadMore = () =>
		setIsLoadMore(preIsLoadMore => !preIsLoadMore);

	return (
		<>
			<StatusBar barStyle={isScroll ? 'dark-content' : 'light-content'} />
			<Box flex={1} bg="white" safeAreaBottom position="relative">
				<HStack
					px={4}
					pb={4}
					pt={Platform.OS === 'android' ? 4 : 0}
					zIndex={2}
					justifyContent="space-between"
					position="absolute"
					w="100%"
					bg="white"
					backgroundColor={isScroll ? 'white' : 'transparent'}
					borderBottomColor="gray.200"
					borderBottomWidth={isScroll ? 1 : 0}
					safeAreaTop
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
				</HStack>
				<ScrollView
					showsVerticalScrollIndicator={false}
					showsHorizontalScrollIndicator={false}
					scrollEventThrottle={1}
					bgColor="white"
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
										<Pressable>
											<Image
												source={{
													uri: `${host}/images/posts/${item}`,
												}}
												resizeMode="cover"
												h={250}
												w={screenWidth}
												alt={`Image Project ${item}`}
											/>
										</Pressable>
									)}
									vertical={false}
									onSnapToItem={handleSnapToItem}
									onTouchEnd={handleTouchEnd}
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
							py={4}
							borderBottomColor="gray.100"
							borderBottomWidth={2}
						>
							<Skeleton.Text
								fontSize={15}
								isLoaded={data !== null}
								lines={1}
							>
								{data && (
									<Text
										fontWeight="bold"
										textTransform="uppercase"
										color="blue.800"
										fontSize={14}
									>
										{`${
											data.type === 'sell'
												? 'Bán'
												: 'Cho thuê'
										} ${data.title}`}
									</Text>
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
												ml={-0.5}
											/>
											<Text
												color="gray.400"
												fontWeight="medium"
												fontSize={14}
												numberOfLines={2}
												flex={1}
											>
												{data.location.address}
											</Text>
										</HStack>
									</Pressable>
								)}
							</Skeleton.Text>
							{data && (
								<HStack mt={2}>
									<Box>
										<Text fontWeight="semibold">
											Giá bán
										</Text>
										<Box
											justifyContent="space-between"
											ml={0.5}
											borderRightColor="gray.200"
											borderRightWidth={1}
											pr={4}
										>
											<Text
												fontSize={16}
												fontWeight="bold"
											>
												{`${
													data.prices < 1000
														? data.prices
														: data.prices / 1000
												} ${
													data.prices < 1000
														? 'Triệu'
														: 'Tỷ'
												}`}
											</Text>
											<Text
												fontSize={12}
												color="gray.500"
												fontWeight="medium"
											>
												{`~ ${getPricePerAcreage(
													data.acreages,
													data.prices,
												)}`}
											</Text>
										</Box>
									</Box>
									<Box px={4}>
										<Text fontWeight="semibold">
											Diện tích
										</Text>
										<Text fontSize={16} fontWeight="bold">
											{`${data.acreages} m²`}
										</Text>
									</Box>
								</HStack>
							)}
						</Box>
						<Box
							py={4}
							borderBottomColor="gray.100"
							borderBottomWidth={2}
						>
							<Text
								fontSize={18}
								fontWeight="bold"
								color="gray.700"
								mb={2}
							>
								Thông tin mô tả
							</Text>
							<Skeleton.Text lines={20} isLoaded={data !== null}>
								{data && (
									<>
										{data.video && (
											<YoutubeIframe
												height={200}
												videoId={data.video}
											/>
										)}
										<Text
											mt={data.video ? 2 : 0}
											lineHeight="xl"
											numberOfLines={
												!isHeight
													? undefined
													: isLoadMore
													? undefined
													: 6
											}
											onLayout={handleLayoutContent}
										>
											{`${decodeURI(data.content)}`}
										</Text>
										{isHeight && (
											<Button
												variant="outline"
												mt={6}
												borderColor="info.600"
												_pressed={{
													backgroundColor: 'info.300',
												}}
												onPress={handlePressLoadMore}
											>
												<HStack alignItems="center">
													<Text
														fontSize={16}
														fontWeight="medium"
														color="info.600"
													>
														{isLoadMore
															? 'Thu gọn'
															: 'Xem thêm'}
													</Text>
													<Icon
														as={MaterialIcons}
														name={`keyboard-arrow-${
															isLoadMore
																? 'down'
																: 'up'
														}`}
														size="md"
														color="info.600"
													/>
												</HStack>
											</Button>
										)}
									</>
								)}
							</Skeleton.Text>
						</Box>
						{data && (
							<>
								<Box
									py={4}
									borderBottomColor="gray.100"
									borderBottomWidth={2}
								>
									<Text
										fontSize={18}
										fontWeight="bold"
										color="gray.700"
										mb={2}
									>
										Thông tin cơ bản
									</Text>
									<HStack mb={2}>
										<Text
											flex={1}
											fontWeight="medium"
											color="dark.300"
										>
											Loại nhà đất:
										</Text>
										<Text
											flex={1}
											color="dark.200"
											fontWeight="bold"
										>
											{getName.post.category(
												data.category,
											)}
										</Text>
									</HStack>
									<HStack mb={data.legal ? 2 : 0}>
										<Text
											flex={1}
											fontWeight="medium"
											color="dark.300"
										>
											Tổng diện tích:
										</Text>
										<Text
											flex={1}
											fontWeight="bold"
											color="dark.200"
										>{`${data.acreages.toLocaleString(
											'en',
										)} m²`}</Text>
									</HStack>
									{data.legal && (
										<HStack>
											<Text
												flex={1}
												fontWeight="medium"
												color="dark.300"
											>
												Giấy tờ pháp lý:
											</Text>
											<Text
												flex={1}
												fontWeight="bold"
												color="dark.200"
											>
												{getName.post.legal(data.legal)}
											</Text>
										</HStack>
									)}
								</Box>
								{(data.facades ||
									data.direction ||
									data.ways) && (
									<Box
										py={4}
										borderBottomColor="gray.100"
										borderBottomWidth={2}
									>
										<Text
											fontSize={18}
											fontWeight="bold"
											color="gray.700"
											mb={2}
										>
											Thông tin chi tiết
										</Text>
										{data.direction && (
											<HStack
												mb={
													data.facades || data.ways
														? 2
														: 0
												}
											>
												<Text
													flex={1}
													fontWeight="medium"
													color="dark.300"
												>
													Hướng nhà:
												</Text>
												<Text
													flex={1}
													color="dark.200"
													fontWeight="bold"
												>
													{getName.post.direction(
														data.direction,
													)}
												</Text>
											</HStack>
										)}
										{data.facades && (
											<HStack mb={data.ways ? 2 : 0}>
												<Text
													flex={1}
													fontWeight="medium"
													color="dark.300"
												>
													Mặt tiền:
												</Text>
												<Text
													flex={1}
													fontWeight="bold"
													color="dark.200"
												>{`${data.facades.toLocaleString(
													'en',
												)}m`}</Text>
											</HStack>
										)}
										{data.ways && (
											<HStack>
												<Text
													flex={1}
													fontWeight="medium"
													color="dark.300"
												>
													Đường vào:
												</Text>
												<Text
													flex={1}
													fontWeight="bold"
													color="dark.200"
												>
													{`${data.ways.toLocaleString(
														'en',
													)}m`}
												</Text>
											</HStack>
										)}
									</Box>
								)}
								<Box
									py={4}
									borderBottomColor="gray.100"
									borderBottomWidth={2}
								>
									<Text
										fontSize={18}
										fontWeight="bold"
										color="gray.700"
										mb={2}
									>
										Thông tin liên hệ
									</Text>
									<HStack mb={2}>
										<Text
											flex={1}
											fontWeight="medium"
											color="dark.300"
										>
											Tên liên hệ:
										</Text>
										<Text
											flex={1}
											color="dark.200"
											fontWeight="bold"
										>
											{data.poster.name}
										</Text>
									</HStack>
									<HStack>
										<Text
											flex={1}
											fontWeight="medium"
											color="dark.300"
										>
											Số điện thoại:
										</Text>
										<Text
											flex={1}
											fontWeight="bold"
											color="dark.200"
										>
											{data.poster.phoneNumber
												.map(item =>
													formatPhoneNumber(item),
												)
												.join(', ')}
										</Text>
									</HStack>
								</Box>
								<Box py={4}>
									<Text
										fontSize={18}
										fontWeight="bold"
										color="gray.700"
										mb={2}
									>
										Thông tin bài đăng
									</Text>
									<HStack mb={2}>
										<Text
											flex={1}
											fontWeight="medium"
											color="dark.300"
										>
											Ngày đăng:
										</Text>
										<Text
											flex={1}
											color="dark.200"
											fontWeight="bold"
										>
											{format(
												data.time,
												'HH:mm - dd/MM/yyyy',
											)}
										</Text>
									</HStack>
									<HStack>
										<Text
											flex={1}
											fontWeight="medium"
											color="dark.300"
										>
											Mã tin:
										</Text>
										<Text
											flex={1}
											fontWeight="bold"
											color="dark.200"
										>
											{route.params.postID}
										</Text>
									</HStack>
								</Box>
							</>
						)}
					</Box>
				</ScrollView>
				{data && (
					<HStack
						p={4}
						pb={Platform.OS === 'android' ? 4 : 0}
						alignItems="center"
						borderTopColor="gray.200"
						borderTopWidth={1}
					>
						<Button
							colorScheme="info"
							flex={1}
							ml={2}
							onPress={handlePressEdit}
						>
							<HStack alignItems="center">
								<Icon
									as={MaterialCommunityIcons}
									name="file-document-edit"
									size={5}
									color="white"
									mr={2}
								/>
								<Text
									fontWeight="bold"
									color="white"
									fontSize={14}
								>
									Sửa tin đăng
								</Text>
							</HStack>
						</Button>
					</HStack>
				)}
			</Box>
			{data && (
				<MapComponent
					isOpen={isOpen}
					onClose={onClose}
					{...data.location.coordinate}
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
