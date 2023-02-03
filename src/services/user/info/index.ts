// Configs
import { host } from '@configs';

// Interfaces
import type { ResJSON, IUserInfo } from '@interfaces';

// Type
type Result = 'UnauthorizedDevice' | 'UnauthorizedUser' | IUserInfo | null;

// Function Type
type ServiceUserInfo = (
	signal: AbortSignal,
	device: string,
	user: string,
) => Promise<Result>;

const Index: ServiceUserInfo = async (signal, device, user) => {
	const uri = `${host}/api-gateway/app/user`;

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
		const result = (await response.json()) as ResJSON<IUserInfo>;

		if (result.status === 'Unauthorized') {
			if (result.message === 'device') return 'UnauthorizedDevice';

			if (result.message === 'Unauthorized') return 'UnauthorizedUser';
		}

		if (result.status !== 'Success') return null;

		return result.data;
	} catch (error) {
		return null;
	}
};

export default Index;
