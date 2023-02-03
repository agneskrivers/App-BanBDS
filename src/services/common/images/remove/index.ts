// Configs
import { host } from '@configs';

// Interfaces
import type { ResJSON } from '@interfaces';

// Function Type
type ServiceCommonImageRemove = (
	signal: AbortSignal,
	fileName: string,
) => Promise<boolean>;

const Index: ServiceCommonImageRemove = async (signal, fileName) => {
	const uri = `${host}/api-gateway/common/images`;

	try {
		const response = await fetch(uri, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ fileName }),
			signal,
		});
		const result = (await response.json()) as ResJSON;

		if (result.status !== 'Success') return false;

		return true;
	} catch (error) {
		return false;
	}
};

export default Index;
