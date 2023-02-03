// Configs
import { host } from '@configs';

// Interfaces
import type {
	ResJSON,
	IDevice,
	IRegionCompact,
	IDistrict,
	IWard,
	ILinkJSON,
} from '@interfaces';

// Interface
interface ResultData {
	deviceID: string;
	token: string;
	regions: IRegionCompact[];
	districts: IDistrict[];
	wards: IWard[];
	link: ILinkJSON;
	remaps: string;
}

// Type
type Result = ResultData | null;

// Function Type
type ServiceInit = (signal: AbortSignal, body: IDevice) => Promise<Result>;

const Index: ServiceInit = async (signal, body) => {
	const uri = `${host}/api-gateway/app/init`;

	try {
		const response = await fetch(uri, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
			signal,
		});
		const result = (await response.json()) as ResJSON<ResultData>;

		if (result.status !== 'Success') return null;

		return result.data;
	} catch (error) {
		return null;
	}
};

export default Index;
