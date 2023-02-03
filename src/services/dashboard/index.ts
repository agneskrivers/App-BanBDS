// Configs
import { host } from '@configs';

// Interfaces
import type { ResJSON, IPostCompact, IProjectCompact } from '@interfaces';

// Interface
interface ResultData {
	posts: IPostCompact[];
	projects: IProjectCompact[];
	totals: number;
}

// Type
type Result = 'BadRequest' | 'UnauthorizedDevice' | ResultData | null;

// Function Type
type ServiceDashboard = (
	signal: AbortSignal,
	token: string,
	region: string,
) => Promise<Result>;

const Index: ServiceDashboard = async (signal, token, region) => {
	const uri = `${host}/api-gateway/app/dashboard?region=${region}`;

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
