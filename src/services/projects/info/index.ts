// Configs
import { host } from '@configs';

// Interfaces
import type { ResJSON, IProjectInfo } from '@interfaces';

// Type
type Result = 'UnauthorizedDevice' | 'BadRequest' | IProjectInfo | null;

// Function Type
type ServiceProjectInfo = (
	signal: AbortSignal,
	token: string,
	projectID: number,
) => Promise<Result>;

const Index: ServiceProjectInfo = async (signal, token, projectID) => {
	const uri = `${host}/api-gateway/app/projects/${projectID}`;

	try {
		const response = await fetch(uri, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-banbds-device-token': token,
			},
			signal,
		});
		const result = (await response.json()) as ResJSON<IProjectInfo>;

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
