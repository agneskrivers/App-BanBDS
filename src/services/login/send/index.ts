// Configs
import { host } from '@configs';

// Interfaces
import type { ResJSON } from '@interfaces';

// Type
type Result =
	| 'BadRequest'
	| 'Failed'
	| 'Renew'
	| 'UnauthorizedDevice'
	| boolean;

// Function Type
type ServiceLoginSend = (
	signal: AbortSignal,
	token: string,
	phoneNumber: string,
) => Promise<Result>;

const Index: ServiceLoginSend = async (signal, token, phoneNumber) => {
	const uri = `${host}/api-gateway/app/login/${phoneNumber}`;

	try {
		const response = await fetch(uri, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-banbds-device-token': token,
			},
			signal,
		});
		const result = (await response.json()) as ResJSON;

		if (result.status === 'Unauthorized') {
			if (result.message === 'device') return 'UnauthorizedDevice';
		}

		if (result.status === 'Not Process') {
			if (result.message === 'Failed') return 'Failed';

			if (result.message === 'Renew') return 'Renew';

			return 'BadRequest';
		}

		if (result.status !== 'Success') return false;

		return true;
	} catch (error) {
		return false;
	}
};

export default Index;
