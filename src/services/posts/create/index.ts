// Configs
import { host } from '@configs';

// Interfaces
import type { ResJSON, IPostCreate } from '@interfaces';

// Type
type Result =
	| 'UnauthorizedDevice'
	| 'UnauthorizedUser'
	| 'BadRequest'
	| boolean;

// Function Type
type ServicePostCreate = (
	signal: AbortSignal,
	device: string,
	user: string,
	body: IPostCreate,
) => Promise<Result>;

const Index: ServicePostCreate = async (signal, device, user, body) => {
	const uri = `${host}/api-gateway/app/posts`;

	try {
		const response = await fetch(uri, {
			method: 'POST',
			headers: {
				Authorization: user,
				'Content-Type': 'application/json',
				'x-banbds-device-token': device,
			},
			body: JSON.stringify(body),
			signal,
		});
		const result = (await response.json()) as ResJSON;

		if (result.status === 'Unauthorized') {
			if (result.message === 'device') return 'UnauthorizedDevice';

			if (result.message === 'Unauthorized') return 'UnauthorizedUser';
		}

		if (result.status === 'Not Process') return 'BadRequest';

		if (result.status !== 'Success') return false;

		return true;
	} catch (error) {
		return false;
	}
};

export default Index;
