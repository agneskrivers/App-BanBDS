import React, {
	FunctionComponent,
	useEffect,
	useState,
	useRef,
	useContext,
} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import RNFetchBlob from 'rn-fetch-blob';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import YoutubeIframe from 'react-native-youtube-iframe';
import { format } from 'date-fns';
import { RouteProp } from '@react-navigation/native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import {
	Dimensions,
	GestureResponderEvent,
	NativeSyntheticEvent,
	NativeScrollEvent,
	Linking,
	Alert,
	StatusBar,
	StyleSheet,
	PermissionsAndroid,
	Platform,
	Share,
	LayoutChangeEvent,
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
	IconButton,
	Stagger,
	Actionsheet,
} from 'native-base';

// Components
import { LoadingComponent, MapComponent } from '@components';

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
	IPostInfo,
	ICompositeNavigationStacks,
	IStackParams,
} from '@interfaces';

// Props
interface Props {
	navigation: ICompositeNavigationStacks<'Post'>;
	route: RouteProp<IStackParams, 'Post'>;
}

const Index: FunctionComponent<Props> = ({ navigation, route }) => {
	// Constants
	const { width: screenWidth } = Dimensions.get('screen');

	// States
	const [isScroll, setIsScroll] = useState<boolean>(false);
	const [isLoaded, setIsLoaded] = useState<boolean>(false);
	const [isHeight, setIsHeight] = useState<boolean>(true);
	const [isLoadMore, setIsLoadMore] = useState<boolean>(false);

	const [data, setData] = useState<IPostInfo | null>(null);
	const [index, setIndex] = useState<number>(0);

	const [image, setImage] = useState<string>();

	// Hooks
	const { isOpen, onToggle } = useDisclose();
	const { isNetwork, onNotification } = useContext(Context);
	const {
		isOpen: isPhoneNumber,
		onOpen: handleOpenPhoneNumber,
		onClose: handleClosePhoneNumber,
	} = useDisclose();
	const {
		isOpen: isZalo,
		onOpen: handleOpenZalo,
		onClose: handleCloseZalo,
	} = useDisclose();
	const {
		isOpen: isMap,
		onOpen: onOpenMap,
		onClose: onCloseMap,
	} = useDisclose();

	// Ref
	const carouselRef = useRef<Carousel<string>>(null);

	// Effects
	useEffect(() => {
		const controller = new AbortController();

		const getData = async (
			signal: AbortSignal,
			postID: number,
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

			const result = await services.posts.info(signal, token, postID);

			if (!result) throw new Error();

			if (result === 'UnauthorizedDevice') {
				if (tokenDevice) throw new Error();

				const renewToken = await renewTokenDevice(signal);

				if (!renewToken) throw new Error();

				return getData(signal, postID, renewToken);
			}

			if (result === 'BadRequest') {
				onNotification(
					'toast-screen-post-result-bad-request',
					'Vui lòng thử lại!',
					'Không tìm thấy tin đăng',
					'warning',
				);

				if (navigation.canGoBack()) {
					navigation.goBack();
				} else {
					navigation.navigate('Posts', { type: 'sell' });
				}

				return;
			}

			setData(result);
		};

		if (!data) {
			if (isNetwork) {
				getData(controller.signal, route.params.postID)
					.catch(() => {
						onNotification(
							'toast-screen-post-error',
							'Vui lòng thử lại!',
							'Máy chủ bị lỗi',
							'error',
						);

						if (navigation.canGoBack()) {
							navigation.goBack();
						} else {
							navigation.navigate('Posts', { type: 'sell' });
						}
					})
					.finally(() => setIsLoaded(true));
			} else {
				if (navigation.canGoBack()) {
					navigation.goBack();
				} else {
					navigation.navigate('Posts', { type: 'sell' });
				}
			}
		}

		return () => controller.abort();
	}, [data, isNetwork, route.params.postID, navigation, onNotification]);
	useEffect(() => {
		const controller = new AbortController();

		const hasAndroidPermission = async (): Promise<boolean> => {
			const permission =
				Platform.Version >= 33
					? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
					: PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

			const hasPermission = await PermissionsAndroid.check(permission);

			if (hasPermission) return true;

			const status = await PermissionsAndroid.request(permission);

			return status === 'granted';
		};

		const getData = async (id: string) => {
			if (Platform.OS === 'android' && !(await hasAndroidPermission()))
				return;

			const url = `${host}/images/posts/${id}`;

			const file = await RNFetchBlob.config({
				fileCache: true,
				appendExt: 'jpg',
			}).fetch('GET', url);

			const path = file.path();

			await CameraRoll.save(path, { type: 'photo' });

			file.flush();
		};

		if (image) {
			getData(image)
				.then(() => Alert.alert('Lưu ảnh thành công'))
				.catch(() => Alert.alert('Lưu ảnh thất bại'))
				.finally(() => setImage(undefined));
		}

		return () => controller.abort();
	}, [image]);

	// Handles
	const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
		const { y } = e.nativeEvent.contentOffset;

		if (y >= 175 && !isScroll) return setIsScroll(true);

		if (y < 175 && isScroll) return setIsScroll(false);
	};
	const handleSnapToItem = (value: number) => setIndex(value);
	const handleTouchEnd = (e: GestureResponderEvent) => {
		if (carouselRef && carouselRef.current && data) {
			const { locationX } = e.nativeEvent;

			const width = screenWidth / 2;

			let newIndex = index + (locationX > width ? 1 : -1);

			if (newIndex === -1) {
				newIndex = data.images.length - 1;
			}

			if (newIndex >= data.images.length) {
				newIndex = 0;
			}

			carouselRef.current.snapToItem(newIndex);

			setIndex(newIndex);
		}
	};
	const handleLayoutContent = (e: LayoutChangeEvent) => {
		const { height } = e.nativeEvent.layout;

		const minHeight = 14 * 1.75 * 6;

		if (height <= minHeight && isHeight) {
			setIsHeight(false);
		}
	};

	const handlePressClose = () => {
		if (navigation.canGoBack()) {
			navigation.goBack();
		} else {
			navigation.navigate('Posts', { type: 'sell' });
		}
	};
	const handlePressMenu = () => onToggle();
	const handlePressSavePhoto = () => {
		if (data !== null && !image) {
			setImage(data.images[index]);
			onToggle();
		}
	};
	const handlePressShare = async () => {
		if (data) {
			const url = `${host}/${data.link}`;

			await Share.share({ url });

			onToggle();
		}
	};
	const handlePressLoadMore = () => {
		if (isHeight) {
			setIsLoadMore(preLoadMore => !preLoadMore);
		}
	};
	const handlePressPhoneNumber = (phone?: string) => {
		if (phone) {
			Linking.openURL(`tel:${phone}`);
			handleClosePhoneNumber();

			return;
		}

		if (data) {
			console.log(data.phoneNumber);
			if (data.phoneNumber.length > 0) return handleOpenPhoneNumber();

			return Linking.openURL(`tel:${data.phoneNumber[0]}`);
		}
	};
	const handlePressZalo = (phone?: string) => {
		if (phone) {
			Linking.openURL(`https://zalo.me/${phone}`);

			handleCloseZalo();

			return;
		}

		if (data) {
			if (data.phoneNumber.length > 0) return handleOpenZalo();

			return Linking.openURL(`https://zalo.me/${data.phoneNumber[0]}`);
		}
	};
	const handlePressAddress = () => {
		if (data) return onOpenMap();
	};

	return (
		<>
			<StatusBar barStyle="dark-content" />
			<Box flex={1} bg="white" safeAreaBottom position="relative">
				<HStack
					px={4}
					pb={4}
					zIndex={99}
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
					<IconButton
						variant="solid"
						bg={
							isScroll || !data || !isLoaded
								? 'transparent'
								: '#0000008a'
						}
						borderRadius="full"
						p={1}
						icon={
							<Icon
								as={MaterialCommunityIcons}
								name="close"
								color={
									isScroll || !data || !isLoaded
										? 'muted.500'
										: 'white'
								}
								size={
									isScroll || !data || !isLoaded ? 'lg' : 'md'
								}
							/>
						}
						onPress={handlePressClose}
						_pressed={{
							backgroundColor:
								isScroll || !data || !isLoaded
									? 'white'
									: 'gray.600',
						}}
					/>
					{data && isLoaded && (
						<Center position="relative">
							<IconButton
								variant="solid"
								bg={isScroll ? 'transparent' : '#0000008a'}
								borderRadius="full"
								p={1}
								icon={
									<Icon
										as={MaterialCommunityIcons}
										name="dots-horizontal"
										size={isScroll ? 'lg' : 'md'}
										color={isScroll ? 'muted.500' : 'white'}
									/>
								}
								onPress={handlePressMenu}
								_pressed={{
									backgroundColor:
										isScroll || !data || !isLoaded
											? 'white'
											: 'gray.600',
								}}
							/>
							{isOpen && (
								<Box
									alignItems="center"
									position="absolute"
									top="100%"
									mt={isScroll ? 6 : 4}
									w={20}
									h={20}
								>
									<Stagger
										visible={isOpen}
										initial={{
											opacity: 0,
											scale: 0,
											translateY: 34,
										}}
										animate={{
											translateY: 0,
											scale: 1,
											opacity: 1,
											transition: {
												type: 'spring',
												mass: 0.8,
												stagger: {
													offset: 30,
													reverse: true,
												},
											},
										}}
										exit={{
											translateY: 34,
											scale: 0.5,
											opacity: 0,
											transition: {
												duration: 100,
												stagger: {
													offset: 30,
													reverse: true,
												},
											},
										}}
									>
										<IconButton
											mb={2}
											variant="solid"
											bg="red.500"
											colorScheme="red"
											borderRadius="full"
											icon={
												<Icon
													as={MaterialIcons}
													size={
														isScroll ? 'lg' : 'md'
													}
													name="photo-library"
													_dark={{
														color: 'warmGray.50',
													}}
													color="warmGray.50"
												/>
											}
											onPress={handlePressSavePhoto}
										/>
										<IconButton
											mb={2}
											variant="solid"
											bg="indigo.500"
											colorScheme="indigo"
											borderRadius="full"
											icon={
												<Icon
													as={MaterialIcons}
													size={
														isScroll ? 'lg' : 'md'
													}
													name="share"
													_dark={{
														color: 'warmGray.50',
													}}
													color="warmGray.50"
												/>
											}
											onPress={handlePressShare}
										/>
									</Stagger>
								</Box>
							)}
						</Center>
					)}
				</HStack>
				<ScrollView
					showsVerticalScrollIndicator={false}
					showsHorizontalScrollIndicator={false}
					scrollEventThrottle={1}
					bgColor="white"
					onScroll={handleScroll}
				>
					<Skeleton h={250} isLoaded={data !== null && isLoaded}>
						{data && isLoaded && (
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
								{image === undefined && (
									<Box
										zIndex={2}
										position="absolute"
										bottom={0}
									>
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
								)}
								{image && (
									<Center
										flex={1}
										position="absolute"
										top={0}
										left={0}
										zIndex={9}
										w="100%"
										h={250}
									>
										<LoadingComponent isWhite />
									</Center>
								)}
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
								isLoaded={data !== null && isLoaded}
								lines={1}
							>
								{data && isLoaded && (
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
								isLoaded={data !== null && isLoaded}
								lines={2}
								mt={2}
							>
								{data && isLoaded && (
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
												{data.address}
											</Text>
										</HStack>
									</Pressable>
								)}
							</Skeleton.Text>
							{data && isLoaded && (
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
							<Skeleton.Text
								lines={20}
								isLoaded={data !== null && isLoaded}
							>
								{data && isLoaded && (
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
						{data && isLoaded && (
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
											{data.contact}
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
											{data.phoneNumber
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
				{data && isLoaded && (
					<HStack
						p={4}
						pb={Platform.OS === 'android' ? 4 : 0}
						alignItems="center"
						borderTopColor="gray.200"
						borderTopWidth={1}
					>
						<Button
							colorScheme="blue"
							flex={1}
							mr={2}
							onPress={() => handlePressPhoneNumber()}
						>
							<HStack alignItems="center">
								<Icon
									as={MaterialIcons}
									name="phone-in-talk"
									color="white"
									size="sm"
									mr={2}
								/>
								<Text
									fontWeight="bold"
									color="white"
									fontSize={15}
								>
									Gọi Ngay
								</Text>
							</HStack>
						</Button>
						<Button
							colorScheme="blue"
							flex={1}
							ml={2}
							onPress={() => handlePressZalo()}
						>
							<HStack alignItems="center">
								<Icon
									as={AntDesign}
									name="message1"
									color="white"
									size="sm"
									mr={2}
								/>
								<Text
									fontWeight="bold"
									color="white"
									fontSize={15}
								>
									Zalo
								</Text>
							</HStack>
						</Button>
					</HStack>
				)}
			</Box>
			{data && isLoaded && data.phoneNumber.length > 0 && (
				<>
					<Actionsheet
						isOpen={isPhoneNumber}
						onClose={handleClosePhoneNumber}
						hideDragIndicator
					>
						<Actionsheet.Content borderTopRadius={0}>
							<Box w="100%" p={4} justifyContent="center">
								<Text
									fontSize="16"
									color="gray.500"
									_dark={{
										color: 'gray.300',
									}}
								>
									Vui lòng chọn số để gọi
								</Text>
							</Box>
							{data.phoneNumber.map(item => (
								<Actionsheet.Item
									key={item}
									onPress={() => handlePressPhoneNumber(item)}
								>
									{formatPhoneNumber(item)}
								</Actionsheet.Item>
							))}
						</Actionsheet.Content>
					</Actionsheet>
					<Actionsheet
						isOpen={isZalo}
						onClose={handleCloseZalo}
						hideDragIndicator
					>
						<Actionsheet.Content borderTopRadius={0}>
							<Box w="100%" p={4} justifyContent="center">
								<Text
									fontSize="16"
									color="gray.500"
									_dark={{
										color: 'gray.300',
									}}
								>
									Vui lòng chọn số
								</Text>
							</Box>
							{data.phoneNumber.map(item => (
								<Actionsheet.Item
									key={item}
									onPress={() => handlePressZalo(item)}
								>
									{formatPhoneNumber(item)}
								</Actionsheet.Item>
							))}
						</Actionsheet.Content>
					</Actionsheet>
				</>
			)}
			{data && isLoaded && (
				<MapComponent
					isOpen={isMap}
					onClose={onCloseMap}
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
