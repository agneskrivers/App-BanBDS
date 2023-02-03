// Interface
interface UserInfoCount {
	pending: number;
	accept: number;
}

// Export Types
export type IUserUpdate = Partial<Omit<IUserCreate, 'phoneNumber'>>;

// Export Interfaces
export interface IUserCreate {
	avatar: string | null;
	fullName: string;
	phoneNumber: string;
	address: string;
	birthday: number;
}
export interface IUserInfo extends IUserCreate {
	posts: UserInfoCount;
}
