// Configs
import { host } from '@configs';

// Interfaces
import type { IWardInfo, ResJSON } from '@interfaces';

// Type
type Result = IWardInfo[] | 'BadRequest' | null;

// Function Type
type ServiceCommonAddressWards = (
	signal: AbortSignal,
	id: string,
) => Promise<Result>;

const Index: ServiceCommonAddressWards = async (signal, id) => {
	const uri = `${host}/api-gateway/common/wards?district=${id}`;

	try {
		const response = await fetch(uri, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			signal,
		});
		const result = (await response.json()) as ResJSON<IWardInfo[]>;

		if (result.status === 'Not Process') return 'BadRequest';

		if (result.status !== 'Success') return null;

		return result.data;
	} catch (error) {
		return null;
	}
};

export default Index;
