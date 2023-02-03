// Configs
import { host } from '@configs';

// Interfaces
import type { ResJSON, IWard } from '@interfaces';

// Type
type Result = 'UnauthorizedDevice' | 'BadRequest' | IWard[] | null;

// Function Type
type ServiceWards = (token: string) => Promise<Result>;

const Index: ServiceWards = async token => {
	const uri = `${host}/api-gateway/app/wards`;

	try {
		const response = await fetch(uri, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-banbds-device-token': token,
			},
		});
		const result = (await response.json()) as ResJSON<IWard[]>;

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
