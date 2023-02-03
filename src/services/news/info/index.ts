// Configs
import { host } from '@configs';

// Interfaces
import type { ResJSON, INewsInfo } from '@interfaces';

// Type
type Result = 'BadRequest' | 'UnauthorizedDevice' | INewsInfo | null;

// Function Type
type ServiceNewsInfo = (
	signal: AbortSignal,
	token: string,
	id: string,
) => Promise<Result>;

const Index: ServiceNewsInfo = async (signal, token, id) => {
	const uri = `${host}/api-gateway/app/news/${id}`;

	try {
		const response = await fetch(uri, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-banbds-device-token': token,
			},
			signal,
		});
		const result = (await response.json()) as ResJSON<INewsInfo>;

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
