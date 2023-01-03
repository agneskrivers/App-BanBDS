import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { StackNavigationProp } from '@react-navigation/stack';

// Interfaces
import type { IMyPostInfo } from './_post';

// News
export * from './_news';

// Post
export * from './_post';

// Project
export * from './_project';

// Type
type MenuHomeType = 'sell' | 'rent' | 'needToBuy';
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

// Interface
interface BottomTabValue {
	title: string;
	selected: string;
	default: string;
}
interface EditPostData extends IMyPostInfo {
	postID: number;
}

// Export Types
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
	Posts: undefined;
	MyPosts: undefined;
	EditPost: {
		data: EditPostData;
	};
	Profile: undefined;
	Post: {
		postID: number;
	};
	MyPost: {
		postID: number;
	};
	Form: undefined;
	Project: {
		projectID: number;
	};
	NewsInfo: undefined;
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
