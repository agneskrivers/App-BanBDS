// Configs
import { host } from '@configs';

// Interfaces
import type { ResJSON, INewsCompact, IHotNewsCompact } from '@interfaces';

// Interface
interface ResultData {
	hot: IHotNewsCompact | null;
	news: INewsCompact[];
	pages: number;
}

// Type
type Result = 'BadRequest' | 'UnauthorizedDevice' | ResultData | null;

// Function Type
type ServiceNewsShortlist = (
	signal: AbortSignal,
	token: string,
	region: string,
	page: number,
) => Promise<Result>;

const Index: ServiceNewsShortlist = async (signal, token, region, page) => {
	const uri = `${host}/api-gateway/app/news?page=${page}&region=${region}`;

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

		if (result.status === 'Not Process') return 'BadRequest';

		if (result.status !== 'Success') return null;

		return result.data;
	} catch (error) {
		return null;
	}
};

export default Index;
