// Configs
import { host } from '@configs';

// Interfaces
import type { ResJSON, IVersion } from '@interfaces';

// Type
type Result = 'UnauthorizedDevice' | IVersion | null;

// Function Type
type ServiceVersionLink = (device: string) => Promise<Result>;

const Index: ServiceVersionLink = async device => {
	const uri = `${host}/api-gateway/app/version/link`;

	try {
		const response = await fetch(uri, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-banbds-device-token': device,
			},
		});
		const result = (await response.json()) as ResJSON<IVersion>;

		if (result.status === 'Unauthorized') {
			if (result.message === 'device') return 'UnauthorizedDevice';
		}

		if (result.status !== 'Success') return null;

		return result.data;
	} catch (error) {
		return null;
	}
};

export default Index;
