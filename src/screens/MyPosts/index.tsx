import React, { FunctionComponent, useState, useEffect } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { StatusBar, StyleSheet } from 'react-native';
import {
	Box,
	Text,
	HStack,
	Icon,
	Button,
	FlatList,
	Pressable,
	useToast,
	Skeleton,
} from 'native-base';

// Components
import {
	PostComponent,
	LoadingComponent,
	NoDataComponent,
	FooterFlatListComponent,
} from '@components';

// Configs
import { ListPostCompactDefault } from '@configs';

// Interfaces
import type {
	IStackParams,
	ICompositeNavigationStacks,
	IPostType,
	IPostCompact,
} from '@interfaces';

// Type
type PostType = 'accept' | 'pending';

const Index: FunctionComponent = () => {
	// States
	const [isLoaded, setIsLoaded] = useState<boolean>(false);

	const [type, setType] = useState<IPostType>('sell');
	const [data, setData] = useState<IPostCompact[] | null>(null);

	const [pages, setPages] = useState<number | null>(null);
	const [page, setPage] = useState<number>(1);

	// Effect
	useEffect(() => {
		const getData = async () => {
			setTimeout(() => {
				setData([]);
				setPages(0);
				setIsLoaded(true);
			}, 2000);
		};

		getData();
	}, []);

	return (
		<Box bg="white" flexGrow={1}>
			<Box
				safeAreaTop
				px={4}
				pb={2}
				borderBottomColor="gray.300"
				borderBottomWidth={1}
				mb={4}
				shadow={0.5}
				bg="gray.50"
			>
				<HStack alignItems="center" mb={2}>
					<Pressable>
						<Icon
							as={MaterialCommunityIcons}
							name="arrow-left"
							size="lg"
							mr={4}
						/>
					</Pressable>
					<Text fontSize={18} fontWeight="bold" color="dark.300">
						Quản lý tin đăng
					</Text>
				</HStack>
				<HStack alignItems="center">
					<Button
						bgColor={type === 'sell' ? 'blue.500' : 'white'}
						borderRadius="full"
						mr={1}
						flex={1}
						variant={type === 'sell' ? 'solid' : 'outline'}
						borderColor="blue.500"
					>
						<Text
							color={type === 'sell' ? 'white' : 'blue.500'}
							fontWeight={type === 'sell' ? 'semibold' : 'medium'}
							fontSize={16}
						>
							Mua Bán
						</Text>
					</Button>
					<Button
						bgColor={type === 'rent' ? 'blue.500' : 'white'}
						ml={1}
						borderRadius="full"
						flex={1}
						variant={type === 'rent' ? 'solid' : 'outline'}
						borderColor="blue.500"
					>
						<Text
							color={type === 'rent' ? 'white' : 'blue.500'}
							fontSize={16}
							fontWeight={type === 'rent' ? 'semibold' : 'medium'}
						>
							Cho thuê
						</Text>
					</Button>
				</HStack>
			</Box>

			<FlatList
				data={data ? data : ListPostCompactDefault}
				keyExtractor={({ postID }) => postID.toString()}
				contentContainerStyle={styles.container}
				renderItem={({ item, index }) => (
					<Pressable px={4} my={2} mt={index === 0 ? 4 : 2}>
						<PostComponent data={item} isLoaded={isLoaded} />
					</Pressable>
				)}
				ListFooterComponent={
					<>
						<FooterFlatListComponent
							isLoad={
								pages !== null && pages > 0 && pages !== page
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
				onEndReachedThreshold={0.5}
			/>
		</Box>
	);
};

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
	},
});

export default Index;
