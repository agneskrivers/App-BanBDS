import React, { FunctionComponent, useState, useEffect } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import {
	Text,
	Box,
	Pressable,
	Icon,
	Progress,
	HStack,
	Image,
	Center,
} from 'native-base';

// Type
type Status = 'normal' | 'uploading' | 'failed' | 'success';

const Index: FunctionComponent = () => {
	// States
	const [status, setStatus] = useState<Status>('uploading');

	return (
		<Box>
			<Pressable>
				<Box
					flex={1}
					alignItems="center"
					py={4}
					borderWidth={1}
					borderStyle="dashed"
					borderColor="gray.400"
					borderRadius={3}
					mb={2}
				>
					<Icon
						as={MaterialCommunityIcons}
						name={
							status === 'normal'
								? 'cloud-upload-outline'
								: status === 'uploading'
								? 'cloud-sync-outline'
								: status === 'success'
								? 'cloud-check-outline'
								: 'weather-cloudy-alert'
						}
						size={16}
						color={
							status === 'normal' || status === 'uploading'
								? 'primary.300'
								: status === 'success'
								? 'success.300'
								: 'danger.300'
						}
					/>
					{status !== 'uploading' ? (
						<Text
							fontSize={14}
							fontWeight="medium"
							color={
								status === 'normal'
									? 'primary.400'
									: status === 'success'
									? 'success.400'
									: 'danger.400'
							}
							italic
						>
							{status === 'normal'
								? 'Bấm để chọn ảnh cần tải lên'
								: status === 'success'
								? 'Tải ảnh thành công'
								: 'Lỗi tải ảnh. Vui lòng thử lại!'}
						</Text>
					) : (
						<Progress w="80%" value={10} mx="auto" />
					)}
					<Center>
						<Text
							color="muted.600"
							fontWeight={500}
						>{`9/11 ảnh`}</Text>
					</Center>
				</Box>
			</Pressable>
			<Box
				w="100%"
				height={200}
				bg="coolGray.400"
				position="relative"
				alignItems="center"
				justifyContent="center"
				mb={2}
				borderRadius="md"
			>
				<Pressable
					zIndex={9}
					position="absolute"
					top={2}
					right={2}
					backgroundColor="white"
					borderRadius={100}
					p={1}
				>
					<Icon
						as={MaterialCommunityIcons}
						name="close"
						size={4}
						color="black"
					/>
				</Pressable>
				<Box
					position="absolute"
					top={2}
					left={2}
					py={1}
					px={2}
					backgroundColor="white"
					borderRadius={5}
					zIndex={9}
				>
					<Text fontSize={12} fontWeight="medium">
						Ảnh đại diện
					</Text>
				</Box>
				<Image
					source={{
						uri: 'https://file4.batdongsan.com.vn/crop/240x180/2022/12/22/20221222103914-9266_wm.jpg',
					}}
					alt="Image"
					h={200}
					resizeMode="cover"
					style={{ aspectRatio: 240 / 180 }}
				/>
			</Box>
			<HStack justifyContent="space-between" flexWrap="wrap">
				<Box
					w="45%"
					height={100}
					bg="coolGray.400"
					position="relative"
					alignItems="center"
					justifyContent="center"
					borderRadius="md"
					overflow="hidden"
					mb={2}
				>
					<Pressable
						zIndex={9}
						position="absolute"
						top={2}
						right={2}
						backgroundColor="white"
						borderRadius={100}
						p={0.5}
					>
						<Icon
							as={MaterialCommunityIcons}
							name="close"
							size={4}
							color="black"
						/>
					</Pressable>
					<Image
						source={{
							uri: 'https://file4.batdongsan.com.vn/crop/240x180/2022/12/22/20221222103914-9266_wm.jpg',
						}}
						alt="Image"
						h={200}
						resizeMode="contain"
						style={{ aspectRatio: 240 / 180 }}
					/>
				</Box>
				<Box
					w="45%"
					height={100}
					bg="coolGray.400"
					position="relative"
					alignItems="center"
					justifyContent="center"
					borderRadius="md"
					overflow="hidden"
					mb={2}
				>
					<Pressable
						zIndex={9}
						position="absolute"
						top={2}
						right={2}
						backgroundColor="white"
						borderRadius={100}
						p={0.5}
					>
						<Icon
							as={MaterialCommunityIcons}
							name="close"
							size={4}
							color="black"
						/>
					</Pressable>
					<Image
						source={{
							uri: 'https://file4.batdongsan.com.vn/crop/240x180/2022/12/22/20221222103914-9266_wm.jpg',
						}}
						alt="Image"
						h={200}
						resizeMode="contain"
						style={{ aspectRatio: 240 / 180 }}
					/>
				</Box>
				<Box
					w="45%"
					height={100}
					bg="coolGray.400"
					position="relative"
					alignItems="center"
					justifyContent="center"
					borderRadius="md"
					overflow="hidden"
					mb={2}
				>
					<Pressable
						zIndex={9}
						position="absolute"
						top={2}
						right={2}
						backgroundColor="white"
						borderRadius={100}
						p={0.5}
					>
						<Icon
							as={MaterialCommunityIcons}
							name="close"
							size={4}
							color="black"
						/>
					</Pressable>
					<Image
						source={{
							uri: 'https://file4.batdongsan.com.vn/crop/240x180/2022/12/22/20221222103914-9266_wm.jpg',
						}}
						alt="Image"
						h={200}
						resizeMode="contain"
						style={{ aspectRatio: 240 / 180 }}
					/>
				</Box>
			</HStack>
		</Box>
	);
};

export default Index;
