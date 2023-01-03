import { Image } from 'react-native';

// Interface
interface Result {
	width: number;
	height: number;
}

// Function Type
type UtilGetImageSize = (uri: string) => Promise<Result | null>;

const Index: UtilGetImageSize = uri =>
	new Promise(resolve => {
		Image.getSize(
			uri,
			(width, height) => resolve({ width, height }),
			() => resolve(null),
		);
	});

export default Index;
