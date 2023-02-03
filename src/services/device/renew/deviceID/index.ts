// Configs
import { host } from '@configs';

// Interfaces
import type { ResJSON } from '@interfaces';

// Type
type Result = string | null;

// Function Type
type ServiceDeviceRenewByDeviceID = (
	signal: AbortSignal,
	deviceID: string,
) => Promise<Result>;

const Index: ServiceDeviceRenewByDeviceID = async (signal, deviceID) => {
	const uri = `${host}/api-gateway/app/device/${deviceID}`;

	try {
		const response = await fetch(uri, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
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
