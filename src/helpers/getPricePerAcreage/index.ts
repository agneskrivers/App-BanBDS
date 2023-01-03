// Function Type
type FormatNumber = (num: number) => number;
type HelperGetPricePerAcreage = (acreages: number, prices: number) => string;

const formatNumber: FormatNumber = num => Math.floor(num * 100) / 100;

const Index: HelperGetPricePerAcreage = (acreages, prices) => {
	const result = prices / acreages;

	const unit = result >= 1000 ? 'Tỷ/m²' : result < 1 ? 'Ngàn/m²' : 'Triệu/m²';
	const value =
		result >= 1000 ? result / 1000 : result < 1 ? result * 1000 : result;

	return `${formatNumber(value)} ${unit}`;
};

export default Index;
