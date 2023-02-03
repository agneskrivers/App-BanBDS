// Configs
import { host } from '@configs';

// Interfaces
import type {
	ResJSON,
	IPostCompact,
	IPostCategory,
	IPostSortValue,
	IPostType,
} from '@interfaces';

// Interface
interface ResultData {
	totals: number;
	pages: number;
	posts: IPostCompact[];
}

// Type
type Result = 'UnauthorizedDevice' | 'BadRequest' | ResultData | null;

// Function Type
type ServicePostShortlist = (
	signal: AbortSignal,
	token: string,
	type: IPostType,
	page: number,
	region?: string,
	district?: string,
	search?: string,
	category?: IPostCategory,
	pricesMin?: number,
	pricesMax?: number,
	acreagesMin?: number,
	acreagesMax?: number,
	prices?: IPostSortValue,
	acreages?: IPostSortValue,
	createdAt?: IPostSortValue,
) => Promise<Result>;

const Index: ServicePostShortlist = async (
	signal: AbortSignal,
	token,
	type,
	page,
	region,
	district,
	search,
	category,
	pricesMin,
	pricesMax,
	acreagesMin,
	acreagesMax,
	prices,
	acreages,
	createdAt,
) => {
	let uri = `${host}/api-gateway/app/posts?type=${type}&page=${page}`;

	if (region) {
		uri += `&region=${region}`;
	}

	if (district) {
		uri += `&district=${district}`;
	}

	if (search) {
		uri += `&search=${decodeURI(search)}`;
	}

	if (category) {
		uri += `&category=${category}`;
	}

	if (pricesMin && pricesMax) {
		uri += `&priceMin=${pricesMin}&priceMax=${pricesMax}`;
	}

	if (acreagesMin && acreagesMax) {
		uri += `&acreagesMin=${acreagesMin}&acreagesMax=${acreagesMax}`;
	}

	let sort: string | undefined;

	if (acreages) {
		sort = `&acreages=${acreages}`;
	}

	if (prices) {
		sort = `&prices=${prices}`;
	}

	if (createdAt) {
		sort = `&createdAt=${createdAt}`;
	}

	if (sort) {
		uri += sort;
	}

	try {
		const response = await fetch(uri, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-banbds-device-token': token,
			},
			signal,
		});
		const result = (await response.json()) as ResJSON<ResultData>;

		if (result.status === 'Unauthorized') {
			if (result.message === 'device') return 'UnauthorizedDevice';
		}

		if (result.status === 'Not Process') return 'BadRequest';

		if (result.status !== 'Success') return null;

		return result.data;
	} catch (error) {
		return null;
	}
};

export default Index;
