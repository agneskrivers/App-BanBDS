// Configs
import { host } from '@configs';

// Interfaces
import type { ResJSON } from '@interfaces';

// Interface
interface ResultDataCreated {
	isCreated: true;
	token: string;
}
interface ResultDataNotCreated {
	isCreated: false;
}

// Type
type ResultData = ResultDataCreated | ResultDataNotCreated;
type Result = 'BadRequest' | 'UnauthorizedDevice' | ResultData | null;

// Function Type
type ServiceLoginCheck = (
	signal: AbortSignal,
	token: string,
	phoneNumber: string,
	otp: string,
) => Promise<Result>;

const Index: ServiceLoginCheck = async (signal, token, phoneNumber, otp) => {
	const uri = `${host}/api-gateway/app/login/${phoneNumber}`;

	try {
		const response = await fetch(uri, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-banbds-device-token': token,
			},
			body: JSON.stringify({ otp }),
			signal,
		});
		const result = (await response.json()) as ResJSON<ResultData>;

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
