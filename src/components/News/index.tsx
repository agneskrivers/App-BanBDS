import React, { FunctionComponent } from 'react';
import { Image, Box, Text, Skeleton } from 'native-base';
import { format } from 'date-fns';

// Interfaces
import type { INewsCompact } from '@interfaces';

// Props
interface Props {
	data: INewsCompact;
	isLoaded: boolean;
	isFirst?: boolean;
}

const Index: FunctionComponent<Props> = ({ data, isLoaded, isFirst }) => {
	// Props
	const { createdAt, id, thumbnail, title } = data;

	return (
		<Box
			flexDirection={isFirst && isLoaded ? 'column' : 'row'}
			position="relative"
			bg={isFirst && isLoaded ? 'white' : undefined}
			borderRadius={isFirst && isLoaded ? 'xl' : undefined}
			shadow={isFirst && isLoaded ? 9 : undefined}
		>
			<Skeleton borderRadius="xl" w={150} h={100} isLoaded={isLoaded}>
				<Image
					borderRadius="xl"
					source={{
						uri: thumbnail,
					}}
					width={isFirst && isLoaded ? '100%' : 150}
					height={isFirst && isLoaded ? 200 : 100}
					alt={`Image News ${id}`}
				/>
			</Skeleton>
			<Box
				px={3}
				py={isFirst && isLoaded ? 3 : 0}
				justifyContent="space-between"
				flex="1"
			>
				<Skeleton.Text lineHeight={3} isLoaded={isLoaded}>
					<Text
						fontWeight="bold"
						color="dark.300"
						numberOfLines={3}
						ellipsizeMode="tail"
						fontSize={isFirst && isLoaded ? 17 : 14}
						my={isFirst && isLoaded ? 2 : 0}
					>
						{decodeURI(title)}
					</Text>
				</Skeleton.Text>
				<Skeleton.Text fontSize={12} lines={1} isLoaded={isLoaded}>
					<Text
						fontSize={12}
						color="dark.500"
						textAlign={isFirst && isLoaded ? 'right' : 'left'}
					>
						{format(createdAt, 'dd/MM/yyyy - HH:mm')}
					</Text>
				</Skeleton.Text>
			</Box>
		</Box>
	);
};

export default Index;
