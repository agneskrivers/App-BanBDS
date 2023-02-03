// Configs
import { host } from '@configs';

// Interfaces
import type { ResJSON, IRegionCompact, ILinkJSON } from '@interfaces';

// Interface
interface ResultData {
	remaps: string;
	regions: IRegionCompact[];
	link: ILinkJSON;
}

// Type
type Result = 'UnauthorizedDevice' | 'BadRequest' | ResultData | null;

// Function Type
type ServiceDeviceDaily = (
	signal: AbortSignal,
	token: string,
) => Promise<Result>;

const Index: ServiceDeviceDaily = async (signal, token) => {
	const uri = `${host}/api-gateway/app/device`;

	try {
		const response = await fetch(uri, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-banbds-device-token': token,
			},
			signal,
		});
		const result = (await response.json()) as ResJSON<ResultData>;

		if (result.status === 'Unauthorized') {
			if (result.message === 'device') return 'UnauthorizedDevice';
		}

		if (result.status === 'Not Process') {
			if (result.message === 'Bad Request') return 'BadRequest';
		}

		if (result.status !== 'Success') return null;

		return result.data;
	} catch (error) {
		return null;
	}
};

export default Index;
