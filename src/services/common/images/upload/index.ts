// Configs
import { host } from '@configs';

// Interfaces
import type { ResUploadImageJSON } from '@interfaces';

// Type
type Result =
	| 'Unauthorized'
	| 'NotFound'
	| 'ImageToBig'
	| 'ImageFormat'
	| 'BadRequest'
	| string
	| null;

// Function Type
type ServiceCommonImageUpload = (
	signal: AbortSignal,
	token: string,
	body: FormData,
) => Promise<Result>;

const Index: ServiceCommonImageUpload = async (signal, token, body) => {
	const uri = `${host}/api-gateway/common/images`;

	try {
		const response = await fetch(uri, {
			method: 'POST',
			headers: {
				'Content-Type': 'multipart/form-data',
				'x-banbds-device-token': token,
			},
			body,
			signal,
		});
		const result = (await response.json()) as ResUploadImageJSON;

		if (result.status === 'Unauthorized') return 'Unauthorized';

		if (result.status === 'Not Process') {
			if (result.message === 'NotFound') return 'NotFound';
		}

		if (result.status === 'ImageFormat') return 'ImageFormat';

		if (result.status === 'ImageToBig') return 'ImageToBig';

		if (result.status !== 'Success') return null;

		return result.data;
	} catch (error) {
		return null;
	}
};

export default Index;
