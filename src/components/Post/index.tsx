import React, { FunctionComponent } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Box, Text, HStack, Image, Icon, Skeleton } from 'native-base';

// Helpers
import { getName, getPricePerAcreage } from '@helpers';

// Interfaces
import type { IPostCompact } from '@interfaces';

// Props
interface Props {
	data: IPostCompact;
	isLoaded: boolean;
}

const Index: FunctionComponent<Props> = ({ data, isLoaded }) => {
	// Props
	const {
		acreages,
		address,
		category,
		direction,
		image,
		isVideo,
		legal,
		prices,
		title,
		postID,
	} = data;

	const unit = prices < 1000 ? 'Triệu' : 'Tỷ';

	return (
		<Box
			borderTopLeftRadius={15}
			borderTopRightRadius={15}
			borderBottomLeftRadius="md"
			borderBottomRightRadius="md"
			bgColor="white"
			w="100%"
			shadow={2}
		>
			<Skeleton
				h={200}
				borderTopLeftRadius={15}
				borderTopRightRadius={15}
				borderBottomLeftRadius={10}
				borderBottomRightRadius={10}
				isLoaded={isLoaded}
			>
				<Box
					h={200}
					position="relative"
					borderTopLeftRadius={15}
					borderTopRightRadius={15}
					borderBottomLeftRadius={10}
					borderBottomRightRadius={10}
					w="100%"
					bgColor="muted.400"
				>
					<Image
						resizeMode="cover"
						source={{
							uri: image,
						}}
						width="100%"
						height="100%"
						alt={`Product Image ${postID}`}
						borderTopLeftRadius={15}
						borderTopRightRadius={15}
						borderBottomLeftRadius={10}
						borderBottomRightRadius={10}
					/>
					<HStack
						alignItems="center"
						px={3}
						py={1}
						position="absolute"
						zIndex={2}
						left={0}
						bottom={0}
						borderTopRightRadius="md"
						borderBottomLeftRadius={9}
						backgroundColor="info.300"
					>
						<Text fontSize={14} fontWeight="bold" color="info.600">
							{`${
								prices < 1000 ? prices : prices / 1000
							} ${unit}`}
						</Text>
						<Icon
							as={MaterialCommunityIcons}
							name="arrow-left-right-bold"
							mx={1}
							size={3}
							color="info.600"
						/>
						<Text fontSize={14} fontWeight="bold" color="info.600">
							{`${getPricePerAcreage(acreages, prices)}`}
						</Text>
					</HStack>
					{isVideo && (
						<Box position="absolute" bottom={2} right={2}>
							<Icon
								as={MaterialCommunityIcons}
								name="video-check-outline"
								size={8}
								color="white"
							/>
						</Box>
					)}
				</Box>
			</Skeleton>
			<Box
				borderBottomLeftRadius="md"
				borderBottomRightRadius="md"
				mt={-1}
				borderWidth={1}
				borderColor="white"
				borderTopWidth={0}
				p={3}
			>
				<Skeleton.Text lines={2} fontSize={13} isLoaded={isLoaded}>
					<Text
						fontWeight="bold"
						fontSize={13}
						color="pink.700"
						numberOfLines={2}
						ellipsizeMode="tail"
						textTransform="uppercase"
					>
						{title}
					</Text>
				</Skeleton.Text>
				<HStack
					mt={2}
					borderTopWidth={1}
					borderTopColor="muted.100"
					pt={3}
				>
					<Skeleton.Text lines={1} flex={1} isLoaded={isLoaded}>
						<HStack alignItems="center" flex={1}>
							<Icon
								as={MaterialCommunityIcons}
								name="home"
								size={5}
								color="info.600"
								mr={2}
							/>
							<Text fontSize={12} color="dark.500">
								{getName.post.category(category)}
							</Text>
						</HStack>
					</Skeleton.Text>
					<Skeleton.Text lines={1} flex={1} isLoaded={isLoaded}>
						<HStack alignItems="center" flex={1}>
							<Icon
								as={MaterialCommunityIcons}
								name="form-textarea"
								size={5}
								color="info.600"
								mr={2}
							/>
							<Text fontSize={12} color="dark.500">
								{`${acreages} m²`}
							</Text>
						</HStack>
					</Skeleton.Text>
				</HStack>
				{(legal || direction) && (
					<HStack mt={2}>
						{direction && (
							<Skeleton.Text
								lines={1}
								flex={1}
								isLoaded={isLoaded}
							>
								<HStack alignItems="center" flex={1}>
									<Icon
										as={MaterialCommunityIcons}
										name="sign-direction"
										size={5}
										color="info.600"
										mr={2}
									/>
									<Text fontSize={12} color="dark.500">
										{getName.post.direction(direction)}
									</Text>
								</HStack>
							</Skeleton.Text>
						)}
						{legal && (
							<Skeleton.Text
								lines={1}
								flex={1}
								isLoaded={isLoaded}
							>
								<HStack alignItems="center" flex={1}>
									<Icon
										as={MaterialCommunityIcons}
										name="file-document-outline"
										size={5}
										color="info.600"
										mr={2}
									/>
									<Text fontSize={12} color="dark.500">
										{getName.post.legal(legal)}
									</Text>
								</HStack>
							</Skeleton.Text>
						)}
					</HStack>
				)}
				<Skeleton.Text lines={1} isLoaded={isLoaded}>
					<HStack
						mt={3}
						borderTopWidth={1}
						borderTopColor="muted.100"
						pt={2}
						alignItems="center"
						width="100%"
					>
						<Icon
							as={MaterialCommunityIcons}
							name="google-maps"
							size={5}
							color="info.600"
						/>
						<Text fontSize={13} color="dark.500" numberOfLines={2}>
							{address}
						</Text>
					</HStack>
				</Skeleton.Text>
			</Box>
		</Box>
	);
};

export default Index;
