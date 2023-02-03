import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { StackNavigationProp } from '@react-navigation/stack';

// Interfaces
import type { IMyPostInfo, IPostType, IPostStatus } from './_post';
import type { IUserCreate } from './_user';

// Address
export * from './_address';

// News
export * from './_news';

// Post
export * from './_post';

// Project
export * from './_project';

// User
export * from './_user';

// Type
type MenuHomeType = 'sell' | 'rent' | 'request';
type SubNavigationBottomTab<T extends keyof IBottomTabParams> = {
	screen: T;
	params: IBottomTabParams[T];
};
type SortValue =
	| 'normally'
	| 'latest'
	| 'oldest'
	| 'priceAsc'
	| 'priceDesc'
	| 'acreageAsc'
	| 'acreageDesc';
type ResultStatusSuccess<T = null> = T extends null
	? ResultStatusSuccessNoData
	: ResultStatusSuccessData<T>;
type LinkKey = 'HomePage' | 'Contact' | 'Guide' | 'Rules' | 'WebsiteName';

// Interface
interface BottomTabValue {
	title: string;
	selected: string;
	default: string;
}
interface EditPostData extends IMyPostInfo {
	postID: number;
}
interface ResultStatusError {
	status: 'Error';
	error: string;
}
interface ResultStatusMessage {
	status: 'Not Process' | 'Unauthorized';
	message: string;
}
interface ResultStatusSuccessNoData {
	status: 'Success';
}
interface ResultStatusSuccessData<T> extends ResultStatusSuccessNoData {
	data: T;
}
interface ResultStatusImage {
	status: 'ImageFormat' | 'ImageToBig';
}

// Export Types
export type ILinkJSON = Record<LinkKey, string | null>;
export type IBottomTabNames = 'Home' | 'News' | 'Zoning' | 'Account';
export type IBottomTabRouters = Record<
	IBottomTabNames | 'Form',
	BottomTabValue
>;
export type IBottomTabParams = {
	Home: undefined;
	News: undefined;
	Zoning: undefined;
	Account: undefined;
	Projects: undefined;
};
export type IStackParams = {
	Root: SubNavigationBottomTab<keyof IBottomTabParams>;
	Login: undefined;
	Confirm: { phoneNumber: string };
	User: { phoneNumber: string };
	Posts: {
		type: IPostType;
	};
	MyPosts: {
		status: Exclude<IPostStatus, 'sold'>;
	};
	EditPost: {
		data: EditPostData;
	};
	Profile: {
		data: IUserCreate;
	};
	Post: {
		postID: number;
	};
	MyPost: {
		postID: number;
	};
	Form: {
		type: IPostType | 'request';
	};
	Project: {
		projectID: number;
	};
	NewsInfo: {
		id: string;
	};
};
export type ICompositeNavigationBottomTabs<T extends keyof IBottomTabParams> =
	CompositeNavigationProp<
		BottomTabNavigationProp<IBottomTabParams, T>,
		StackNavigationProp<IStackParams>
	>;
export type ICompositeNavigationStacks<T extends keyof IStackParams> =
	CompositeNavigationProp<
		BottomTabNavigationProp<IBottomTabParams>,
		StackNavigationProp<IStackParams, T>
	>;
export type ResJSON<T = null> =
	| ResultStatusSuccess<T>
	| ResultStatusError
	| ResultStatusMessage;
export type ResUploadImageJSON = ResJSON<string> | ResultStatusImage;

// Export Interfaces
export interface HomeMenu {
	icon: any;
	content: string;
	type: MenuHomeType;
}
export interface ISort {
	name: string;
	value: SortValue;
}
export interface IFilter {
	id: string;
	min: number;
	max: number;
}
export interface IDevice {
	brand: string | null;
	model: string | null;
	device: string | null;
	os: string; // name - version - buildID;
	mac: string;
}
export interface IRequest {
	content: string;
	min: number;
	max: number;
	region: string;
	district: string;
	ward: string;
}
export interface IVersion {
	appStore: string;
	playStore: string;
}
export interface IImage {
	name: string;
	width: number;
	height: number;
	isTemp: boolean;
}
