import React, {
	FunctionComponent,
	useState,
	useEffect,
	useContext,
} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
	Box,
	FormControl,
	Text,
	Select,
	HStack,
	Input,
	Center,
	Button,
	TextArea,
	WarningOutlineIcon,
	Icon,
} from 'native-base';

// Context
import { Context } from '@context';

// Helpers
import { storages, renewTokenDevice } from '@helpers';

// Services
import services from '@services';

// Interfaces
import type {
	ICompositeNavigationStacks,
	IDistrictInfo,
	IWardInfo,
	IRequest,
} from '@interfaces';

// Props
interface Props {
	navigation: ICompositeNavigationStacks<'Form'>;
}

const Index: FunctionComponent<Props> = ({ navigation }) => {
	// States
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isDistricts, setIsDistricts] = useState<boolean>(false);
	const [isWards, setIsWards] = useState<boolean>(false);
	const [isValidPrices, setIsValidPrices] = useState<boolean>(true);

	const [districts, setDistricts] = useState<IDistrictInfo[]>();
	const [wards, setWards] = useState<IWardInfo[]>();

	const [content, setContent] = useState<string>();
	const [region, setRegion] = useState<string>();
	const [district, setDistrict] = useState<string>();
	const [ward, setWard] = useState<string>('all');
	const [pricesMin, setPricesMin] = useState<string>();
	const [pricesMax, setPricesMax] = useState<string>();
	const [unit, setUnit] = useState<'million' | 'billion'>('million');

	// Hooks
	const { isNetwork, regions, onNotification } = useContext(Context);

	// Effects
	useEffect(() => {
		const controller = new AbortController();

		const getData = async (signal: AbortSignal, id: string) => {
			const result = await services.common.address.districts(signal, id);

			if (!result) throw new Error();

			if (result === 'BadRequest') {
				setRegion('');

				onNotification(
					'toast-component-form-request-region-bad-request',
					'Vui lòng chọn lại!',
					'Không thể lấy danh sách Quận/Huyện',
					'warning',
				);

				return;
			}

			setDistricts(result);
		};

		if (isDistricts && region) {
			if (isNetwork) {
				setDistricts(undefined);

				getData(controller.signal, region)
					.catch(() => {
						setRegion('');

						onNotification(
							'toast-component-form-request-error',
							'Vui lòng thử lại!',
							'Máy chủ bị lỗi',
							'error',
						);
					})
					.finally(() => setIsDistricts(false));
			} else {
				setIsDistricts(false);

				onNotification(
					'toast-component-form-request-no-network',
					'Vui lòng kết nối mạng!',
					'Không có mạng',
					'error',
				);
			}
		}

		return () => controller.abort();
	}, [isNetwork, isDistricts, region, onNotification]);
	useEffect(() => {
		const controller = new AbortController();

		const getData = async (signal: AbortSignal, id: string) => {
			const result = await services.common.address.wards(signal, id);

			if (!result) throw new Error();

			if (result === 'BadRequest') {
				setRegion('');

				onNotification(
					'toast-component-form-request-districts-bad-request',
					'Vui lòng chọn lại!',
					'Không thể lấy danh sách Phường/Xã',
					'warning',
				);

				return;
			}

			setWards(result);
		};

		if (isWards && district) {
			setWards(undefined);

			if (isNetwork) {
				getData(controller.signal, district)
					.catch(() => {
						setRegion('');

						onNotification(
							'toast-component-form-request-error',
							'Vui lòng thử lại!',
							'Máy chủ bị lỗi',
							'error',
						);
					})
					.finally(() => setIsWards(false));
			} else {
				setIsWards(false);

				onNotification(
					'toast-component-form-request-no-network',
					'Vui lòng kết nối mạng!',
					'Không có mạng',
					'error',
				);
			}
		}

		return () => controller.abort();
	}, [isNetwork, isWards, district, onNotification]);
	useEffect(() => {
		const id = setTimeout(() => {
			if (pricesMin && pricesMax) {
				const valuePricesMin = parseFloat(pricesMin);
				const valuePricesMax = parseFloat(pricesMax);

				if (
					unit === 'billion' &&
					(valuePricesMax >= 1000 || valuePricesMin >= 1000)
				) {
					if (valuePricesMax >= 1000) {
						const newPricesMax = valuePricesMax / 1000;

						setPricesMax(newPricesMax.toString());
					}

					if (valuePricesMin >= 1000) {
						const newPricesMin = valuePricesMin / 1000;

						setPricesMin(newPricesMin.toString());
					}
				}

				if (
					(valuePricesMax >= 1000 || valuePricesMin >= 1000) &&
					unit === 'million'
				) {
					setUnit('billion');

					if (valuePricesMax >= 1000) {
						const newPricesMax = valuePricesMax / 1000;

						setPricesMax(newPricesMax.toString());
					}

					if (valuePricesMin >= 1000) {
						const newPricesMin = valuePricesMin / 1000;

						setPricesMin(newPricesMin.toString());
					}
				}

				if (
					unit === 'billion' &&
					valuePricesMax < 1 &&
					valuePricesMax < valuePricesMin
				) {
					setIsValidPrices(false);
				} else {
					setIsValidPrices(true);
				}
			}
		}, 500);

		return () => clearTimeout(id);
	}, [pricesMin, pricesMax, unit, isValidPrices]);
	useEffect(() => {
		const controller = new AbortController();

		const getData = async (
			signal: AbortSignal,
			tokenDevice?: string,
		): Promise<void> => {
			const user = await storages.get.str('user');

			if (!user) {
				setIsLoading(false);

				onNotification(
					'toast-component-request-no-user-token',
					'Không thể thực hiện',
					undefined,
					'error',
				);

				navigation.navigate('Home');

				return;
			}

			let device: string | undefined | null = tokenDevice;

			if (!device) {
				device = await storages.get.str('device');
			}

			if (!device) {
				device = await renewTokenDevice(signal);
			}

			if (!device) throw new Error();

			if (!content) {
				setIsLoading(false);

				onNotification(
					'toast-component-form-request-require',
					'Vui lòng nhập mô tả!',
					undefined,
					'warning',
				);

				return;
			}

			if (!region) {
				setIsLoading(false);

				onNotification(
					'toast-component-form-request-require',
					'Vui lòng chọn Tỉnh/Thành phố!',
					undefined,
					'warning',
				);

				return;
			}

			if (!district) {
				setIsLoading(false);

				onNotification(
					'toast-component-form-request-require',
					'Vui lòng chọn Quận/Huyện!',
					undefined,
					'warning',
				);

				return;
			}

			if (!isValidPrices) {
				setIsLoading(false);

				onNotification(
					'toast-component-form-request-require',
					'Vui lòng nhập khoảng giá!',
					undefined,
					'warning',
				);

				return;
			}

			if (!pricesMin || isNaN(parseFloat(pricesMin))) {
				setIsLoading(false);

				onNotification(
					'toast-component-form-request-require',
					'Vui lòng nhập khoảng giá!',
					undefined,
					'warning',
				);

				return;
			}

			if (!pricesMax || isNaN(parseFloat(pricesMax))) {
				setIsLoading(false);

				onNotification(
					'toast-component-form-request-require',
					'Vui lòng nhập khoảng giá!',
					undefined,
					'warning',
				);

				return;
			}

			const valuePricesMin = parseFloat(pricesMin);
			const valuePricesMax = parseFloat(pricesMax);

			if (
				unit === 'billion' &&
				valuePricesMax < 1 &&
				valuePricesMin < 1000 &&
				valuePricesMin > 1
			) {
				setIsLoading(false);
				setIsDistricts(false);

				onNotification(
					'toast-component-form-request-require',
					'Vui lòng nhập khoảng giá hợp lệ',
					undefined,
					'error',
				);

				return;
			}

			let convertPricesMin = valuePricesMin;
			let convertPricesMax = valuePricesMax;

			if (unit === 'billion') {
				if (valuePricesMin > valuePricesMax) {
					convertPricesMax = convertPricesMax * 1000;
				} else {
					convertPricesMax = convertPricesMax * 1000;
					convertPricesMin = convertPricesMin * 1000;
				}
			} else {
				if (valuePricesMin > valuePricesMax && valuePricesMax < 10) {
					convertPricesMax = convertPricesMax * 1000;
				}
			}

			const body: IRequest = {
				content,
				district,
				max: convertPricesMax,
				min: convertPricesMin,
				region,
				ward,
			};

			const result = await services.request(signal, device, user, body);

			if (!result) throw new Error();

			if (result === 'UnauthorizedDevice') {
				if (tokenDevice) throw new Error();

				const renewToken = await renewTokenDevice(signal);

				if (!renewToken) throw new Error();

				return getData(signal, renewToken);
			}

			if (result === 'UnauthorizedUser') {
				setIsLoading(false);

				onNotification(
					'toast-component-request-no-user-token',
					'Không thể thực hiện',
					undefined,
					'error',
				);

				navigation.navigate('Home');

				return;
			}

			if (result === 'BadRequest') {
				setIsLoading(false);

				onNotification(
					'toast-component-form-request-bad-request',
					'Vui lòng thử lại!',
					'Có lỗi xảy ra',
					'error',
				);

				return;
			}

			setIsLoading(false);
			handleReset();

			onNotification(
				'toast-component-form-request-success',
				'Đăng tin thành công!',
			);
		};

		if (isLoading) {
			if (isNetwork) {
				getData(controller.signal).catch(() => {
					setIsLoading(false);

					onNotification(
						'toast-component-form-request-error',
						'Vui lòng thử lại!',
						'Máy chủ bị lỗi',
						'error',
					);
				});
			} else {
				setIsLoading(false);

				onNotification(
					'toast-component-form-request-no-network',
					'Vui lòng kết nối mạng!',
					'Không có mạng',
					'error',
				);
			}
		}

		return () => controller.abort();
	}, [
		isNetwork,
		isLoading,
		isValidPrices,
		content,
		region,
		district,
		ward,
		pricesMin,
		pricesMax,
		unit,
		onNotification,
		navigation,
	]);

	// Handles
	const handleReset = () => {
		setDistricts(undefined);
		setWards(undefined);
		setContent('');
		setRegion('');
		setDistrict('');
		setWard('all');
		setPricesMin('');
		setPricesMax('');
		setUnit('million');
	};

	const handleChangeContent = (value: string) => setContent(encodeURI(value));
	const handleChangePriceMin = (value: string) => {
		if (isNaN(parseFloat(value))) return setPricesMin('');

		setPricesMin(value);
	};
	const handleChangePriceMax = (value: string) => {
		if (isNaN(parseFloat(value))) return setPricesMax('');

		setPricesMax(value);
	};

	const handleSelectRegion = (value: string) => {
		setIsDistricts(true);
		setRegion(value);
	};
	const handleSelectDistrict = (value: string) => {
		setIsWards(true);
		setDistrict(value);
	};
	const handleSelectWard = (value: string) => setWard(value);
	const handleSelectUnit = (value: string) =>
		setUnit(value as 'million' | 'billion');

	const handlePressRequest = () => setIsLoading(true);

	return (
		<>
			<Box mb={4}>
				<FormControl isRequired mb={2}>
					<FormControl.Label>Mô tả</FormControl.Label>
					<TextArea
						h={24}
						autoCompleteType="off"
						placeholder="Bạn cần mua nhà hay đất yêu cầu như thế nào?"
						scrollEnabled={false}
						onChangeText={handleChangeContent}
						value={content ? decodeURI(content) : undefined}
					/>
				</FormControl>
				<FormControl isRequired mb={2}>
					<FormControl.Label>Vị trí</FormControl.Label>
					<Box>
						<Select
							flex={1}
							placeholder="Tỉnh/Thành Phố"
							h={10}
							dropdownIcon={
								<Icon
									as={MaterialCommunityIcons}
									name="chevron-down"
									size={6}
									mr={2}
								/>
							}
							onValueChange={handleSelectRegion}
							selectedValue={region}
						>
							{regions.map(item => (
								<Select.Item
									key={item.id}
									value={item.regionID}
									label={item.name}
								/>
							))}
						</Select>
						<HStack
							justifyContent="space-between"
							alignItems="center"
							mt={2}
						>
							<Select
								flex={1}
								placeholder="Quận/Huyện"
								h={10}
								mr={1}
								dropdownIcon={
									<Icon
										as={MaterialCommunityIcons}
										name="chevron-down"
										size={5}
										mr={2}
									/>
								}
								isDisabled={!districts}
								onValueChange={handleSelectDistrict}
								selectedValue={district}
							>
								{districts &&
									districts.map(item => (
										<Select.Item
											key={item.districtID}
											value={item.districtID}
											label={item.name}
										/>
									))}
							</Select>
							<Select
								flex={1}
								placeholder="Phường/Xã"
								h={10}
								ml={1}
								dropdownIcon={
									<Icon
										as={MaterialCommunityIcons}
										name="chevron-down"
										size={5}
										mr={2}
									/>
								}
								isDisabled={!wards}
								onValueChange={handleSelectWard}
								selectedValue={ward}
							>
								<Select.Item value="all" label="Tất Cả" />
								{wards &&
									wards.map(item => (
										<Select.Item
											key={item.wardID}
											value={item.wardID}
											label={item.name}
										/>
									))}
							</Select>
						</HStack>
					</Box>
				</FormControl>
				<FormControl isRequired isInvalid={!isValidPrices}>
					<FormControl.Label>Khoảng giá</FormControl.Label>
					<HStack justifyContent="space-between" alignItems="center">
						<Box w="35%">
							<Input
								w="100%"
								placeholder="Từ"
								keyboardType="numeric"
								h={10}
								value={pricesMin}
								onChangeText={handleChangePriceMin}
							/>
						</Box>
						<Text mx={2}>~</Text>
						<Box w="35%">
							<Input
								w="100%"
								placeholder="Đến"
								keyboardType="numeric"
								h={10}
								value={pricesMax}
								onChangeText={handleChangePriceMax}
							/>
						</Box>
						<Box flex={1} ml={2}>
							<Select
								selectedValue={unit}
								flex={1}
								dropdownIcon={
									<Icon
										as={MaterialCommunityIcons}
										name="chevron-down"
										size={3}
										mr={2}
									/>
								}
								h={10}
								onValueChange={handleSelectUnit}
							>
								<Select.Item value="million" label="Triệu" />
								<Select.Item value="billion" label="Tỷ" />
							</Select>
						</Box>
					</HStack>
					<FormControl.ErrorMessage
						leftIcon={<WarningOutlineIcon size="xs" />}
					>
						Phạm vi giá thấp không thể lớn hơn phạm vi giá cao
					</FormControl.ErrorMessage>
				</FormControl>
			</Box>
			<Center>
				<Button
					size="lg"
					px="16"
					colorScheme="blue"
					isLoadingText="Đang tạo yêu cầu"
					_text={{ fontWeight: 'semibold' }}
					isDisabled={
						!content ||
						!region ||
						!district ||
						!pricesMax ||
						!pricesMin
					}
					onPress={handlePressRequest}
					isLoading={isLoading}
				>
					Yêu Cầu
				</Button>
			</Center>
		</>
	);
};

export default Index;
