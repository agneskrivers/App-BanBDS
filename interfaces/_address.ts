// Interfaces
interface AddressName {
	name: string;
}

// Types
type RegionCompact = Omit<IRegion, 'isActive'>;

// Export Types
export type IDistrictInfo = AddressName & { districtID: string };
export type IWardInfo = AddressName & { wardID: string };

// Export Interfaces
export interface IRegion {
	regionID: string;
	name: string;
	isActive: boolean;
	serial: number;
}
export interface IDistrict {
	regionID: string;
	districts: IDistrictInfo[];
}
export interface IWard {
	districtID: string;
	wards: IWardInfo[];
}
export interface IRegionCompact extends RegionCompact {
	id: string;
}
