// Configs
import { host } from '@configs';

// Interfaces
import type { ResJSON, IProjectCompact } from '@interfaces';

// Interface
interface ResultData {
	hot: IProjectCompact | null;
	projects: IProjectCompact[];
	pages: number;
}

// Type
type Result = 'UnauthorizedDevice' | 'BadRequest' | ResultData | null;

// Function Type
type ServiceProjectShortlist = (
	signal: AbortSignal,
	token: string,
	page: number,
	region: string,
	id?: string,
) => Promise<Result>;

const Index: ServiceProjectShortlist = async (
	signal,
	token,
	page,
	region,
	id,
) => {
	let uri = `${host}/api-gateway/app/projects?page=${page}&region=${region}`;

	if (id) {
		uri += `&id=${id}`;
	}

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
