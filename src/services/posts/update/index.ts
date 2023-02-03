// Configs
import { host } from '@configs';

// Interfaces
import type { ResJSON, IPostUpdate } from '@interfaces';

// Interface
interface ResultData {
	create: string[];
	remove: string[];
}

// Type
type Result =
	| 'UnauthorizedDevice'
	| 'UnauthorizedUser'
	| 'BadRequest'
	| ResultData
	| null;

// Function Type
type ServicePostUpdate = (
	signal: AbortSignal,
	device: string,
	user: string,
	postID: number,
	body: IPostUpdate,
) => Promise<Result>;

const Index: ServicePostUpdate = async (signal, device, user, postID, body) => {
	const uri = `${host}/api-gateway/posts/${postID}`;

	try {
		const response = await fetch(uri, {
			method: 'PUT',
			headers: {
				Authorization: user,
				'Content-Type': 'application/json',
				'x-banbds-device-token': device,
			},
			body: JSON.stringify(body),
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
