// Configs
import { host } from '@configs';

// Interfaces
import type { ResJSON, IMyPostInfo } from '@interfaces';

// Type
type Result =
	| 'BadRequest'
	| 'UnauthorizedDevice'
	| 'UnauthorizedUser'
	| IMyPostInfo
	| null;

// Function Type
type ServiceMyPostInfo = (
	signal: AbortSignal,
	device: string,
	user: string,
	postID: number,
) => Promise<Result>;

const Index: ServiceMyPostInfo = async (signal, device, user, postID) => {
	const uri = `${host}/api-gateway/app/posts/info/${postID}/my`;

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
		const result = (await response.json()) as ResJSON<IMyPostInfo>;

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
