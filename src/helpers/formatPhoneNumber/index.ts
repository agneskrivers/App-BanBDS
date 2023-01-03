// Function Type
type HelperFormatPhoneNumber = (phoneNumber: string) => string;

const Index: HelperFormatPhoneNumber = phoneNumber => {
	const strippedNumber = phoneNumber.replace(/\D/g, '');

	return `${strippedNumber.slice(0, 4)}.${strippedNumber.slice(
		4,
		7,
	)}.${strippedNumber.slice(7)}`;
};

export default Index;
