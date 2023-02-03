// Configs
import { GoogleApiKey } from '@configs';

// Interface
interface ResultAddressComponent {
	long_name: string;
	short_name: string;
	types: string[];
}
interface Results {
	address_components: ResultAddressComponent[];
}
interface Result {
	results: Results[];
	status: string;
}

// Function Type
type UtilGetProvince = (lat: number, lng: number) => Promise<string | null>;

const Index: UtilGetProvince = async (lat, lng) => {
	const uri = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GoogleApiKey}`;

	try {
		const response = await fetch(uri);
		const result = (await response.json()) as Result;

		if (result.status !== 'OK') return null;

		const address = result.results[0];

		const regions = address.address_components.find(
			item => item.types.indexOf('administrative_area_level_1') !== -1,
		);

		if (!regions) return null;

		return regions.long_name;
	} catch (error) {
		return null;
	}
};

export default Index;
