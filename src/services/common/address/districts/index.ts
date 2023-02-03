// Configs
import { host } from '@configs';

// Interfaces
import type { IDistrictInfo, ResJSON } from '@interfaces';

// Type
type Result = IDistrictInfo[] | 'BadRequest' | null;

// Function Type
type ServiceCommonAddressDistricts = (
	signal: AbortSignal,
	id: string,
) => Promise<Result>;

const Index: ServiceCommonAddressDistricts = async (signal, id) => {
	const uri = `${host}/api-gateway/common/districts?region=${id}`;

	try {
		const response = await fetch(uri, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			signal,
		});
		const result = (await response.json()) as ResJSON<IDistrictInfo[]>;

		if (result.status === 'Not Process') return 'BadRequest';

		if (result.status !== 'Success') return null;

		return result.data;
	} catch (error) {
		return null;
	}
};

export default Index;
