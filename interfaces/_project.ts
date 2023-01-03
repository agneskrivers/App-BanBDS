// Type
type ProjectCompactKey =
	| 'title'
	| 'prices'
	| 'status'
	| 'type'
	| 'acreages'
	| 'projectID';
type ProjectInfoKey =
	| 'acreages'
	| 'content'
	| 'overview'
	| 'prices'
	| 'status'
	| 'title'
	| 'images'
	| 'investor';

type ProjectCompact = Pick<Project, ProjectCompactKey>;
type ProjectInfo = Pick<Project, ProjectInfoKey>;

// Interface
interface ProjectPriceByValue {
	min: number;
	max: number;
}
interface ProjectInvestor {
	name: string;
	avatar: string | null;
}
interface ProjectOverview {
	numberOfApartments: number;
	courtNumber: number;
	legal: string;
}
interface ProjectLocationCoordinate {
	latitude: number;
	longitude: number;
}
interface Project {
	projectID: number;

	title: string;
	content: string;

	acreages: string;
	prices: number | ProjectPriceByValue | null;

	type: IProjectType;
	status: IProjectStatus;

	investor: ProjectInvestor | null;

	images: string[];
	overview: ProjectOverview | null;
}

// Export Types
export type IProjectType = 'apartment' | 'land';
export type IProjectStatus = 'onSale' | 'openingSoon' | 'handedOver';

// Export Interfaces
export interface IProjectCompact extends ProjectCompact {
	image: string;
	company: string | null;
	address: string;
}
export interface IProjectInfo extends ProjectInfo {
	address: string;
	coordinate: ProjectLocationCoordinate;
	link: string;
}
