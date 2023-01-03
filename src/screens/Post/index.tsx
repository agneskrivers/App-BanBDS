import React, { FunctionComponent, useEffect, useState, useRef } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import MapView, { Marker } from 'react-native-maps';
import YoutubeIframe from 'react-native-youtube-iframe';
import { format } from 'date-fns';
import { RouteProp } from '@react-navigation/native';
import {
	Dimensions,
	GestureResponderEvent,
	NativeSyntheticEvent,
	NativeScrollEvent,
	Linking,
	Share,
	Alert,
	StatusBar,
	StyleSheet,
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
	Modal,
	Skeleton,
	Center,
	PresenceTransition,
	useDisclose,
} from 'native-base';

// Helpers
import { getName, getPricePerAcreage, formatPhoneNumber } from '@helpers';

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

// Demo
import { post } from '../../../demo';

const Index: FunctionComponent<Props> = ({ navigation, route }) => {
	// Constants
	const { width: screenWidth, height: screenHeight } =
		Dimensions.get('screen');

	// States
	const [isScroll, setIsScroll] = useState<boolean>(false);

	const [data, setData] = useState<IPostInfo | null>(null);
	const [index, setIndex] = useState<number>(0);

	// Hooks
	const { isOpen, onToggle } = useDisclose();

	// Ref
	const carouselRef = useRef<Carousel<string>>(null);

	// Effects
	useEffect(() => {
		const getData = async () => {
			setTimeout(() => {
				setData(post);
			}, 2000);
		};

		getData();
	}, []);

	return (
		<>
			<StatusBar barStyle="dark-content" />
			<Box flex={1} bg="white" safeAreaBottom position="relative">
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
				>
					<Pressable
						p={1}
						rounded="full"
						background={
							isScroll || !data ? 'transparent' : '#0000008a'
						}
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
						>
							<Icon
								as={MaterialCommunityIcons}
								name="dots-horizontal"
								color={isScroll ? 'muted.500' : 'white'}
								size={isScroll ? 'lg' : 'md'}
							/>
						</Pressable>
					)}
				</HStack>
				<ScrollView
					showsVerticalScrollIndicator={false}
					showsHorizontalScrollIndicator={false}
					scrollEventThrottle={1}
					bgColor="white"
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
												source={{ uri: item }}
												resizeMode="cover"
												h={250}
												w={screenWidth}
												alt={`Image Project ${item}`}
											/>
										</Pressable>
									)}
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
									<Pressable>
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
											numberOfLines={6}
										>
											{`${decodeURI(data.content)}`}
										</Text>
										<Button
											variant="outline"
											mt={6}
											borderColor="info.600"
											_pressed={{
												backgroundColor: 'info.300',
											}}
										>
											<HStack alignItems="center">
												<Text
													fontSize={16}
													fontWeight="medium"
													color="info.600"
												>
													Xem thêm
												</Text>
												<Icon
													as={MaterialIcons}
													name="keyboard-arrow-up"
													size="md"
													color="info.600"
												/>
											</HStack>
										</Button>
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
				{data && (
					<HStack
						p={4}
						pb={0}
						alignItems="center"
						borderTopColor="gray.200"
						borderTopWidth={1}
					>
						<Button colorScheme="blue" flex={1} mr={2}>
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
						<Button colorScheme="blue" flex={1} ml={2}>
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
			{data && (
				<>
					<Modal
						isOpen={false}
						animationPreset="slide"
						size="full"
						px={4}
					>
						<Modal.Content
							bgColor="transparent"
							mb={1}
							safeAreaBottom
							mt="auto"
							shadow="none"
						>
							<Modal.Body
								m={0}
								p={0}
								backgroundColor="white"
								borderRadius={7}
							>
								<Pressable
									flex={1}
									py={4}
									borderBottomColor="gray.200"
									borderBottomWidth={1}
								>
									<Text
										textAlign="center"
										fontWeight="medium"
										fontSize={16}
									>
										Lưu Ảnh
									</Text>
								</Pressable>
								<Pressable flex={1} py={4}>
									<Text
										textAlign="center"
										fontWeight="medium"
										fontSize={16}
									>
										Sao chép liên kết
									</Text>
								</Pressable>
							</Modal.Body>
							<Modal.Footer
								justifyContent="center"
								alignItems="center"
								mt={2}
								borderRadius={7}
							>
								<Pressable flex={1}>
									<Text
										color="blue.600"
										fontSize={16}
										fontWeight="medium"
										textAlign="center"
									>
										Hủy
									</Text>
								</Pressable>
							</Modal.Footer>
						</Modal.Content>
					</Modal>
					<Modal isOpen={false} size="xl">
						<Modal.Content>
							<Modal.Body p={0}>
								<MapView
									initialRegion={{
										latitude: data.coordinate.latitude,
										longitude: data.coordinate.longitude,
										latitudeDelta: 0.1,
										longitudeDelta: 0.1,
									}}
									style={{
										width: screenWidth * 0.9,
										height: screenHeight * 0.6,
									}}
								>
									<Marker
										coordinate={{
											latitude: data.coordinate.latitude,
											longitude:
												data.coordinate.longitude,
										}}
									/>
								</MapView>
							</Modal.Body>
						</Modal.Content>
					</Modal>
					<Modal
						isOpen={false}
						animationPreset="slide"
						size="full"
						px={4}
					>
						<Modal.Content
							bgColor="transparent"
							mb={1}
							safeAreaBottom
							mt="auto"
							shadow="none"
						>
							<Modal.Body
								m={0}
								p={0}
								backgroundColor="white"
								borderRadius={7}
							>
								{data.phoneNumber.map((item, i) => (
									<Pressable
										key={item}
										flex={1}
										py={4}
										borderBottomColor="gray.200"
										borderBottomWidth={
											data.phoneNumber.length - 1 === i
												? 0
												: 1
										}
									>
										<Text
											textAlign="center"
											fontWeight="medium"
											fontSize={16}
										>
											{formatPhoneNumber(item)}
										</Text>
									</Pressable>
								))}
							</Modal.Body>
							<Modal.Footer
								justifyContent="center"
								alignItems="center"
								mt={2}
								borderRadius={7}
							>
								<Pressable flex={1}>
									<Text
										color="blue.600"
										fontSize={16}
										fontWeight="medium"
										textAlign="center"
									>
										Hủy
									</Text>
								</Pressable>
							</Modal.Footer>
						</Modal.Content>
					</Modal>
				</>
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
