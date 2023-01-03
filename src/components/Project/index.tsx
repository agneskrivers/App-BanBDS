import React, { FunctionComponent } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Box, Image, Badge, Text, HStack, Icon, Skeleton } from 'native-base';

// Configs

// Helpers
import { getName } from '@helpers';

// Interfaces
import type { IProjectCompact } from '@interfaces';

// Props
interface Props {
	data: IProjectCompact;
	isLoaded: boolean;
	size?: 'full';
	isFirst?: boolean;
	isLast?: boolean;
}

const Index: FunctionComponent<Props> = props => {
	// Props
	const { data, isFirst, isLast, size, isLoaded } = props;

	const {
		acreages,
		address,
		company,
		image,
		prices,
		projectID,
		status,
		title,
		type,
	} = data;

	// Validator
	const validInvestorIcon = company ? 'badge' : 'address-book';
	const validInvestor = company ? company : address;

	const validPrices = !prices
		? acreages
		: typeof prices === 'number'
		? `${prices} Triệu/m²`
		: `${prices.min} - ${prices.max} Triệu/m²`;
	const validPricesIcon = prices ? 'currency-usd' : 'island';

	return (
		<Box
			shadow={2}
			bg="white"
			borderRadius="md"
			ml={isFirst ? 0 : size === 'full' ? 0 : 3}
			mr={isLast ? 0 : size === 'full' ? 0 : 3}
			width={size ? '100%' : 260}
		>
			<Skeleton
				h={size ? 200 : 160}
				borderRadius="md"
				isLoaded={isLoaded}
			>
				<Box position="relative" h={size ? 200 : 160}>
					<Image
						borderRadius="md"
						source={{
							uri: image, // TODO: Fix Uri Image
						}}
						height={size ? 200 : 160}
						width="100%"
						resizeMode="cover"
						alt={`Image Project ${projectID}`}
					/>
					<Badge
						colorScheme="tertiary"
						px={2}
						variant="subtle"
						bottom={-1}
						right={-1}
						zIndex={2}
						position="absolute"
						borderTopLeftRadius="md"
						borderBottomRightRadius="md"
						fontSize={16}
					>
						{getName.project.status(status)}
					</Badge>
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
				h="auto"
			>
				<Skeleton.Text lines={size ? 2 : 1} isLoaded={isLoaded}>
					<Text
						fontWeight="bold"
						fontSize={13}
						color="secondary.700"
						numberOfLines={size ? 2 : 1}
						ellipsizeMode="tail"
						textTransform="uppercase"
					>
						{decodeURI(title)}
					</Text>
				</Skeleton.Text>
				<HStack
					mt={2}
					borderTopWidth={1}
					borderTopColor="muted.100"
					pt={2}
				>
					<Skeleton.Text lines={1} flex={1} isLoaded={isLoaded}>
						<HStack alignItems="center" flex={1}>
							<Icon
								as={MaterialIcons}
								name="map"
								size={4}
								color="info.600"
								mr={1}
							/>
							<Text fontSize={12} color="dark.500">
								{getName.project.t(type)}
							</Text>
						</HStack>
					</Skeleton.Text>

					<Skeleton.Text lines={1} flex={1} isLoaded={isLoaded}>
						<HStack alignItems="center" flex={1}>
							<Icon
								as={MaterialCommunityIcons}
								name={validPricesIcon}
								size={4}
								color="info.600"
								mr={1}
							/>
							<Text fontSize="12" color="dark.500">
								{validPrices}
							</Text>
						</HStack>
					</Skeleton.Text>
				</HStack>
				<HStack mt={2}>
					<Skeleton.Text lines={1} isLoaded={isLoaded}>
						<HStack alignItems="center" flex={1}>
							<Icon
								as={company ? MaterialIcons : FontAwesome}
								name={validInvestorIcon}
								size={4}
								color="info.600"
								mr={1}
							/>
							<Text
								fontSize="12"
								color="dark.500"
								numberOfLines={1}
								ellipsizeMode="tail"
								pr={4}
							>
								{validInvestor}
							</Text>
						</HStack>
					</Skeleton.Text>
				</HStack>
			</Box>
		</Box>
	);
};

export default Index;
