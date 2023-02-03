// Configs
import { host } from '@configs';

// Interfaces
import type { ResJSON, IDistrict } from '@interfaces';

// Type
type Result = 'UnauthorizedDevice' | 'BadRequest' | IDistrict[] | null;

// Function Type
type ServiceDistricts = (token: string) => Promise<Result>;

const Index: ServiceDistricts = async token => {
	const uri = `${host}/api-gateway/app/districts`;

	try {
		const response = await fetch(uri, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-banbds-device-token': token,
			},
		});
		const result = (await response.json()) as ResJSON<IDistrict[]>;

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
