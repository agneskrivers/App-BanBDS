import React, {
	FunctionComponent,
	useState,
	useEffect,
	useCallback,
	useContext,
} from 'react';
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
import { ListProjectCompactDefault } from '@configs';

// Context
import { Context } from '@context';

// Helpers
import { storages, renewTokenDevice } from '@helpers';

// Services
import services from '@services';

// Interfaces
import type {
	IProjectCompact,
	ICompositeNavigationBottomTabs,
} from '@interfaces';

// Interfaces
interface DataStorage {
	projects: IProjectCompact[];
	pages: number;
	region: string;
}

// Props
interface Props {
	navigation: ICompositeNavigationBottomTabs<'Projects'>;
}

const Index: FunctionComponent<Props> = ({ navigation }) => {
	// States
	const [isLoaded, setIsLoaded] = useState<boolean>(false);

	const [isScroll, setIsScroll] = useState<boolean>(false);
	const [isRefresh, setIsRefresh] = useState<boolean>(false);
	const [isLoadMore, setIsLoadMore] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const [projects, setProjects] = useState<IProjectCompact[] | null>(null);

	const [pages, setPages] = useState<number | null>(null);
	const [page, setPage] = useState<number>(1);

	const [region, setRegion] = useState<string>();

	// Hooks
	const { location, isNetwork, onNotification, onLocation } =
		useContext(Context);

	const getDataStorage = useCallback(async (province: string) => {
		try {
			const data = await storages.get.obj<DataStorage>('projects');

			if (!data || data.region !== province) throw new Error();

			setIsLoaded(true);
			setProjects(data.projects);
			setPages(data.pages);
		} catch (_) {
			setIsLoaded(true);
			setPages(0);
			setProjects([]);
		}
	}, []);

	// Effects
	useEffect(() => {
		const controller = new AbortController();

		const getData = async (
			signal: AbortSignal,
			tokenDevice?: string,
		): Promise<void> => {
			let token: string | null | undefined = tokenDevice;

			if (!token) {
				token = await storages.get.str('device');
			}

			if (!token) {
				token = await renewTokenDevice(signal);
			}

			if (!token) throw new Error('Error');

			const data = await services.projects.shortlist(
				signal,
				token,
				1,
				location,
			);

			if (!data || data === 'BadRequest') throw new Error('Error');

			if (data === 'UnauthorizedDevice') {
				if (tokenDevice) throw new Error();

				const renewToken = await renewTokenDevice(signal);

				if (!renewToken) throw new Error('Error');

				return getData(signal, renewToken);
			}

			let list: IProjectCompact[] = [...data.projects];

			if (data.hot) {
				list = [data.hot, ...list];
			}

			const checkStorage = await storages.get.str('projects');

			const dataStorage: DataStorage = {
				projects: list,
				pages: data.pages,
				region: location,
			};

			const convertDataStorage = JSON.stringify(dataStorage);

			if (!checkStorage || checkStorage !== convertDataStorage) {
				if (checkStorage) {
					await storages.remove('projects');
				}

				await storages.set('projects', convertDataStorage);
			}

			setIsLoaded(true);
			setProjects(list);
			setPages(data.pages);
			setRegion(location);
		};

		if (!isLoaded) {
			if (isNetwork) {
				getData(controller.signal).catch(() =>
					getDataStorage(location),
				);
			} else {
				getDataStorage(location);
			}
		}

		return () => controller.abort();
	}, [isNetwork, isLoaded, location, onNotification, getDataStorage]);
	useEffect(() => {
		const controller = new AbortController();

		const getData = async (
			signal: AbortSignal,
			tokenDevice?: string,
		): Promise<void> => {
			let token: string | null | undefined = tokenDevice;

			if (!token) {
				token = await storages.get.str('device');
			}

			if (!token) {
				token = await renewTokenDevice(signal);
			}

			if (!token) throw new Error('Error');

			const data = await services.projects.shortlist(
				signal,
				token,
				1,
				location,
			);

			if (!data) throw new Error('Error');

			if (data === 'UnauthorizedDevice') {
				if (tokenDevice) throw new Error();

				const renewToken = await renewTokenDevice(signal);

				if (!renewToken) throw new Error('Error');

				return getData(signal, renewToken);
			}

			if (data === 'BadRequest') {
				setIsRefresh(false);

				onNotification(
					'toast-screen-projects-refresh-bad-request',
					'Vui lòng thử lại!',
					'Nhận tin không thành công',
					'warning',
				);

				return;
			}

			let list: IProjectCompact[] = [...data.projects];

			if (data.hot) {
				list = [data.hot, ...list];
			}

			setIsRefresh(false);
			setProjects(list);
			setPages(data.pages);
		};

		if (isRefresh) {
			if (isNetwork) {
				getData(controller.signal).catch(() => {
					setIsRefresh(false);

					onNotification(
						'toast-screen-projects-error',
						'Vui lòng thử lại!',
						'Máy chủ bị lỗi',
						'error',
					);
				});
			} else {
				setIsRefresh(false);

				onNotification(
					'toast-screen-projects-no-network',
					'Vui lòng kết nối mạng!',
					'Không có mạng',
					'warning',
				);
			}
		}

		return () => controller.abort();
	}, [isRefresh, location, isNetwork, onNotification]);
	useEffect(() => {
		const controller = new AbortController();

		const getData = async (
			signal: AbortSignal,
			tokenDevice?: string,
		): Promise<void> => {
			let token: string | null | undefined = tokenDevice;

			if (!token) {
				token = await storages.get.str('device');
			}

			if (!token) {
				token = await renewTokenDevice(signal);
			}

			if (!token) throw new Error('Error');

			const data = await services.projects.shortlist(
				signal,
				token,
				1,
				location,
			);

			if (!data) throw new Error('Error');

			if (data === 'UnauthorizedDevice') {
				if (tokenDevice) throw new Error();

				const renewToken = await renewTokenDevice(signal);

				if (!renewToken) throw new Error('Error');

				return getData(signal, renewToken);
			}

			if (data === 'BadRequest') {
				setIsLoading(false);
				onLocation(region ? region : 'HN');

				onNotification(
					'toast-screen-projects-loading-bad-request',
					'Vui lòng thử lại!',
					'Nhận tin không thành công',
					'warning',
				);

				return;
			}

			let list: IProjectCompact[] = [...data.projects];

			if (data.hot) {
				list = [data.hot, ...list];
			}

			setRegion(location);
			setIsLoading(false);
			setProjects(list);
			setPages(data.pages);
		};

		if (isLoading && region !== location) {
			if (isNetwork) {
				getData(controller.signal).catch(() => {
					setIsLoading(false);
					onLocation(region ? region : 'HN');

					onNotification(
						'toast-screen-projects-error',
						'Vui lòng thử lại!',
						'Máy chủ bị lỗi',
						'error',
					);
				});
			} else {
				setIsLoading(false);
				onLocation(region ? region : 'HN');

				onNotification(
					'toast-screen-projects-no-network',
					'Vui lòng kết nối mạng!',
					'Không có mạng',
					'warning',
				);
			}
		}

		return () => controller.abort();
	}, [isLoading, isNetwork, location, region, onLocation, onNotification]);
	useEffect(() => {
		const controller = new AbortController();

		const getData = async (
			signal: AbortSignal,
			tokenDevice?: string,
		): Promise<void> => {
			let token: string | null | undefined = tokenDevice;

			if (!token) {
				token = await storages.get.str('device');
			}

			if (!token) {
				token = await renewTokenDevice(signal);
			}

			if (!token) throw new Error('Error');

			const data = await services.projects.shortlist(
				signal,
				token,
				page + 1,
				location,
			);

			if (!data) throw new Error('Error');

			if (data === 'UnauthorizedDevice') {
				if (tokenDevice) throw new Error();

				const renewToken = await renewTokenDevice(signal);

				if (!renewToken) throw new Error('Error');

				return getData(signal, renewToken);
			}

			if (data === 'BadRequest') {
				setIsLoadMore(false);

				onNotification(
					'toast-screen-projects-loading-bad-request',
					'Vui lòng thử lại!',
					'Nhận tin không thành công',
					'warning',
				);

				return;
			}

			setIsLoadMore(false);
			setProjects(data.projects);
		};

		if (isLoadMore) {
			if (isNetwork) {
				getData(controller.signal)
					.then(() => setPage(prePage => prePage + 1))
					.catch(() => {
						setIsLoadMore(false);

						onNotification(
							'toast-screen-projects-error',
							'Vui lòng thử lại!',
							'Máy chủ bị lỗi',
							'error',
						);
					});
			} else {
				setIsLoadMore(false);

				onNotification(
					'toast-screen-projects-no-network',
					'Vui lòng kết nối mạng!',
					'Không có mạng',
					'warning',
				);
			}
		}

		return () => controller.abort();
	}, [isLoadMore, isNetwork, location, page, onNotification]);
	useEffect(() => {
		if (region !== undefined && region !== location && !isLoading) {
			setIsLoading(true);
		}
	}, [location, region, isLoading]);

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

	const handlePressProject = (projectID: number) =>
		navigation.navigate('Project', { projectID });

	return (
		<Box bg="white" flexGrow={1} position="relative">
			<FlatList
				data={projects ? projects : ListProjectCompactDefault}
				keyExtractor={({ id }) => id}
				contentContainerStyle={styles.container}
				renderItem={({ item }) => (
					<Pressable
						px={4}
						my={4}
						onPress={() => handlePressProject(item.projectID)}
					>
						<ProjectComponent
							data={item}
							isLoaded={isLoaded && !isRefresh && !isLoading}
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
					isLoaded && !isRefresh && !isLoading ? (
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
