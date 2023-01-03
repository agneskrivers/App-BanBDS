import React, { FunctionComponent, useState, useEffect } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import RenderHTML from 'react-native-render-html';
import { format } from 'date-fns';
import { Dimensions, StatusBar } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { Box, HStack, Text, Icon, ScrollView, Pressable } from 'native-base';

// Components
import { LoadingComponent } from '@components';

// Interfaces
import type { INewsInfo } from '@interfaces';

// Demo
import { news } from '../../../demo';

const Index: FunctionComponent = () => {
	// Constants
	const { width: screenWidth } = Dimensions.get('screen');

	// States
	const [data, setData] = useState<INewsInfo | null>(null);

	// Effects
	useEffect(() => {
		const getData = async () => {
			setTimeout(() => setData(news), 2000);
		};

		getData();
	}, []);

	return (
		<>
			<StatusBar barStyle="dark-content" />
			<HStack
				pb={2}
				px={4}
				borderBottomColor={data !== null ? 'gray.300' : 'white'}
				borderBottomWidth={data !== null ? 1 : 0}
				safeAreaTop
				alignItems="center"
			>
				<Pressable>
					<Icon
						as={MaterialCommunityIcons}
						name={data !== null ? 'arrow-left' : 'close'}
						size="lg"
						mr={2}
					/>
				</Pressable>
				{data && (
					<Text
						flex={1}
						fontSize={16}
						fontWeight="bold"
						color="dark.200"
					>
						{decodeURI(data.title)}
					</Text>
				)}
			</HStack>
			{data !== null ? (
				<ScrollView
					p={4}
					bg="white"
					showsHorizontalScrollIndicator={false}
					showsVerticalScrollIndicator={false}
					flexShrink={1}
				>
					<Box safeAreaBottom>
						<Text
							color="muted.400"
							fontSize={12}
							mb={2}
							textAlign="right"
						>
							{format(data.time, 'dd/MM/yyyy HH:mm')}
						</Text>
						<Text fontWeight="medium" mb={2}>
							{decodeURI(news.description)}
						</Text>
						<RenderHTML
							source={{
								html: decodeURI(data.content),
							}}
							contentWidth={screenWidth - 30}
						/>
					</Box>
				</ScrollView>
			) : (
				<LoadingComponent />
			)}
		</>
	);
};

export default Index;
