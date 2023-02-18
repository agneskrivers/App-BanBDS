import React, {
	FunctionComponent,
	useState,
	useEffect,
	useContext,
} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import {
	Text,
	Box,
	Pressable,
	Icon,
	Progress,
	HStack,
	Image,
	Center,
	Spinner,
} from 'native-base';

// Configs
import { host } from '@configs';

// Context
import { Context } from '@context';

// Helpers
import { renewTokenDevice, storages } from '@helpers';

// Services
import services from '@services';

// Utils
import { getImageSize } from '@utils';

// Interfaces
import { IImage } from '@interfaces';

// Type
type Status = 'normal' | 'uploading' | 'failed' | 'success';

// Props
interface Props {
	isRemove: boolean;
	images: IImage[];
	onUpload(img: IImage): void;
	onRemove(img: string): void;
}

const Index: FunctionComponent<Props> = props => {
	// Props
	const { isRemove, images, onUpload, onRemove } = props;

	// States
	const [status, setStatus] = useState<Status>('normal');

	const [image, setImage] = useState<Asset>();
	const [imageRemove, setImageRemove] = useState<string>();
	const [progress, setProgress] = useState<number>(0);
	const [result, setResult] = useState<IImage>();

	// Hooks
	const { isNetwork, onNotification } = useContext(Context);

	// Effects
	useEffect(() => {
		let id: NodeJS.Timeout;

		if (status === 'uploading') {
			if (progress > 100) return;

			id = setTimeout(
				() => setProgress(preProgress => preProgress + 1),
				5,
			);
		}

		return () => clearTimeout(id);
	}, [status, progress]);
	useEffect(() => {
		const controller = new AbortController();

		const getData = async (
			signal: AbortSignal,
			img: Asset,
			tokenDevice?: string,
		): Promise<void> => {
			let token: string | undefined | null = tokenDevice;

			if (!token) {
				token = await storages.get.str('device');
			}

			if (!token) {
				token = await renewTokenDevice(signal);
			}

			if (!token) throw new Error();

			const body = new FormData();

			body.append('file', {
				name: img.fileName,
				uri: img.uri,
				type: img.type,
			});

			const resultUpload = await services.common.images.upload(
				signal,
				token,
				body,
			);

			if (!resultUpload) throw new Error();

			if (resultUpload === 'Unauthorized') {
				if (tokenDevice) throw new Error();

				const renewToken = await renewTokenDevice(signal);

				if (!renewToken) throw new Error();

				return getData(signal, img, renewToken);
			}

			if (resultUpload === 'NotFound') {
				setImage(undefined);
				setStatus('normal');

				onNotification(
					'toast-component-upload-not-found',
					'Không có hình ảnh!',
					undefined,
					'warning',
				);

				return;
			}

			if (resultUpload === 'ImageFormat') {
				setImage(undefined);
				setStatus('normal');

				onNotification(
					'toast-component-upload-image-format',
					'Vui lòng chọn ảnh khác!',
					'Định dạng ảnh không hỗ trợ',
					'info',
				);

				return;
			}

			if (resultUpload === 'ImageToBig') {
				setImage(undefined);
				setStatus('normal');

				onNotification(
					'toast-component-upload-image-to-big',
					'Vui lòng chọn ảnh khác!',
					'Hình ảnh quá lớn',
					'info',
				);

				return;
			}

			let width = img.width;
			let height = img.height;

			if (!width || !height) {
				const uri = `${host}/temp/${resultUpload}`;

				const resultImageSize = await getImageSize(uri);

				if (resultImageSize) {
					width = resultImageSize.width;
					height = resultImageSize.height;
				}
			}

			if (!width || !height) {
				width = 240;
				height = 180;
			}

			setImage(undefined);
			setResult({ name: resultUpload, width, height, isTemp: true });
		};

		if (status === 'uploading' && image) {
			if (isNetwork) {
				getData(controller.signal, image).catch(() => {
					setStatus('normal');
					setImage(undefined);
					setProgress(0);

					onNotification(
						'toast-component-upload-error',
						'Vui lòng thử lại!',
						'Máy chủ bị lỗi',
						'error',
					);
				});
			} else {
				setStatus('normal');
				setImage(undefined);

				onNotification(
					'toast-component-upload-no-network',
					'Vui lòng kết nối mạng!',
					'Không có mạng',
					'warning',
				);
			}
		}

		return () => controller.abort();
	}, [isNetwork, status, image, onNotification]);
	useEffect(() => {
		if (result && progress >= 100 && status !== 'success') {
			setStatus('success');
			setProgress(0);
		}
	}, [progress, result, status]);
	useEffect(() => {
		let id: NodeJS.Timeout;

		if (status === 'failed') {
			id = setTimeout(() => {
				onNotification(
					'toast-component-upload-failed',
					'Tải ảnh không thành công!',
					undefined,
					'error',
				);
				setStatus('normal');
				setProgress(0);
			}, 1000);
		}

		return () => clearTimeout(id);
	}, [status, onNotification]);
	useEffect(() => {
		if (status === 'success' && result) {
			setResult(undefined);
			onUpload(result);
			setStatus('normal');

			onNotification(
				'toast-screen-form-upload-success',
				'Tải ảnh thành công.',
			);
		}
	}, [status, result, onNotification, onUpload]);
	useEffect(() => {
		if (imageRemove !== undefined) {
			onRemove(imageRemove);
		}
	}, [imageRemove, onRemove]);

	// Handles
	const handlePressChooseImage = async () => {
		if (status === 'normal') {
			const response = await launchImageLibrary({ mediaType: 'photo' });

			if (!response.didCancel && response.assets) {
				const { width, height } = response.assets[0];

				if (width && height) {
					setImage(response.assets[0]);
					setStatus('uploading');

					return;
				}

				onNotification(
					'toast-screen-form-upload-not-invalid',
					'Hình ảnh không hỗ trợ',
					undefined,
					'info',
				);
			}
		}
	};
	const handlePressRemoveImage = (name: string) => setImageRemove(name);

	return (
		<Box>
			<Pressable onPress={handlePressChooseImage}>
				<Box
					flex={1}
					alignItems="center"
					py={4}
					borderWidth={1}
					borderStyle="dashed"
					borderColor="gray.400"
					borderRadius={3}
					mb={2}
				>
					<Icon
						as={MaterialCommunityIcons}
						name={
							status === 'normal'
								? 'cloud-upload-outline'
								: status === 'uploading'
								? 'cloud-sync-outline'
								: status === 'success'
								? 'cloud-check-outline'
								: 'weather-cloudy-alert'
						}
						size={16}
						color={
							status === 'normal' || status === 'uploading'
								? 'primary.300'
								: status === 'success'
								? 'success.300'
								: 'danger.300'
						}
					/>
					{status !== 'uploading' ? (
						<Text
							fontSize={14}
							fontWeight="medium"
							color={
								status === 'normal'
									? 'primary.400'
									: status === 'success'
									? 'success.400'
									: 'danger.400'
							}
							italic
						>
							{status === 'normal'
								? 'Bấm để chọn ảnh cần tải lên'
								: status === 'success'
								? 'Tải ảnh thành công'
								: 'Lỗi tải ảnh. Vui lòng thử lại!'}
						</Text>
					) : (
						<Progress w="80%" value={progress} mx="auto" />
					)}
					<Center>
						<Text
							color="muted.600"
							fontWeight={500}
						>{`${images.length}/11 ảnh`}</Text>
					</Center>
				</Box>
			</Pressable>
			{images.length > 0 && (
				<Box
					w="100%"
					height={200}
					bg="coolGray.400"
					position="relative"
					alignItems="center"
					justifyContent="center"
					mb={2}
					borderRadius="md"
				>
					{isRemove &&
					imageRemove &&
					imageRemove === images[0].name ? (
						<Center position="absolute" zIndex={10}>
							<Spinner color="white" size="lg" />
						</Center>
					) : (
						<Pressable
							zIndex={9}
							position="absolute"
							top={2}
							right={2}
							backgroundColor="white"
							borderRadius={100}
							p={1}
							onPress={() =>
								handlePressRemoveImage(images[0].name)
							}
						>
							<Icon
								as={MaterialCommunityIcons}
								name="close"
								size={4}
								color="black"
							/>
						</Pressable>
					)}
					<Box
						position="absolute"
						top={2}
						left={2}
						py={1}
						px={2}
						backgroundColor="white"
						borderRadius={5}
						zIndex={9}
					>
						<Text fontSize={12} fontWeight="medium">
							Ảnh đại diện
						</Text>
					</Box>
					<Image
						source={{
							uri: `${host}/${
								images[0].isTemp ? 'temp' : 'images/posts'
							}/${images[0].name}`,
						}}
						alt="Image"
						h={200}
						resizeMode="cover"
						style={{
							aspectRatio: images[0].width / images[0].height,
						}}
					/>
				</Box>
			)}
			<HStack justifyContent="space-between" flexWrap="wrap">
				{images.length > 1 &&
					[...images.slice(1)].map(item => (
						<Box
							key={item.name}
							w="45%"
							height={100}
							bg="coolGray.400"
							position="relative"
							alignItems="center"
							justifyContent="center"
							borderRadius="md"
							overflow="hidden"
							mb={2}
						>
							{isRemove &&
							imageRemove &&
							imageRemove === item.name ? (
								<Center position="absolute" zIndex={10}>
									<Spinner color="white" size="lg" />
								</Center>
							) : (
								<Pressable
									zIndex={9}
									position="absolute"
									top={2}
									right={2}
									backgroundColor="white"
									borderRadius={100}
									p={0.5}
									onPress={() =>
										handlePressRemoveImage(item.name)
									}
								>
									<Icon
										as={MaterialCommunityIcons}
										name="close"
										size={4}
										color="black"
									/>
								</Pressable>
							)}
							<Image
								source={{
									uri: `${host}/${
										item.isTemp ? 'temp' : 'images/posts'
									}/${item.name}`,
								}}
								alt="Image"
								h={200}
								resizeMode="contain"
								style={{
									aspectRatio: item.width / item.height,
								}}
							/>
						</Box>
					))}
			</HStack>
		</Box>
	);
};

export default Index;
