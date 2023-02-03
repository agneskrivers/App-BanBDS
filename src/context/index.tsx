import React, {
	createContext,
	FunctionComponent,
	useEffect,
	useState,
	useCallback,
} from 'react';
import Geolocation, {
	GeolocationResponse,
} from '@react-native-community/geolocation';
import Device from 'react-native-device-info';
import {
	Alert as AlertNative,
	Platform,
	PermissionsAndroid,
} from 'react-native';
import { Alert, VStack, HStack, useToast, Text } from 'native-base';
import { useNetInfo } from '@react-native-community/netinfo';

// Helpers
import { storages, convertToEnglish, renewTokenDevice } from '@helpers';

// Screens
import { SplashScreen } from '@screens';

// Services
import services from '@services';

// Utils
import { getProvince } from '@utils';

// Interfaces
import type {
	IUserInfo,
	IDevice,
	IRegionCompact,
	ILinkJSON,
	IUserUpdate,
} from '@interfaces';

// Type
type AlertStatus = 'info' | 'error' | 'warning';

// Interface
interface ContextInterface {
	user: IUserInfo | null;
	location: string;
	regions: IRegionCompact[];

	isNetwork: boolean;

	onNotification(
		id: string,
		message: string,
		title?: string,
		status?: AlertStatus,
	): void;
	onLocation(region: string): void;
	onLogin(token: string, data: IUserInfo): Promise<boolean>;
	onLogout(): void;
	onUpdateUser(body: IUserUpdate): void;
}

// Props
interface Props {
	children: React.ReactNode | React.ReactNode[];
}

// Context
const regionsDefault: IRegionCompact[] = [
	{ id: '1', name: 'Hà Nội', regionID: 'HN', serial: 1 },
];
const contextDefault: ContextInterface = {
	user: null,
	location: 'HN',
	regions: regionsDefault,
	isNetwork: true,

	onNotification() {
		console.log('Notification');
	},
	onLocation() {
		console.log('Location');
	},
	onLogin() {
		return new Promise(resolve => resolve(false));
	},
	onLogout() {
		console.log('Logout');
	},
	onUpdateUser() {
		console.log('Update User');
	},
};

export const Context = createContext<ContextInterface>(contextDefault);

const Index: FunctionComponent<Props> = ({ children }) => {
	// States
	const [isLoaded, setIsLoaded] = useState<boolean>(false);

	const [isNetwork, setIsNetwork] = useState<boolean>(true);

	const [user, setUser] = useState<IUserInfo | null>(null);
	const [location, setLocation] = useState<string>('HN');
	const [regions, setRegions] = useState<IRegionCompact[]>(regionsDefault);

	// Hooks
	const toast = useToast();
	const netInfo = useNetInfo();

	// Effect
	useEffect(() => {
		const controller = new AbortController();

		const hasAndroidPermission = async (): Promise<boolean> => {
			const permission =
				PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;

			const hasPermission = await PermissionsAndroid.check(permission);

			if (hasPermission) {
				return true;
			}

			const status = await PermissionsAndroid.request(permission);
			return status === 'granted';
		};

		const error = () => {
			AlertNative.alert(
				'Có lỗi xảy ra. Vui lòng thoát ứng dụng rồi thử lại!',
			);

			setIsLoaded(true);
		};

		const getDeviceToken = async (signal: AbortSignal): Promise<string> => {
			const deviceID = await storages.get.str('deviceID');
			const token = await storages.get.str('device');

			if (!deviceID || !token) {
				const model = await Device.getModel();
				const device = await Device.getDeviceId();
				const nameOS = await Device.getSystemName();
				const versionOS = await Device.getSystemVersion();
				const buildID = await Device.getBuildId();
				let mac = await Device.getMacAddress();
				const brand = await Device.getBrand();
				const os = `${nameOS} - ${versionOS} - ${buildID}`;

				if (!mac) {
					mac = await Device.getAndroidId();
				}

				const body: IDevice = { brand, device, mac, model, os };

				console.log(body);

				const result = await services.init(signal, body);

				if (!result) throw new Error();

				await storages.set('deviceID', result.deviceID);
				await storages.set('device', result.token);
				await storages.set('remaps', result.remaps);
				await storages.set('regions', JSON.stringify(result.regions));
				await storages.set(
					'districts',
					JSON.stringify(result.districts),
				);
				await storages.set('wards', JSON.stringify(result.wards));
				await storages.set('link', JSON.stringify(result.link));

				return result.token;
			}

			return token;
		};
		const checkDaily = async (
			signal: AbortSignal,
			token: string,
			renew?: string,
		): Promise<void> => {
			const now = new Date(Date.now());

			const date = now.getDate();
			const month = now.getMonth() + 1;
			const year = now.getFullYear();

			const day = `${date}/${month}/${year}`;

			const dateUpdateDaily = await storages.get.str('update-daily');

			if (!dateUpdateDaily || dateUpdateDaily === day) return;

			const result = await services.device.daily(
				controller.signal,
				renew ? renew : token,
			);

			if (!result || result === 'BadRequest') return;

			if (result === 'UnauthorizedDevice') {
				if (renew !== undefined) return;

				const renewToken = await renewTokenDevice(signal);

				if (!renewToken) return;

				return checkDaily(signal, token, renewToken);
			}

			const list = await storages.get.obj<IRegionCompact[]>('regions');
			const remaps = await storages.get.str('remaps');
			const links = await storages.get.obj<ILinkJSON>('links');

			if (!remaps || remaps !== result.remaps) {
				if (remaps) {
					await storages.remove('remaps');
				}

				await storages.set('remaps', result.remaps);
			}

			if (
				!links ||
				JSON.stringify(links) !== JSON.stringify(result.link)
			) {
				if (links) {
					await storages.remove('links');
				}

				await storages.set('links', JSON.stringify(result.link));
			}

			if (!list || list.length !== result.regions.length) {
				await storages.set('regions', JSON.stringify(result.regions));

				return;
			}

			const isChange = list.every(
				(item, index) =>
					JSON.stringify(item) ===
					JSON.stringify(result.regions[index]),
			);

			if (!isChange) {
				await storages.remove('regions');
				await storages.set('regions', JSON.stringify(result.regions));
			}

			if (dateUpdateDaily) {
				await storages.remove('update-daily');
			}

			await storages.set('update-daily', day);
		};
		const checkLogin = async (
			signal: AbortSignal,
			device: string,
			renew?: string,
		): Promise<void> => {
			const tokenUser = await storages.get.str('user');

			if (!tokenUser) return;

			const data = await services.user.info(signal, device, tokenUser);

			if (!data || data === 'UnauthorizedUser') return;

			if (data === 'UnauthorizedDevice') {
				if (renew) return;

				const renewToken = await renewTokenDevice(signal);

				if (!renewToken) return;

				return checkLogin(signal, device, renewToken);
			}

			setUser(data);
		};
		const getRegions = async (): Promise<IRegionCompact[]> => {
			const listRegions = await storages.get.obj<IRegionCompact[]>(
				'regions',
			);

			if (!listRegions) return regionsDefault;

			const filterRegions = [...listRegions].filter(
				item => item.serial !== 0,
			);

			setRegions(filterRegions);

			return filterRegions;
		};
		const checkLocation = async (
			info: GeolocationResponse,
			list: IRegionCompact[],
		) => {
			const now = new Date(Date.now());

			const date = now.getDate();
			const month = now.getMonth() + 1;
			const year = now.getFullYear();

			const day = `${date}/${month}/${year}`;

			try {
				const checkRegion = await storages.get.str('region');

				if (checkRegion) {
					const [dayStorage, regionStorage] = checkRegion.split('-');

					if (dayStorage === day) {
						setLocation(regionStorage);
						setIsLoaded(true);

						return;
					}
				}

				const { latitude, longitude } = info.coords;

				const province = await getProvince(latitude, longitude);

				if (!province) throw new Error();

				const region = convertToEnglish(
					province.replace('Thành phố ', ''),
				);

				const findRegion = [...list].find(
					item => convertToEnglish(item.name) === region,
				);

				if (!findRegion) throw new Error();

				if (checkRegion) {
					await storages.remove('region');
				}

				const isUpdateRegion = await storages.set(
					'region',
					`${day}-${findRegion.regionID}`,
				);

				if (!isUpdateRegion) throw new Error();

				setLocation(findRegion.regionID);
				setIsLoaded(true);
			} catch (err) {
				setIsLoaded(true);
			}
		};

		const getData = async (signal: AbortSignal) => {
			try {
				if (Platform.OS === 'android') {
					await hasAndroidPermission();
				}

				const token = await getDeviceToken(signal);

				await checkDaily(signal, token);
				await checkLogin(signal, token);
			} catch (_) {
				error();
			}
		};

		if (isNetwork) {
			getData(controller.signal).then(() => {
				getRegions().then(list => {
					Geolocation.requestAuthorization(
						() => {
							Geolocation.getCurrentPosition(
								info => checkLocation(info, list),
								() => setIsLoaded(true),
							);
						},
						() => setIsLoaded(true),
					);
				});
			});
		}

		return () => controller.abort();
	}, [isNetwork]);
	useEffect(() => {
		const id = 'toast-check-network';

		if (netInfo.isConnected !== null) {
			if (
				netInfo.type === 'none' ||
				netInfo.type === 'unknown' ||
				netInfo.type === 'bluetooth' ||
				netInfo.isInternetReachable === false
			) {
				if (!toast.isActive(id)) {
					toast.show({
						id,
						placement: 'bottom',
						render: () => (
							<Alert
								maxWidth="90%"
								alignSelf="center"
								flexDirection="row"
								status="warning"
								variant="subtle"
							>
								<VStack space={1} flexShrink={1} w="100%">
									<HStack
										space={2}
										flexShrink={1}
										alignItems="center"
									>
										<Alert.Icon />
										<Text
											px={4}
											color="coolGray.800"
											fontWeight={600}
										>
											Không có kết nối mạng!
										</Text>
									</HStack>
								</VStack>
							</Alert>
						),
					});
				}

				if (isNetwork === true) {
					setIsNetwork(false);
				}
			} else {
				if (toast.isActive(id)) {
					toast.close(id);
				}

				if (isNetwork === false) {
					setIsNetwork(true);
				}
			}
		}
	}, [netInfo, toast, isNetwork]);

	// Handle
	const handleNotification = useCallback(
		(id: string, message: string, title?: string, status?: AlertStatus) => {
			if (!toast.isActive(id)) {
				console.log(id);

				toast.show({
					id,
					placement: 'top',
					render: () => (
						<Alert
							maxWidth="90%"
							alignSelf="center"
							flexDirection="row"
							status={status ? status : 'success'}
							variant="subtle"
						>
							<VStack w="100%">
								{title && (
									<HStack
										space={2}
										flexShrink={1}
										alignItems="center"
									>
										<Alert.Icon />
										<Text
											fontSize={16}
											fontWeight={600}
											flexShrink={1}
											color="gray.800"
										>
											{title}
										</Text>
									</HStack>
								)}
								{!title ? (
									<HStack
										w="100%"
										space={2}
										alignItems="center"
									>
										<Alert.Icon />
										<Text
											color="coolGray.800"
											fontWeight={600}
										>
											{message}
										</Text>
									</HStack>
								) : (
									<Text
										px={6}
										color="coolGray.800"
										fontWeight={600}
									>
										{message}
									</Text>
								)}
							</VStack>
						</Alert>
					),
				});
			}
		},
		[toast],
	);
	const handleLocation = useCallback(
		(region: string) => setLocation(region),
		[],
	);
	const handleLogin = useCallback(
		async (token: string, data: IUserInfo): Promise<boolean> => {
			const isSetStorage = await storages.set('user', token);

			if (!isSetStorage) return false;

			setUser(data);

			return true;
		},
		[],
	);
	const handleLogout = useCallback(async () => {
		const isRemove = await storages.remove('user');

		if (!isRemove)
			return handleNotification(
				'toast-handle-logout',
				'Logout Failed!',
				undefined,
				'error',
			);

		handleNotification(
			'toast-context-logout-success',
			'Đăng xuất thành công!',
		);
		setUser(null);
	}, [handleNotification]);
	const handleUpdateUser = useCallback(
		(body: IUserUpdate) => {
			if (user) {
				const { address, avatar, birthday, fullName } = body;

				let userUpdate = user;

				if (address) {
					userUpdate = { ...userUpdate, address };
				}

				if (avatar) {
					userUpdate = { ...userUpdate, avatar };
				}

				if (birthday) {
					userUpdate = { ...userUpdate, birthday };
				}

				if (fullName) {
					userUpdate = { ...userUpdate, fullName };
				}

				setUser(userUpdate);
			}
		},
		[user],
	);

	const value: ContextInterface = {
		user,
		location,
		regions,
		isNetwork,
		onNotification: handleNotification,
		onLocation: handleLocation,
		onLogin: handleLogin,
		onLogout: handleLogout,
		onUpdateUser: handleUpdateUser,
	};

	return (
		<Context.Provider value={value}>
			{isLoaded ? children : <SplashScreen />}
		</Context.Provider>
	);
};

export default React.memo(Index);
