// Type
type NewsCompact = Pick<News, 'title' | 'thumbnail'>;
type NewsInfo = Pick<News, 'title' | 'description' | 'content'>;

// Interface
interface News {
	title: string;
	description: string;
	content: string;
	thumbnail: string;
	images: string[];
	views: number;

	editor: string;
	creator: string;

	region: string;

	createdAt: Date;
	updatedAt: Date;
}

// Export Type
export type IHotNewsCompact = Omit<INewsCompact, 'createdAt'> &
	Pick<News, 'description'>;

// Export Interface
export interface INewsCompact extends NewsCompact {
	id: string;
	createdAt: number;
}
export interface INewsInfo extends NewsInfo {
	time: number;
}
