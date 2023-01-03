import React, { FunctionComponent, useState, useEffect } from 'react';
import {
	NativeSyntheticEvent,
	NativeScrollEvent,
	RefreshControl,
	StyleSheet,
} from 'react-native';
import { Box, Pressable, FlatList } from 'native-base';

// Components
import {
	HeaderComponent,
	NoDataComponent,
	FooterFlatListComponent,
	LoadingComponent,
	ProjectComponent,
} from '@components';

// Configs
import { ListProjectCompactDefault, ProjectCompactDefault } from '@configs';

// Interfaces
import type { IProjectCompact } from '@interfaces';

const Index: FunctionComponent = () => {
	// States
	const [isLoaded, setIsLoaded] = useState<boolean>(false);

	const [isScroll, setIsScroll] = useState<boolean>(false);
	const [isRefresh, setIsRefresh] = useState<boolean>(false);
	const [isLoadMore, setIsLoadMore] = useState<boolean>(false);

	const [projects, setProjects] = useState<IProjectCompact[] | null>(null);

	const [pages, setPages] = useState<number | null>(null);
	const [page, setPage] = useState<number>(1);

	useEffect(() => {
		const getData = () => {
			let list: number[] = [];

			let data: IProjectCompact[] = [];

			for (let i = 0; i < 10; i++) {
				const generateID = (): number => {
					const id = Math.floor(Math.random() * Math.pow(10, 6));

					if (list.indexOf(id) < 0) {
						list = [...list, id];

						return id;
					}

					return generateID();
				};

				const projectID = generateID();

				data = [...data, { ...ProjectCompactDefault, projectID }];
			}

			setTimeout(() => {
				setProjects(data);

				setIsLoaded(true);
				setPages(0);
			}, 2000);
		};

		getData();
	}, []);
	useEffect(() => {
		const getData = async () => {
			setTimeout(() => setIsRefresh(false), 2000);
		};

		if (isRefresh) {
			getData();
		}
	}, [isRefresh]);

	// Handle
	const handleRefresh = () => setIsRefresh(true);
	const handleLoadMore = () => {
		if (pages !== null && pages > 0 && pages !== page) {
			setIsLoadMore(true);
		}
	};
	const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
		const { y } = e.nativeEvent.contentOffset;

		if (y <= 100) return setIsScroll(false);

		setIsScroll(true);
	};

	return (
		<Box bg="white" flexGrow={1} position="relative">
			<FlatList
				data={projects ? projects : ListProjectCompactDefault}
				keyExtractor={({ projectID }) => projectID.toString()}
				contentContainerStyle={styles.container}
				renderItem={({ item }) => (
					<Pressable px={4} my={4}>
						<ProjectComponent
							data={item}
							isLoaded={isLoaded}
							size="full"
						/>
					</Pressable>
				)}
				ListHeaderComponent={<HeaderComponent isDark={isScroll} />}
				ListFooterComponent={
					<FooterFlatListComponent
						isLoad={pages !== null && pages > 0 && pages !== page}
					/>
				}
				ListEmptyComponent={
					isLoaded && !isLoadMore && !isRefresh ? (
						<NoDataComponent message="Không có tin tức" />
					) : (
						<LoadingComponent />
					)
				}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={isRefresh}
						onRefresh={handleRefresh}
						colors={['#0891b2', '#4ade80']}
					/>
				}
				onEndReachedThreshold={0.5}
				onEndReached={handleLoadMore}
				onScroll={handleScroll}
			/>
		</Box>
	);
};

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		backgroundColor: 'white',
	},
});

export default Index;
