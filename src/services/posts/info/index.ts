// Configs
import { host } from '@configs';

// Interfaces
import type { ResJSON, IPostInfo } from '@interfaces';

// Type
type Result = 'BadRequest' | 'UnauthorizedDevice' | IPostInfo | null;

// Function Type
type ServicePostInfo = (
	signal: AbortSignal,
	token: string,
	postID: number,
) => Promise<Result>;

const Index: ServicePostInfo = async (signal, token, postID) => {
	const uri = `${host}/api-gateway/app/posts/info/${postID}`;

	try {
		const response = await fetch(uri, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-banbds-device-token': token,
			},
			signal,
		});
		const result = (await response.json()) as ResJSON<IPostInfo>;

		if (result.status === 'Unauthorized') {
			if (result.message === 'device') return 'UnauthorizedDevice';
		}

		if (result.status === 'Not Process') return 'BadRequest';

		if (result.status !== 'Success') return null;

		return result.data;
	} catch (error) {
		return null;
	}
};

export default Index;
