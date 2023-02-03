// Configs
import { host } from '@configs';

// Interfaces
import type { ResJSON, IUserCreate } from '@interfaces';

// Type
type Result = 'BadRequest' | 'UnauthorizedDevice' | string | null;

// Function Type
type ServiceUserCreate = (
	signal: AbortSignal,
	token: string,
	body: IUserCreate,
) => Promise<Result>;

const Index: ServiceUserCreate = async (signal, token, body) => {
	const uri = `${host}/api-gateway/app/user`;

	try {
		const response = await fetch(uri, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-banbds-device-token': token,
			},
			body: JSON.stringify(body),
			signal,
		});
		const result = (await response.json()) as ResJSON<string>;

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
