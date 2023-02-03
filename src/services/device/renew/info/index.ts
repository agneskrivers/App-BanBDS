// Configs
import { host } from '@configs';

// Interfaces
import type { ResJSON, IDevice } from '@interfaces';

// Type
type Result = string | null;

// Function Type
type ServiceDeviceRenewByInfo = (
	signal: AbortSignal,
	body: IDevice,
) => Promise<Result>;

const Index: ServiceDeviceRenewByInfo = async (signal, body) => {
	const uri = `${host}/api-gateway/app/device`;

	try {
		const response = await fetch(uri, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
			signal,
		});
		const result = (await response.json()) as ResJSON<string>;

		if (result.status !== 'Success') return null;

		return result.data;
	} catch (error) {
		return null;
	}
};

export default Index;
