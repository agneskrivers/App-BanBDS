import React, {
	FunctionComponent,
	useState,
	useEffect,
	useContext,
	useRef,
	useCallback,
} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { Button as ButtonNative, Platform } from 'react-native';
import {
	Box,
	HStack,
	Text,
	FormControl,
	TextArea,
	Input,
	Select,
	Button,
	Center,
	Icon,
	AlertDialog,
	useDisclose,
} from 'native-base';

// Components
import LoadingComponent from '@components/Loading';
import UploadComponent from '@components/Upload';

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
import type {
	ICompositeNavigationStacks,
	IPostType,
	IMyPostInfo,
	IPostCategory,
	IPostLegal,
	IPostDirection,
	IPostCreate,
	IDistrictInfo,
	IWardInfo,
	IImage,
	IPostUpdate,
	IPostLocation,
	IPoster,
} from '@interfaces';

// Type
type Unit = 'million' | 'billion';

// Interface
interface PropsEditData extends IMyPostInfo {
	postID: number;
}
interface PropsCreate {
	status: 'create';
	type: IPostType;
	fullName: string;
	phoneNumber: string;
}
interface PropsEdit {
	status: 'edit';
	data: PropsEditData;
}

// Props
type Props = PropsCreate | PropsEdit;

const Index: FunctionComponent<Props> = props => {
	// States
	const [isLoaded, setIsLoaded] = useState<boolean>(false);
	const [isImageRemove, setIsImageRemove] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isSold, setIsSold] = useState<boolean>(false);
	const [isDistricts, setIsDistricts] = useState<boolean>(false);
	const [isWards, setIsWards] = useState<boolean>(false);

	const [districts, setDistricts] = useState<IDistrictInfo[]>();
	const [wards, setWards] = useState<IWardInfo[]>();

	const [category, setCategory] = useState<IPostCategory>();
	const [region, setRegion] = useState<string>();
	const [district, setDistrict] = useState<string>();
	const [ward, setWard] = useState<string>();
	const [address, setAddress] = useState<string>();
	const [title, setTitle] = useState<string>();
	const [content, setContent] = useState<string>();
	const [acreages, setAcreages] = useState<string>();
	const [prices, setPrices] = useState<string>();
	const [unit, setUnit] = useState<Unit>(() => {
		if (props.status === 'edit' && props.data.prices >= 1000)
			return 'billion';

		return 'million';
	});
	const [legal, setLegal] = useState<IPostLegal>();
	const [direction, setDirection] = useState<IPostDirection>();
	const [ways, setWays] = useState<string>();
	const [facades, setFacades] = useState<string>();
	const [contact, setContact] = useState<string>();
	const [phoneNumber, setPhoneNumber] = useState<string[]>();
	const [video, setVideo] = useState<string>();
	const [images, setImages] = useState<IImage[]>([]);

	const [imageRemove, setImageRemove] = useState<string>();
	const [imagesRemove, setImagesRemove] = useState<string[]>([]);

	// Ref
	const buttonCancelSoldRef = useRef<ButtonNative>(null);

	// Hooks
	const navigationCreate =
		useNavigation<ICompositeNavigationStacks<'Form'>>();
	const navigationEdit =
		useNavigation<ICompositeNavigationStacks<'EditPost'>>();
	const { onNotification, regions, isNetwork } = useContext(Context);
	const { isOpen, onClose, onOpen } = useDisclose();

	// Effects
	useEffect(() => {
		const controller = new AbortController();

		const getData = async (
			signal: AbortSignal,
			regionID: string,
			districtID: string,
			list: string[],
		) => {
			const getImages: Array<IImage | null> = await Promise.all(
				[...list].map(async (item): Promise<IImage | null> => {
					const uri = `${host}/images/posts/${item}`;

					const result = await getImageSize(uri);

					if (!result) return null;

					return {
						...result,
						name: item,
						isTemp: false,
					};
				}),
			);

			const convertImages = [...getImages].filter(
				item => item !== null,
			) as IImage[];

			setImages(convertImages);

			const resultDistricts = await services.common.address.districts(
				signal,
				regionID,
			);
			const resultWards = await services.common.address.wards(
				signal,
				districtID,
			);

			if (!resultDistricts || !resultWards) throw new Error();

			if (
				resultDistricts === 'BadRequest' ||
				resultWards === 'BadRequest'
			) {
				setIsLoaded(true);

				onNotification(
					'toast-screen-form-post-loaded-bad-request',
					'Vui l??ng th??? l???i!',
					'Kh??ng th??nh c??ng',
					'warning',
				);

				return;
			}

			setDistricts(resultDistricts);
			setWards(resultWards);
			setIsLoaded(true);
		};

		if (!isLoaded) {
			if (isNetwork) {
				if (props.status === 'edit') {
					getData(
						controller.signal,
						props.data.location.region,
						props.data.location.district,
						props.data.images,
					).catch(() => {
						setIsLoaded(true);

						onNotification(
							'toast-component-form-post-error',
							'Vui l??ng th??? l???i sau!',
							'M??y ch??? b??? l???i',
							'error',
						);
					});

					return;
				}

				setIsLoaded(true);
			} else {
				setIsLoaded(true);

				onNotification(
					'toast-component-form-post-no-network',
					'Vui l??ng k???t n???i m???ng!',
					'Kh??ng c?? m???ng',
					'warning',
				);
			}
		}

		return () => controller.abort();
	}, [props, isNetwork, isLoaded, onNotification]);
	useEffect(() => {
		const controller = new AbortController();

		const getData = async (
			signal: AbortSignal,
			id: string,
		): Promise<void> => {
			const result = await services.common.address.districts(signal, id);

			if (!result) throw new Error();

			if (result === 'BadRequest') {
				setRegion('');
				setIsDistricts(false);

				onNotification(
					'toast-component-form-post-region-bad-request',
					'Vui l??ng th??? l???i!',
					'L???y danh s??ch Qu???n/Huy???n kh??ng th??nh c??ng',
					'warning',
				);

				return;
			}

			setDistricts(result);
		};

		if (region && isDistricts) {
			if (isNetwork) {
				setDistricts(undefined);

				getData(controller.signal, region).catch(() => {
					setRegion('');
					setIsDistricts(false);

					onNotification(
						'toast-component-form-post-error',
						'Vui l??ng th??? l???i!',
						'M??y ch??? b??? l???i',
						'error',
					);
				});
			} else {
				setRegion('');
				setIsDistricts(false);

				onNotification(
					'toast-component-form-post-no-network',
					'Vui l??ng k???t n???i m???ng!',
					'Kh??ng c?? m???ng',
					'warning',
				);
			}
		}

		return () => controller.abort();
	}, [isNetwork, isDistricts, region, onNotification]);
	useEffect(() => {
		const controller = new AbortController();

		const getData = async (
			signal: AbortSignal,
			id: string,
		): Promise<void> => {
			const result = await services.common.address.wards(signal, id);

			if (!result) throw new Error();

			if (result === 'BadRequest') {
				setDistrict('');
				setIsWards(false);

				onNotification(
					'toast-component-form-post-district-bad-request',
					'Vui l??ng th??? l???i!',
					'L???y danh s??ch Ph?????ng/X?? kh??ng th??nh c??ng',
					'warning',
				);

				return;
			}

			setWards(result);
		};

		if (district && isWards) {
			if (isNetwork) {
				setWards(undefined);

				getData(controller.signal, district).catch(() => {
					setDistrict('');
					setIsWards(false);

					onNotification(
						'toast-component-form-post-error',
						'Vui l??ng th??? l???i!',
						'M??y ch??? b??? l???i',
						'error',
					);
				});
			} else {
				setIsWards(false);
				setDistrict('');

				onNotification(
					'toast-component-form-post-no-network',
					'Vui l??ng k???t n???i m???ng!',
					'Kh??ng c?? m???ng',
					'warning',
				);
			}
		}

		return () => controller.abort();
	}, [isNetwork, isWards, district, onNotification]);
	useEffect(() => {
		const controller = new AbortController();

		const getData = async (signal: AbortSignal, img: string) => {
			const result = await services.common.images.remove(signal, img);

			if (!result) {
				setIsImageRemove(false);
				setImageRemove(undefined);

				onNotification(
					'toast-screen-form-post-image-remove-failed',
					'X??a h??nh ???nh kh??ng th??nh c??ng!',
					undefined,
					'warning',
				);

				return;
			}

			setIsImageRemove(false);
			setImageRemove(undefined);

			const updateImages = [...images].filter(item => item.name !== img);
			setImages(updateImages);

			onNotification(
				'toast-screen-form-image-remove-success',
				'X??a h??nh ???nh th??nh c??ng',
			);
		};

		if (imageRemove && isImageRemove) {
			if (isNetwork) {
				if (
					props.status === 'edit' &&
					props.data.images.indexOf(imageRemove) >= 0
				) {
					setImagesRemove(preImagesRemove => [
						...preImagesRemove,
						imageRemove,
					]);
					setImageRemove(undefined);
					setIsImageRemove(false);

					onNotification(
						'toast-component-form-post-remove-image-success',
						'X??a h??nh ???nh th??nh c??ng',
					);

					return;
				}

				getData(controller.signal, imageRemove)
					.catch(() => {
						setIsImageRemove(false);

						onNotification(
							'toast-component-form-post-error',
							'Vui l??ng th??? l???i sau!',
							'M??y ch??? b??? l???i',
							'error',
						);
					})
					.finally(() => setImageRemove(undefined));
			} else {
				setIsImageRemove(false);
				setImageRemove(undefined);

				onNotification(
					'toast-component-form-post-no-network',
					'Vui l??ng k???t n???i m???ng!',
					'Kh??ng c?? m???ng',
					'warning',
				);
			}
		}

		return () => controller.abort();
	}, [props, isNetwork, isImageRemove, imageRemove, images, onNotification]);
	useEffect(() => {
		const controller = new AbortController();

		const post = async (
			signal: AbortSignal,
			type: IPostType,
			fullName: string,
			phone: string,
			tokenDevice?: string,
		): Promise<void> => {
			const user = await storages.get.str('user');

			if (!user) {
				setIsLoading(false);

				onNotification(
					'toast-component-form-post-create-no-user-token',
					'Kh??ng th??? th???c hi???n!',
					undefined,
					'warning',
				);

				navigationCreate.navigate('Home');

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

			if (!category) {
				setIsLoading(false);

				onNotification(
					'toast-component-form-post-require',
					'Vui l??ng ch???n lo???i b???t ?????ng s???n',
					undefined,
					'warning',
				);

				return;
			}

			if (!region) {
				setIsLoading(false);

				onNotification(
					'toast-component-form-post-require',
					'Vui l??ng ch???n T???nh/Th??nh ph???',
					undefined,
					'warning',
				);

				return;
			}

			if (!district) {
				setIsLoading(false);

				onNotification(
					'toast-component-form-post-require',
					'Vui l??ng ch???n Qu???n/Huy???n',
					undefined,
					'warning',
				);

				return;
			}

			if (!ward) {
				setIsLoading(false);

				onNotification(
					'toast-component-form-post-require',
					'Vui l??ng ch???n Ph?????ng/X??',
					undefined,
					'warning',
				);

				return;
			}

			if (!title) {
				setIsLoading(false);

				onNotification(
					'toast-component-form-post-require',
					'Vui l??ng nh???p ti??u ?????',
					undefined,
					'warning',
				);

				return;
			}

			if (!content) {
				setIsLoading(false);

				onNotification(
					'toast-component-form-post-require',
					'Vui l??ng nh???p m?? t???',
					undefined,
					'warning',
				);

				return;
			}

			if (!acreages) {
				setIsLoading(false);

				onNotification(
					'toast-component-form-post-require',
					'Vui l??ng nh???p di???n t??ch',
					undefined,
					'warning',
				);

				return;
			}

			if (!prices) {
				setIsLoading(false);

				onNotification(
					'toast-component-form-post-require',
					'Vui l??ng nh???p gi??',
					undefined,
					'warning',
				);

				return;
			}

			if (images.length < 3) {
				setIsLoading(false);

				onNotification(
					'toast-component-form-post-require',
					'Vui l??ng t???i t???i thi???u 3 ???nh',
					undefined,
					'warning',
				);

				return;
			}

			const body: IPostCreate = {
				category,
				location: {
					region,
					district,
					ward,
					address,
				},
				title,
				content,
				type,
				acreages: parseFloat(acreages),
				prices: parseFloat(prices) * (unit === 'million' ? 1 : 1000),
				legal: legal ? legal : null,
				direction: direction ? direction : null,
				ways: ways ? parseFloat(ways) : null,
				facades: facades ? parseFloat(facades) : null,
				images: [...images].map(item => item.name),
				project: null,
				video: video ? video : null,
				poster: {
					name: contact ? contact : fullName,
					phoneNumber: phoneNumber ? phoneNumber : [phone],
				},
			};

			const result = await services.posts.create(
				signal,
				device,
				user,
				body,
			);

			if (!result) throw new Error();

			if (result === 'UnauthorizedDevice') {
				if (tokenDevice) throw new Error();

				const renewToken = await renewTokenDevice(signal);

				if (!renewToken) throw new Error();

				return post(signal, type, fullName, phone, renewToken);
			}

			if (result === 'UnauthorizedUser') {
				setIsLoading(false);

				onNotification(
					'toast-component-form-post-create-no-user-token',
					'Kh??ng th??? th???c hi???n!',
					undefined,
					'warning',
				);

				navigationCreate.navigate('Home');

				return;
			}

			if (result === 'BadRequest') {
				setIsLoading(false);

				onNotification(
					'toast-component-form-post-create-bad-request',
					'Vui l??ng th??? l???i!',
					'????ng tin kh??ng th??nh c??ng',
					'warning',
				);

				return;
			}

			setIsLoading(false);

			onNotification(
				'toast-component-form-post-success',
				'????ng tin th??nh c??ng',
			);

			handleReset();
		};
		const edit = async (
			signal: AbortSignal,
			data: PropsEditData,
			tokenDevice?: string,
		): Promise<void> => {
			const user = await storages.get.str('user');

			if (!user) {
				setIsLoading(false);

				onNotification(
					'toast-component-form-post-edit-no-user-token',
					'Kh??ng th??? th???c hi???n!',
					undefined,
					'warning',
				);

				navigationEdit.navigate('Home');

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

			const isEdit =
				!category &&
				!region &&
				!district &&
				!wards &&
				!address &&
				!title &&
				!content &&
				!acreages &&
				!prices &&
				!legal &&
				!direction &&
				!ways &&
				!facades &&
				!contact &&
				!facades &&
				!contact &&
				(!phoneNumber || phoneNumber.length === 0) &&
				!video &&
				imagesRemove.length === 0;

			if (isEdit) {
				setIsLoading(false);

				onNotification(
					'toast-component-form-post-edit-check',
					'Kh??ng c?? g?? ????? l??u',
					undefined,
					'warning',
				);

				return;
			}

			let location:
				| Partial<Omit<IPostLocation, 'coordinate'>>
				| undefined;
			let poster: Partial<IPoster> | undefined;

			if (region) {
				location = { ...(location ? location : {}), region };
			}

			if (district) {
				location = { ...(location ? location : {}), district };
			}

			if (ward) {
				location = { ...(location ? location : {}), ward };
			}

			if (address) {
				location = { ...(location ? location : {}), address };
			}

			if (contact) {
				poster = { ...(poster ? poster : {}), name: contact };
			}

			if (phoneNumber) {
				poster = { ...(poster ? poster : {}), phoneNumber };
			}

			let body: IPostUpdate = {};

			if (location) {
				body = { ...body, location };
			}

			if (poster) {
				body = { ...body, poster };
			}

			if (category) {
				body = { ...body, category };
			}

			if (title) {
				body = { ...body, title };
			}

			if (content) {
				body = { ...body, content };
			}

			if (acreages) {
				body = { ...body, acreages: parseFloat(acreages) };
			}

			if (prices) {
				body = {
					...body,
					prices:
						parseFloat(prices) * (unit === 'million' ? 1 : 1000),
				};
			}

			if (legal) {
				body = { ...body, legal };
			}

			if (direction) {
				body = { ...body, direction };
			}

			if (ways) {
				body = { ...body, ways: parseFloat(ways) };
			}

			if (facades) {
				body = { ...body, facades: parseFloat(facades) };
			}

			if (video) {
				body = { ...body, video };
			}

			if (images.length > data.images.length) {
				body = { ...body, images: [...images].map(item => item.name) };
			}

			if (imagesRemove.length > 0) {
				body = { ...body, removeImages: imagesRemove };
			}

			const result = await services.posts.update(
				signal,
				device,
				user,
				data.postID,
				body,
			);

			if (!result) throw new Error();

			if (result === 'UnauthorizedDevice') {
				if (tokenDevice) throw new Error();

				const renewToken = await renewTokenDevice(signal);

				if (!renewToken) throw new Error();

				return edit(signal, data, renewToken);
			}

			if (result === 'UnauthorizedUser') {
				setIsLoading(false);

				onNotification(
					'toast-component-form-post-edit-no-user-token',
					'Kh??ng th??? th???c hi???n!',
					undefined,
					'warning',
				);

				navigationEdit.navigate('Home');

				return;
			}

			if (result === 'BadRequest') {
				setIsLoading(false);

				onNotification(
					'toast-component-form-edit-bad-request',
					'Vui l??ng th??? l???i!',
					'L??u tin kh??ng th??nh c??ng',
					'warning',
				);

				return;
			}

			setTimeout(() => {
				setIsLoading(false);

				onNotification(
					'toast-component-form-post-edit-success',
					'L??u tin th??nh c??ng',
				);

				handleReset();

				navigationEdit.navigate('MyPost', {
					postID: data.postID,
				});
			}, 500);
		};

		if (isLoading) {
			if (isNetwork) {
				if (props.status === 'create') {
					post(
						controller.signal,
						props.type,
						props.fullName,
						props.phoneNumber,
					).catch(() => {
						setIsLoading(false);

						onNotification(
							'toast-component-form-post-error',
							'Vui l??ng th??? l???i!',
							'M??y ch??? b??? l???i',
							'error',
						);
					});
				} else {
					edit(controller.signal, props.data).catch(() => {
						setIsLoading(false);

						onNotification(
							'toast-component-form-post-error',
							'Vui l??ng th??? l???i!',
							'M??y ch??? b??? l???i',
							'error',
						);
					});
				}
			} else {
				setIsLoading(false);

				onNotification(
					'toast-component-form-post-no-network',
					'Vui l??ng k???t n???i m???ng!',
					'Kh??ng c?? m???ng',
					'warning',
				);
			}
		}

		return () => controller.abort();
	}, [
		props,
		isNetwork,
		navigationCreate,
		navigationEdit,
		acreages,
		address,
		category,
		contact,
		content,
		direction,
		district,
		facades,
		images,
		imagesRemove,
		isLoading,
		legal,
		phoneNumber,
		prices,
		region,
		title,
		unit,
		video,
		ward,
		wards,
		ways,
		onNotification,
	]);
	useEffect(() => {
		const controller = new AbortController();

		const getData = async (
			signal: AbortSignal,
			postID: number,
			tokenDevice?: string,
		): Promise<void> => {
			const user = await storages.get.str('user');

			if (!user) {
				onNotification(
					'toast-component-form-post-sold-no-user-token',
					'Kh??ng th??? th???c hi???n!',
					undefined,
					'warning',
				);

				navigationEdit.navigate('Home');

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

			const result = await services.posts.sold(
				signal,
				device,
				user,
				postID,
			);

			if (!result) throw new Error();

			if (result === 'UnauthorizedDevice') {
				if (tokenDevice) throw new Error();

				const renewToken = await renewTokenDevice(signal);

				if (!renewToken) throw new Error();

				return getData(signal, postID, renewToken);
			}

			if (result === 'UnauthorizedUser') {
				setIsSold(false);

				onNotification(
					'toast-component-form-post-sold-no-user-token',
					'Kh??ng th??? th???c hi???n!',
					undefined,
					'warning',
				);

				navigationEdit.navigate('Home');

				return;
			}

			if (result === 'BadRequest') {
				setIsSold(false);

				onNotification(
					'toast-component-form-sold-bad-request',
					'Vui l??ng th??? l???i!',
					'Kh??ng th??nh c??ng',
					'warning',
				);

				return;
			}

			setTimeout(() => {
				setIsSold(false);

				onNotification(
					'toast-component-form-sold-success',
					'X??? l?? th??nh c??ng',
				);

				navigationEdit.navigate('Home');
			}, 500);
		};

		if (isSold && props.status === 'edit') {
			if (isNetwork) {
				getData(controller.signal, props.data.postID).catch(() => {
					setIsSold(false);

					onNotification(
						'toast-component-form-post-sold-error',
						'Vui l??ng th??? l???i!',
						'L???i',
						'error',
					);
				});
			} else {
				setIsSold(false);

				onNotification(
					'toast-component-form-post-no-network',
					'Vui l??ng k???t n???i m???ng!',
					'Kh??ng c?? m???ng',
					'warning',
				);
			}
		}

		return () => controller.abort();
	}, [props, isNetwork, isSold, onNotification, navigationEdit]);
	useEffect(() => {
		const id = setTimeout(() => {
			if (prices) {
				const value = parseFloat(prices);

				if (value >= 1000 && unit === 'million') {
					setPrices((value / 1000).toString());
					setUnit('billion');

					return;
				}

				if (value < 1 && unit === 'billion') {
					setPrices((value * 1000).toString());
					setUnit('million');

					return;
				}
			}
		}, 100);

		return () => clearTimeout(id);
	}, [unit, prices]);

	// Handles
	const handleReset = () => {
		setCategory(undefined);
		setRegion(undefined);
		setDistrict(undefined);
		setWard(undefined);
		setAddress(undefined);
		setTitle(undefined);
		setContent(undefined);
		setAcreages(undefined);
		setPrices(undefined);
		setLegal(undefined);
		setDirection(undefined);
		setWays(undefined);
		setFacades(undefined);
		setContact(undefined);
		setPhoneNumber(undefined);
		setImageRemove(undefined);
		setUnit('million');
		setImagesRemove([]);
		setImages([]);
	};

	const handleUpload = useCallback(
		(img: IImage) => setImages(preImages => [...preImages, img]),
		[],
	);
	const handleRemove = useCallback((img: string) => {
		setIsImageRemove(true);
		setImageRemove(img);
	}, []);

	const handleSelectCategory = (item: string) =>
		setCategory(item as IPostCategory);
	const handleSelectRegion = (item: string) => {
		setIsDistricts(true);
		setRegion(item);
	};
	const handleSelectDistrict = (item: string) => {
		setIsWards(true);
		setDistrict(item);
	};
	const handleSelectWard = (item: string) => setWard(item);
	const handleSelectUnit = (item: string) => setUnit(item as Unit);
	const handleSelectLegal = (item: string) => setLegal(item as IPostLegal);
	const handleSelectDirection = (item: string) =>
		setDirection(item as IPostDirection);

	const handleChangeAddress = (text: string) => setAddress(text);
	const handleChangeTitle = (text: string) => setTitle(encodeURI(text));
	const handleChangeContent = (text: string) => setContent(encodeURI(text));
	const handleChangeAcreages = (text: string) => {
		if (isNaN(parseFloat(text))) return setAcreages('');

		setAcreages(text);
	};
	const handleChangePrices = (text: string) => {
		if (isNaN(parseFloat(text))) return setPrices('');

		setPrices(text);
	};
	const handleChangeWays = (text: string) => {
		if (isNaN(parseFloat(text))) return setWays('');

		setWays(text);
	};
	const handleChangeFacades = (text: string) => {
		if (isNaN(parseFloat(text))) return setFacades('');

		setFacades(text);
	};
	const handleChangeContact = (text: string) => setContact(text);
	const handleChangePhoneNumber = (text: string) => {
		const value = text.split(',');

		setPhoneNumber(value.map(item => item.trim()));
	};
	const handleChangeVideo = (text: string) => setVideo(text);

	const handlePressButton = () => setIsLoading(true);
	const handlePressSold = () => {
		if (props.status === 'edit') return onOpen();
	};
	const handlePressAcceptSold = () => {
		if (props.status === 'edit') {
			setIsSold(true);
			onClose();
		}
	};

	// Validator
	const validatorCategory = category
		? category
		: props.status === 'edit'
		? props.data.category
		: undefined;
	const validatorRegion = region
		? region
		: props.status === 'edit'
		? props.data.location.region
		: undefined;
	const validatorDistrict = district
		? district
		: props.status === 'edit'
		? props.data.location.district
		: undefined;
	const validatorWard = ward
		? ward
		: props.status === 'edit'
		? props.data.location.ward
		: undefined;
	const validatorAddress = address
		? address
		: props.status === 'edit'
		? props.data.location.address.split(' ,').slice(0, -3).join(', ')
		: undefined;
	const validatorTitle = title
		? decodeURI(title)
		: props.status === 'edit'
		? decodeURI(props.data.title)
		: undefined;
	const validatorContent = content
		? decodeURI(content)
		: props.status === 'edit'
		? decodeURI(props.data.content)
		: undefined;
	const validatorAcreages = acreages
		? parseFloat(acreages).toLocaleString('en')
		: props.status === 'edit'
		? props.data.acreages.toLocaleString('en')
		: undefined;
	const validatorPrices = prices
		? parseFloat(prices).toLocaleString('en')
		: props.status === 'edit'
		? props.data.prices.toLocaleString('en')
		: undefined;
	const validatorLegal = legal
		? legal
		: props.status === 'edit'
		? props.data.legal
			? props.data.legal
			: undefined
		: undefined;
	const validatorDirection = direction
		? direction
		: props.status === 'edit'
		? props.data.direction
			? props.data.direction
			: undefined
		: undefined;
	const validatorWays = ways
		? parseFloat(ways).toLocaleString('en')
		: props.status === 'edit'
		? props.data.ways
			? props.data.ways.toLocaleString('en')
			: undefined
		: undefined;
	const validatorFacades = facades
		? parseFloat(facades).toLocaleString('en')
		: props.status === 'edit'
		? props.data.facades
			? props.data.facades.toLocaleString('en')
			: undefined
		: undefined;
	const validatorVideo = video
		? video
		: props.status === 'edit'
		? props.data.video
			? props.data.video
			: undefined
		: undefined;
	const validatorContact = contact
		? contact
		: props.status === 'create'
		? props.fullName
		: props.data.poster.name;
	const validatorPhoneNumber = phoneNumber
		? phoneNumber.join(', ')
		: props.status === 'create'
		? props.phoneNumber
		: props.data.poster.phoneNumber.join(', ');
	const validatorButtonPost =
		!category ||
		!region ||
		!district ||
		!ward ||
		!title ||
		!content ||
		!acreages ||
		!prices ||
		images.length < 3 ||
		isLoading ||
		isImageRemove;
	const validatorButtonSave =
		(!category &&
			!region &&
			!district &&
			!wards &&
			!address &&
			!title &&
			!content &&
			!acreages &&
			!prices &&
			!legal &&
			!direction &&
			!ways &&
			!facades &&
			!contact &&
			!facades &&
			!contact &&
			(!phoneNumber || phoneNumber.length === 0) &&
			!video &&
			imagesRemove.length === 0) ||
		isLoading ||
		isImageRemove;

	if (!isLoaded) return <LoadingComponent />;

	return (
		<>
			<Box mb={4}>
				<Text fontSize={18} fontWeight="bold" mb={2}>
					Th??ng tin c?? b???n
				</Text>
				<FormControl isRequired mb={2}>
					<FormControl.Label>Lo???i b???t ?????ng s???n</FormControl.Label>
					<Select
						placeholder="VD: Chung C??"
						h={10}
						dropdownIcon={
							<Icon
								as={MaterialCommunityIcons}
								name="chevron-down"
								size={6}
								mr={2}
							/>
						}
						onValueChange={handleSelectCategory}
						selectedValue={validatorCategory}
					>
						<Select.Item value="apartment" label="Chung C??" />
						<Select.Item value="house" label="Nh?? Ri??ng" />
						<Select.Item value="soil" label="?????t N???n" />
					</Select>
				</FormControl>
				<FormControl isRequired>
					<FormControl.Label>?????a Ch??? </FormControl.Label>
					<Box>
						<Select
							flex={1}
							placeholder="T???nh/Th??nh Ph???"
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
							selectedValue={validatorRegion}
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
								placeholder="Qu???n/Huy???n"
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
								selectedValue={validatorDistrict}
							>
								{districts ? (
									districts.map(item => (
										<Select.Item
											key={item.districtID}
											value={item.districtID}
											label={item.name}
										/>
									))
								) : (
									<Select.Item
										label="Qu???n/Huy???n"
										value=""
										isDisabled
									/>
								)}
							</Select>
							<Select
								flex={1}
								placeholder="Ph?????ng/X??"
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
								selectedValue={validatorWard}
							>
								{wards ? (
									wards.map(item => (
										<Select.Item
											key={item.wardID}
											value={item.wardID}
											label={item.name}
										/>
									))
								) : (
									<Select.Item value="" label="Ph?????ng/X??" />
								)}
							</Select>
						</HStack>
						<Input
							keyboardType="numeric"
							h={10}
							mt={1}
							placeholder="VD: S??? nh??, Ng??, ..."
							onChangeText={handleChangeAddress}
							isDisabled={!region || !district || !ward}
							value={validatorAddress}
						/>
					</Box>
				</FormControl>
			</Box>
			<Box mb={4}>
				<Text fontSize={18} fontWeight="bold" mb={2}>
					Th??ng tin b??i vi???t
				</Text>
				<FormControl isRequired mb={2}>
					<FormControl.Label>Ti??u ????? </FormControl.Label>
					<TextArea
						h={20}
						placeholder="VD: B??n nh?? ri??ng 50m2 ch??nh ch??? t???i C???u Gi???y"
						autoCompleteType="off"
						maxLength={100}
						scrollEnabled={false}
						onChangeText={handleChangeTitle}
						value={validatorTitle}
					/>
				</FormControl>
				<FormControl>
					<FormControl.Label>M?? t???</FormControl.Label>
					<TextArea
						h={56}
						autoCompleteType="off"
						placeholder="Nh???p m?? t??? chung v??? b???t ?????ng s???n c???a b???n. V?? d???: Khu nh?? c?? v??? tr?? thu???n l???i, g???n c??ng vi??n, g???n tr?????ng h???c ... "
						maxLength={3000}
						scrollEnabled={false}
						onChangeText={handleChangeContent}
						value={validatorContent}
					/>
				</FormControl>
			</Box>
			<Box mb={4}>
				<Text fontSize={18} fontWeight="bold" mb={2}>
					Th??ng tin b???t ?????ng s???n
				</Text>
				<FormControl isRequired mb={2}>
					<FormControl.Label>Di???n t??ch </FormControl.Label>
					<Input
						keyboardType="numeric"
						h={10}
						rightElement={
							<Text mr={2} color="gray.600">
								m??
							</Text>
						}
						onChangeText={handleChangeAcreages}
						value={validatorAcreages}
					/>
				</FormControl>
				<FormControl isRequired mb={2}>
					<FormControl.Label>M???c gi?? </FormControl.Label>
					<HStack justifyContent="space-between" alignItems="center">
						<Input
							h={10}
							keyboardType="numeric"
							flex={2}
							mr={1}
							onChangeText={handleChangePrices}
							value={validatorPrices}
						/>
						<Select
							flex={1}
							ml={1}
							h={10}
							selectedValue={unit}
							dropdownIcon={
								<Icon
									as={MaterialCommunityIcons}
									name="chevron-down"
									size={5}
									mr={2}
								/>
							}
							onValueChange={handleSelectUnit}
						>
							<Select.Item value="million" label="Tri???u" />
							<Select.Item value="billion" label="T???" />
						</Select>
					</HStack>
				</FormControl>
				<HStack alignItems="center" justifyContent="space-between">
					<FormControl flex={1} mr={1}>
						<FormControl.Label>Gi???y t??? ph??p l??</FormControl.Label>
						<Select
							flex={1}
							placeholder="Ch???n gi???y t??? ph??p l??"
							h={10}
							dropdownIcon={
								<Icon
									as={MaterialCommunityIcons}
									name="chevron-down"
									size={5}
									mr={2}
								/>
							}
							onValueChange={handleSelectLegal}
							selectedValue={validatorLegal}
						>
							<Select.Item value="book" label="S??? ?????/ S??? h???ng" />
							<Select.Item
								value="saleContract"
								label="H???p ?????ng mua b??n"
							/>
							<Select.Item
								value="waitingForBook"
								label="??ang ch??? s???"
							/>
						</Select>
					</FormControl>
					<FormControl flex={1} ml={1}>
						<FormControl.Label>H?????ng nh??</FormControl.Label>
						<Select
							flex={1}
							placeholder="Ch???n H?????ng"
							h={10}
							dropdownIcon={
								<Icon
									as={MaterialCommunityIcons}
									name="chevron-down"
									size={5}
									mr={2}
								/>
							}
							onValueChange={handleSelectDirection}
							selectedValue={validatorDirection}
						>
							<Select.Item value="east" label="????ng" />
							<Select.Item value="west" label="T??y" />
							<Select.Item value="south" label="Nam" />
							<Select.Item value="north" label="B???c" />
							<Select.Item value="northeast" label="????ng B???c" />
							<Select.Item value="northwest" label="T??y B???c" />
							<Select.Item value="southwest" label="T??y Nam" />
							<Select.Item value="southeast" label="????ng Nam" />
						</Select>
					</FormControl>
				</HStack>
				<HStack
					alignItems="center"
					justifyContent="space-between"
					mb={2}
				>
					<FormControl flex={1} mr={1}>
						<FormControl.Label>????????ng va??o</FormControl.Label>
						<Input
							flex={1}
							keyboardType="numeric"
							placeholder="Nh???p s???"
							h={10}
							rightElement={
								<Text mr={2} color="gray.600">
									m
								</Text>
							}
							onChangeText={handleChangeWays}
							value={validatorWays}
						/>
					</FormControl>
					<FormControl flex={1} ml={1}>
						<FormControl.Label>M????t ti????n</FormControl.Label>
						<Input
							flex={1}
							keyboardType="numeric"
							placeholder="Nh???p s???"
							h={10}
							rightElement={
								<Text mr={2} color="gray.600">
									m
								</Text>
							}
							onChangeText={handleChangeFacades}
							value={validatorFacades}
						/>
					</FormControl>
				</HStack>
			</Box>
			<Box mb={4}>
				<Text fontSize={18} fontWeight="bold" mb={2}>
					Th??ng tin li??n h???
				</Text>
				<FormControl isRequired mb={2}>
					<FormControl.Label>T??n li??n h??? </FormControl.Label>
					<Input
						placeholder="Nh???p t??n"
						h={10}
						onChangeText={handleChangeContact}
						value={validatorContact}
					/>
				</FormControl>
				<FormControl isRequired>
					<FormControl.Label>S??? ??i???n tho???i </FormControl.Label>
					<Input
						placeholder="Nh???p s??? ??i???n tho???i."
						h={10}
						onChangeText={handleChangePhoneNumber}
						value={validatorPhoneNumber}
					/>
					<FormControl.HelperText>
						L??u ??: M???i s??? c??ch nhau d???u ph???y
					</FormControl.HelperText>
				</FormControl>
			</Box>
			<Box mb={4}>
				<Text fontSize={18} fontWeight="bold" mb={2}>
					{'H??nh ???nh & Video'}
				</Text>
				<Input
					flex={1}
					h={10}
					placeholder="Nh???p Link Video Youtube (N???u c??)"
					mb={2}
					onChangeText={handleChangeVideo}
					value={validatorVideo}
				/>
				<UploadComponent
					isRemove={isImageRemove}
					images={[...images].filter(
						item => imagesRemove.indexOf(item.name) === -1,
					)}
					onUpload={handleUpload}
					onRemove={handleRemove}
				/>
			</Box>
			<Center flexDirection="row" mb={Platform.OS === 'android' ? 4 : 0}>
				<Button
					size="lg"
					px={props.status === 'edit' ? 5 : 16}
					colorScheme="blue"
					_text={{ fontWeight: 'semibold' }}
					mr={props.status === 'edit' ? 2 : 0}
					isDisabled={
						props.status === 'create'
							? validatorButtonPost
							: validatorButtonSave
					}
					isLoading={isLoading}
					isLoadingText={
						props.status === 'create' ? '??ang t???o tin' : '??ang l??u'
					}
					onPress={handlePressButton}
				>
					{props.status === 'create' ? '????ng tin' : 'L??u'}
				</Button>
				{props.status === 'edit' && (
					<Button
						size="lg"
						colorScheme="success"
						_text={{ fontWeight: 'semibold' }}
						ml={2}
						px={5}
						onPress={handlePressSold}
						isLoading={isSold}
						isLoadingText="??ang x??? l??"
						isDisabled={isSold || isLoading || isImageRemove}
					>
						???? b??n
					</Button>
				)}
			</Center>
			<AlertDialog
				leastDestructiveRef={buttonCancelSoldRef}
				isOpen={isOpen}
				onClose={onClose}
			>
				<AlertDialog.Content>
					<AlertDialog.CloseButton />
					<AlertDialog.Header>???? B??n</AlertDialog.Header>
					<AlertDialog.Body>
						B???n x??c nh???n b???t ?????ng s???n n??y ???? b??n?
					</AlertDialog.Body>
					<AlertDialog.Footer>
						<Button.Group space={2}>
							<Button
								variant="unstyled"
								colorScheme="coolGray"
								onPress={onClose}
								ref={buttonCancelSoldRef}
							>
								H???y
							</Button>
							<Button
								colorScheme="danger"
								onPress={handlePressAcceptSold}
								_text={{
									fontWeight: 'medium',
								}}
							>
								X??c nh???n
							</Button>
						</Button.Group>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog>
		</>
	);
};

export default Index;
