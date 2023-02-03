// Configs
import { host } from '@configs';

// Interfaces
import type { ResJSON } from '@interfaces';

// Type
type Result =
	| 'UnauthorizedDevice'
	| 'BadRequest'
	| 'Mandatory'
	| 'Update'
	| boolean;

// Function Type
type ServiceVersionCheck = (device: string, version: string) => Promise<Result>;

const Index: ServiceVersionCheck = async (device, version) => {
	const uri = `${host}/api-gateway/app/version`;

	try {
		const response = await fetch(uri, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-banbds-device-token': device,
				'x-banbds-version': version,
			},
		});
		const result = (await response.json()) as ResJSON;

		if (result.status === 'Unauthorized') {
			if (result.message === 'device') return 'UnauthorizedDevice';
		}

		if (result.status === 'Not Process') {
			if (result.message === 'Bad Request') return 'BadRequest';

			if (result.message === 'Mandatory') return 'Mandatory';

			if (result.message === 'Update') return 'Update';
		}

		if (result.status !== 'Success') return false;

		return true;
	} catch (error) {
		return false;
	}
};

export default Index;
