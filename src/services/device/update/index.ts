// Configs
import { host } from '@configs';

// Interfaces
import type { ResJSON, IDevice } from '@interfaces';

// Type
type Result = 'UnauthorizedDevice' | 'BadRequest' | boolean;

// Function Type
type ServiceDeviceUpdate = (
	token: string,
	body: Partial<IDevice>,
) => Promise<Result>;

const Index: ServiceDeviceUpdate = async (token, body) => {
	const uri = `${host}/api-gateway/app/device`;

	try {
		const response = await fetch(uri, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'x-banbds-device-token': token,
			},
			body: JSON.stringify(body),
		});
		const result = (await response.json()) as ResJSON;

		if (result.status === 'Unauthorized') {
			if (result.message === 'device') return 'UnauthorizedDevice';
		}

		if (result.status === 'Not Process') {
			if (result.message === 'Bad Request') return 'BadRequest';
		}

		if (result.status !== 'Success') return false;

		return true;
	} catch (error) {
		return false;
	}
};

export default Index;
