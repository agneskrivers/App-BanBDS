import React, {
	FunctionComponent,
	useState,
	useEffect,
	useContext,
	useCallback,
} from 'react';
import { Platform } from 'react-native';
import {
	ScrollView,
	Pressable,
	Image,
	Center,
	Text,
	HStack,
	Box,
	Icon,
} from 'native-base';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Assets
import LeasePNG from '@assets/images/lease.png';

// Components
import {
	HeaderComponent,
	ProjectComponent,
	PostComponent,
	LoadingComponent,
} from '@components';

// Configs
import {
	HomeMenus,
	ListProjectCompactDefault,
	ListPostCompactDefault,
} from '@configs';

// Context
import { Context } from '@context';

// Helpers
import { storages, renewTokenDevice } from '@helpers';

// Services
import services from '@services';

// Interfaces
import type {
	IPostCompact,
	IProjectCompact,
	ICompositeNavigationBottomTabs,
	IPostType,
} from '@interfaces';

// Interface
interface DataStorage {
	posts: IPostCompact[];
	projects: IProjectCompact[];
	totals: number;
	region: string;
}

// Props
interface Props {
	navigation: ICompositeNavigationBottomTabs<'Home'>;
}

const Index: FunctionComponent<Props> = ({ navigation }) => {
	// States
	const [isLoaded, setIsLoaded] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const [projects, setProjects] = useState<IProjectCompact[] | null>(null);
	const [posts, setPosts] = useState<IPostCompact[] | null>(null);
	const [totals, setTotals] = useState<number | null>(null);

	const [region, setRegion] = useState<string>();

	// Hooks
	const { location, onNotification, isNetwork, onLocation, user } =
		useContext(Context);

	const getDataStorage = useCallback(async (province: string) => {
		try {
			const data = await storages.get.obj<DataStorage>('home');

			if (!data || data.region !== province) throw new Error();

			setPosts(data.posts);
			setProjects(data.projects);
			setTotals(data.totals);
		} catch (_) {
			setPosts([]);
			setProjects([]);
			setTotals(0);
		}
	}, []);
	const fetchData = useCallback(
		async (
			signal: AbortSignal,
			isFetch: boolean,
			province: string,
			tokenDevice?: string,
		): Promise<void> => {
			if (isFetch) {
				let token: string | null | undefined = tokenDevice;

				if (!token) {
					token = await storages.get.str('device');
				}

				if (!token) {
					token = await renewTokenDevice(signal);
				}

				if (!token) throw new Error();

				const data = await services.dashboard(signal, token, province);

				if (!data || data === 'BadRequest') throw new Error();

				if (data === 'UnauthorizedDevice') {
					const renewToken = await renewTokenDevice(signal);

					if (!renewToken) throw Error('Error');

					return fetchData(signal, isFetch, renewToken);
				}

				const checkStorageHome = await storages.get.obj<DataStorage>(
					'home',
				);

				if (checkStorageHome) {
					await storages.remove('home');
				}

				const dataStorage: DataStorage = { ...data, region: province };

				await storages.set('home', JSON.stringify(dataStorage));

				setPosts(data.posts);
				setProjects(data.projects);
				setTotals(data.totals);
				setRegion(province);
			}
		},
		[],
	);

	// Effect
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

			if (!token) throw new Error();

			const data = await services.dashboard(signal, token, location);

			if (!data || data === 'BadRequest') throw new Error();

			if (data === 'UnauthorizedDevice') {
				const renewToken = await renewTokenDevice(signal);

				if (!renewToken) throw Error('Error');

				return getData(signal, renewToken);
			}

			const checkStorageHome = await storages.get.obj<DataStorage>(
				'home',
			);

			if (checkStorageHome) {
				await storages.remove('home');
			}

			const dataStorage: DataStorage = { ...data, region: location };

			await storages.set('home', JSON.stringify(dataStorage));

			setIsLoaded(true);
			setPosts(data.posts);
			setProjects(data.projects);
			setTotals(data.totals);
			setRegion(location);
		};

		if (!isLoaded) {
			if (isNetwork) {
				getData(controller.signal).catch(() => {
					getDataStorage(location).finally(() => setIsLoaded(true));
				});
			} else {
				getDataStorage(location).finally(() => setIsLoaded(true));
			}
		}

		return () => controller.abort();
	}, [isLoaded, location, isNetwork, onNotification, getDataStorage]);
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

			if (!token) throw new Error();

			const data = await services.dashboard(signal, token, location);

			if (!data || data === 'BadRequest') throw new Error();

			if (data === 'UnauthorizedDevice') {
				const renewToken = await renewTokenDevice(signal);

				if (!renewToken) throw Error('Error');

				return getData(signal, renewToken);
			}

			const checkStorageHome = await storages.get.obj<DataStorage>(
				'home',
			);

			if (checkStorageHome) {
				await storages.remove('home');
			}

			const dataStorage: DataStorage = { ...data, region: location };

			await storages.set('home', JSON.stringify(dataStorage));

			setRegion(location);
			setIsLoading(false);
			setPosts(data.posts);
			setProjects(data.projects);
			setTotals(data.totals);
		};

		if (isLoading && region !== location) {
			console.log('ok');
			if (isNetwork) {
				getData(controller.signal).catch(() => {
					setIsLoading(false);
					onLocation(region ? region : 'HN');

					onNotification(
						'toast-screen-home-error',
						'Vui lòng thử lại!',
						'Máy chủ bị lỗi',
						'error',
					);
				});
			} else {
				setIsLoading(false);
				onLocation(region ? region : 'HN');

				onNotification(
					'toast-screen-home-no-network',
					'Vui lòng kết nối mạng!',
					'Không có mạng',
					'warning',
				);
			}
		}

		return () => controller.abort();
	}, [
		isNetwork,
		isLoading,
		location,
		region,
		onNotification,
		getDataStorage,
		onLocation,
	]);
	useEffect(() => {
		if (region !== undefined && region !== location && !isLoading) {
			setIsLoading(true);
		}
	}, [location, region, isLoading]);

	// Handles
	const handlePressProjects = () => navigation.navigate('Projects');
	const handlePressPosts = (type: IPostType) =>
		navigation.navigate('Posts', { type });
	const handlePressProject = (projectID: number) =>
		navigation.navigate('Project', { projectID });
	const handlePressPost = (postID: number) =>
		navigation.navigate('Post', {
			postID,
		});
	const handlePressMenu = (type: IPostType | 'request') => {
		if (!user) return navigation.navigate('Login');

		navigation.navigate('Form', { type });
	};

	return (
		<>
			<ScrollView
				showsHorizontalScrollIndicator={false}
				showsVerticalScrollIndicator={false}
				bg="white"
				scrollEventThrottle={16}
				flexGrow={1}
			>
				<HeaderComponent>
					<HStack
						justifyContent="space-evenly"
						px={2}
						py={3}
						borderRadius={8}
						shadow={9}
						mt={{ base: 0, lg: 12 }}
						bg="white"
						maxW="90%"
					>
						{HomeMenus.map((item, index) => (
							<Pressable
								key={index}
								flex={1}
								onPress={() => handlePressMenu(item.type)}
							>
								<Center>
									<Image
										source={item.icon}
										size={12}
										alt={`BanBds Icon ${item.content}`}
										style={{ aspectRatio: 129 / 129 }}
									/>
									<Text mt={1} fontSize={13} fontWeight={600}>
										{item.content}
									</Text>
								</Center>
							</Pressable>
						))}
					</HStack>
				</HeaderComponent>
				<Box mt={7} px={4}>
					<Pressable mb={2} onPress={handlePressProjects}>
						<HStack
							justifyContent="space-between"
							alignItems="center"
						>
							<HStack flex={1}>
								<Box>
									<Image
										source={LeasePNG}
										h={7}
										style={{ aspectRatio: 48 / 48 }}
										alt="BanBds Project"
									/>
								</Box>
								<Text ml={2} fontWeight="bold" fontSize="lg">
									Dự Án
								</Text>
							</HStack>
							<Icon
								as={MaterialCommunityIcons}
								name="arrow-right-bold-box"
								size={7}
								color="info.600"
							/>
						</HStack>
					</Pressable>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						p={0.5}
					>
						{[
							...(projects
								? projects
								: ListProjectCompactDefault),
						].map((item, index) => (
							<Pressable
								key={item.id}
								onPress={() =>
									handlePressProject(item.projectID)
								}
								p={1}
							>
								<ProjectComponent
									data={item}
									isLoaded={projects !== null && isLoaded}
									isFirst={index === 0}
									isLast={index === 9}
								/>
							</Pressable>
						))}
					</ScrollView>
				</Box>
				<Box mt={7} px={4} pb={Platform.OS === 'android' ? 8 : 4}>
					<Pressable mb={2} onPress={() => handlePressPosts('sell')}>
						<HStack
							justifyContent="space-between"
							alignItems="center"
						>
							<HStack flex={1}>
								<Box>
									<Image
										source={LeasePNG}
										h={7}
										style={{ aspectRatio: 48 / 48 }}
										alt="BanBds Project"
									/>
								</Box>
								<HStack alignItems="center" ml={2}>
									<Text fontWeight="bold" fontSize="lg">
										BĐS cần bán
									</Text>
									{totals !== null && totals > 0 && (
										<Text ml="2" fontSize="12">
											{`(${totals.toLocaleString()} tin đăng)`}
										</Text>
									)}
								</HStack>
							</HStack>
							<Icon
								as={MaterialCommunityIcons}
								name="arrow-right-bold-box"
								size={7}
								color="info.600"
							/>
						</HStack>
					</Pressable>
					{[...(posts ? posts : ListPostCompactDefault)].map(item => (
						<Pressable
							my={2}
							key={item.id}
							onPress={() => handlePressPost(item.postID)}
						>
							<PostComponent
								data={item}
								isLoaded={
									posts !== null &&
									isLoaded &&
									totals !== null
								}
								type="sell"
							/>
						</Pressable>
					))}
				</Box>
			</ScrollView>
			{isLoading &&
				posts &&
				projects &&
				posts.length === 0 &&
				projects.length === 0 && (
					<Center
						flex={1}
						position="absolute"
						zIndex={2}
						top={0}
						left={0}
						width="100%"
						height="100%"
					>
						<LoadingComponent />
					</Center>
				)}
		</>
	);
};

export default Index;
