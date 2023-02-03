// Configs
import { host } from '@configs';

// Interfaces
import type {
	ResJSON,
	IPostStatus,
	IPostType,
	IPostCompact,
} from '@interfaces';

// Interface
interface ResultData {
	posts: IPostCompact[];
	pages: number;
}

// Type
type Result =
	| 'UnauthorizedDevice'
	| 'UnauthorizedUser'
	| 'BadRequest'
	| null
	| ResultData;

// Function Type
type ServiceMyPostShortlist = (
	signal: AbortSignal,
	device: string,
	user: string,
	page: number,
	status: Exclude<IPostStatus, 'sold'>,
	type: IPostType,
) => Promise<Result>;

const Index: ServiceMyPostShortlist = async (
	signal,
	device,
	user,
	page,
	status,
	type,
) => {
	const uri = `${host}/api-gateway/app/posts/my?page=${page}&status=${status}&type=${type}`;

	try {
		const response = await fetch(uri, {
			method: 'GET',
			headers: {
				Authorization: user,
				'Content-Type': 'application/json',
				'x-banbds-device-token': device,
			},
			signal,
		});
		const result = (await response.json()) as ResJSON<ResultData>;

		if (result.status === 'Unauthorized') {
			if (result.message === 'device') return 'UnauthorizedDevice';

			if (result.message === 'Unauthorized') return 'UnauthorizedUser';
		}

		if (result.status === 'Not Process') return 'BadRequest';

		if (result.status !== 'Success') return null;

		return result.data;
	} catch (error) {
		return null;
	}
};

export default Index;
