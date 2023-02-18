import Config from 'react-native-config';

// Assets
import LeasePNG from '@assets/images/lease.png';
import PurchasePNG from '@assets/images/purchase.png';
import TransferPNG from '@assets/images/need-to-buy.png';

// Interfaces
import type {
	HomeMenu,
	IProjectCompact,
	IPostCompact,
	IBottomTabRouters,
	INewsCompact,
	ISort,
	IFilter,
} from '@interfaces';

const listID = [
	'63dc8046fc13ae47f20000c8',
	'63dc8046fc13ae47f20000c9',
	'63dc8046fc13ae47f20000ca',
	'63dc8046fc13ae47f20000cb',
	'63dc8046fc13ae47f20000cc',
	'63dc8046fc13ae47f20000cd',
	'63dc8046fc13ae47f20000ce',
	'63dc8046fc13ae47f20000cf',
	'63dc8046fc13ae47f20000d0',
	'63dc8046fc13ae47f20000d1',
];

const postCompactDefault: IPostCompact = {
	id: '',
	acreages: 0,
	address: '',
	category: 'apartment',
	direction: 'east',
	image: '',
	isVideo: false,
	legal: 'book',
	postID: 0,
	prices: 0,
	title: '',
};
const newsCompactDefault: INewsCompact = {
	createdAt: 0,
	id: '',
	thumbnail:
		'https://claimether.com/_next/image?url=%2Fimages%2Flogo.webp&w=96&q=75',
	title: '',
};
const projectCompactDefault: IProjectCompact = {
	acreages: '',
	address: '',
	company: '',
	prices: null,
	image: '',
	projectID: 0,
	status: 'openingSoon',
	title: '',
	type: 'apartment',
	id: '',
};

// ENV
export const GoogleApiKey = Config.GOOGLE_API_KEY as string;
export const host = Config.API_URI as string;
export const LimitFailed = parseInt(Config.LIMIT_FAILED as string, 10);
export const LimitRenew = parseInt(Config.LIMIT_RENEW as string, 10);
export const NumberRepeatUpdate = parseInt(
	Config.NUMBER_REPEAT_UPDATE as string,
	10,
);
export const LinkDefault = Config.LINK_DEFAULT as string;
export const WebsiteNameDefault = Config.WEBSITE_NAME_DEFAULT as string;

export const HomeMenus: HomeMenu[] = [
	{
		icon: LeasePNG,
		content: 'Mua bán',
		type: 'sell',
	},
	{
		icon: PurchasePNG,
		content: 'Cho thuê',
		type: 'rent',
	},
	{
		icon: TransferPNG,
		content: 'Cần Mua',
		type: 'request',
	},
];
export const BottomTabRouters: IBottomTabRouters = {
	Home: {
		title: 'Trang chủ',
		selected: 'home',
		default: 'home-outline',
	},
	News: {
		title: 'Tin tức',
		selected: 'newspaper-variant',
		default: 'newspaper-variant-outline',
	},
	Form: {
		title: 'Đăng tin',
		selected: 'post',
		default: 'post-outline',
	},
	Zoning: {
		title: 'Quy hoạch',
		selected: 'ballot',
		default: 'ballot-outline',
	},
	Account: {
		title: 'Tài khoản',
		selected: 'account-circle',
		default: 'account-circle-outline',
	},
};
export const Sorts: ISort[] = [
	{
		value: 'normally',
		name: 'Thông thường',
	},
	{
		value: 'latest',
		name: 'Tin đăng mới nhất',
	},
	{
		value: 'oldest',
		name: 'Tin đăng cũ nhất',
	},
	{
		value: 'priceAsc',
		name: 'Giá tăng dần',
	},
	{
		value: 'priceDesc',
		name: 'Giá giảm dần',
	},
	{
		value: 'acreageAsc',
		name: 'Diện tích tăng dần',
	},
	{
		value: 'acreageDesc',
		name: 'Diện tích giảm dần',
	},
];
export const FilterAcreages: IFilter[] = [
	{
		id: '2a069bc9-8db1-42ae-8bd7-017c8a6ee422',
		min: 0,
		max: 20,
	},
	{
		id: 'bce597b9-7122-4c42-92ba-d931d41f3986',
		min: 20,
		max: 30,
	},
	{
		id: '2690123f-a544-4ce0-9be2-5120b7002297',
		min: 30,
		max: 40,
	},
	{
		id: 'eb6bb2fc-c1b7-459c-bb5f-3f062e9ccdf8',
		min: 40,
		max: 50,
	},
	{
		id: '2d4fa709-b824-47d4-b391-c33d3ccfa287',
		min: 50,
		max: 60,
	},
	{
		id: 'd365603c-f8d5-4e34-b009-4df79c9a4511',
		min: 60,
		max: 80,
	},
	{
		id: 'a9e95e64-d099-41f4-ba05-0e5b42075d45',
		min: 80,
		max: 100,
	},
	{
		id: 'b4a9d9bb-d156-4716-858e-268a878974c7',
		min: 100,
		max: 130,
	},
	{
		id: 'eb267284-3e9d-4b95-b682-39e5180877b1',
		min: 130,
		max: 160,
	},
	{
		id: '4b3427f5-e3ac-4ba7-9b5f-0e012014cf31',
		min: 160,
		max: 200,
	},
	{
		id: '73b5552f-b115-49c5-a6bf-8940e41df7c5',
		min: 200,
		max: 250,
	},
	{
		id: '6370b216-5399-49b4-baee-91f2823385cc',
		min: 300,
		max: 400,
	},
	{
		id: 'f6ebfa57-99b3-4a0c-8a6e-418295d0ca16',
		min: 400,
		max: 500,
	},
	{
		id: 'a68f3629-9efc-4558-bfec-543c0287d52c',
		min: 500,
		max: 700,
	},
	{
		id: 'ecf45cca-276c-4bad-b02a-1bb46170dca1',
		min: 700,
		max: 1000,
	},
	{
		id: 'd38b82cf-e234-4204-8c3c-2d954fe21f56',
		min: 1000,
		max: 1500,
	},
	{
		id: '116634e0-eada-49ad-99d8-212a92c78a27',
		min: 1500,
		max: 2000,
	},
	{
		id: 'edbf87e5-03d0-44a4-9231-d751d7c57f47',
		min: 2000,
		max: 3000,
	},
	{
		id: '11e38a87-44a1-4b3b-82d7-203260a34c22',
		min: 3000,
		max: 5000,
	},
	{
		id: '5ff6eb41-a5e5-422f-b15c-706c786d4d8f',
		min: 5000,
		max: 7000,
	},
	{
		id: '5c02926e-5efe-4b0b-8017-ace0fa4e4bcc',
		min: 7000,
		max: 10000,
	},
	{
		id: 'd95fcbc5-0056-46fe-b1c0-b817f1df3be2',
		min: 10000,
		max: 20000,
	},
	{
		id: 'de855959-37b0-43ca-b764-5668edc80420',
		min: 20000,
		max: 50000,
	},
	{
		id: 'ecceda31-6cb5-4c5e-ae2f-4d07ed6132a8',
		min: 50000,
		max: 100000,
	},
	{
		id: 'f6e1651a-fb2c-440a-8dad-9c816bc33902',
		min: 100000,
		max: 0,
	},
];
export const FilterPrices: IFilter[] = [
	{
		id: 'filter-prices-62afdd23fc13ae2e41000014',
		min: 0,
		max: 1,
	},
	{
		id: 'filter-prices-62afdd23fc13ae2e41000015',
		min: 1,
		max: 2,
	},
	{
		id: 'filter-prices-62afdd23fc13ae2e41000016',
		min: 2,
		max: 3,
	},
	{
		id: 'filter-prices-62afdd23fc13ae2e41000017',
		min: 4,
		max: 5,
	},
	{
		id: 'filter-prices-62afdd23fc13ae2e41000018',
		min: 6,
		max: 7,
	},
	{
		id: 'filter-prices-62afdd23fc13ae2e41000019',
		min: 7,
		max: 8,
	},
	{
		id: 'filter-prices-62afdd23fc13ae2e4100001a',
		min: 8,
		max: 9,
	},
	{
		id: 'filter-prices-62afdd23fc13ae2e4100001b',
		min: 9,
		max: 10,
	},
	{
		id: 'filter-prices-62afdd23fc13ae2e4100001c',
		min: 10,
		max: 12,
	},
	{
		id: 'filter-prices-62afdd23fc13ae2e4100001d',
		min: 12,
		max: 14,
	},
	{
		id: 'filter-prices-62afdd23fc13ae2e4100001e',
		min: 14,
		max: 16,
	},
	{
		id: 'filter-prices-62afdd23fc13ae2e4100001f',
		min: 16,
		max: 18,
	},
	{
		id: 'filter-prices-62afdd23fc13ae2e41000020',
		min: 18,
		max: 20,
	},
	{
		id: 'filter-prices-62afdd23fc13ae2e41000021',
		min: 20,
		max: 25,
	},
	{
		id: 'filter-prices-62afdd23fc13ae2e41000022',
		min: 25,
		max: 30,
	},
	{
		id: 'filter-prices-62afdd23fc13ae2e41000023',
		min: 30,
		max: 35,
	},
	{
		id: 'filter-prices-62afdd23fc13ae2e41000024',
		min: 35,
		max: 40,
	},
	{
		id: 'filter-prices-62afdd23fc13ae2e41000025',
		min: 40,
		max: 45,
	},
	{
		id: 'filter-prices-62afdd23fc13ae2e41000026',
		min: 45,
		max: 50,
	},
	{
		id: 'filter-prices-62afdd23fc13ae2e41000027',
		min: 60,
		max: 70,
	},
	{
		id: 'filter-prices-62afdd23fc13ae2e41000028',
		min: 70,
		max: 80,
	},
	{
		id: 'filter-prices-62afdd23fc13ae2e41000029',
		min: 80,
		max: 90,
	},
	{
		id: 'filter-prices-62afdd23fc13ae2e4100002a',
		min: 90,
		max: 100,
	},
	{
		id: 'filter-prices-62afdd23fc13ae2e4100002b',
		min: 100,
		max: 150,
	},
	{
		id: 'filter-prices-62afdd23fc13ae2e4100002c',
		min: 150,
		max: 200,
	},
	{
		id: 'filter-prices-62afdd23fc13ae2e4100002d',
		min: 200,
		max: 300,
	},
	{
		id: 'filter-prices-62afdd23fc13ae2e4100002e',
		min: 300,
		max: 400,
	},
	{
		id: 'filter-prices-62afdd23fc13ae2e4100002f',
		min: 400,
		max: 500,
	},
	{
		id: 'filter-prices-62afdd23fc13ae2e41000030',
		min: 500,
		max: 1000,
	},
	{
		id: 'filter-prices-62afdd23fc13ae2e41000031',
		min: 1000,
		max: 10000,
	},
];

export const ListProjectCompactDefault: IProjectCompact[] = Array.from(
	Array(10).keys(),
).map(key => ({
	...projectCompactDefault,
	id: `project-${listID[key]}`,
}));
export const ListPostCompactDefault: IPostCompact[] = Array.from(
	Array(10).keys(),
).map(key => ({
	...postCompactDefault,
	id: `posts-${Math.floor(Math.random())}-${listID[key]}-${Math.random()}`,
}));
export const ListNewsCompactDefault: INewsCompact[] = Array.from(
	Array(10).keys(),
).map(key => ({
	...newsCompactDefault,
	id: `news-${listID[key]}`,
}));
