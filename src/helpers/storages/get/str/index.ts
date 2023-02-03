import AsyncStorage from '@react-native-async-storage/async-storage';

// Function Type
type HelperStorageGet = (key: string) => Promise<string | null>;

const Index: HelperStorageGet = async key => {
	try {
		const value = await AsyncStorage.getItem(key);

		if (!value) return null;

		return value;
	} catch (error) {
		return null;
	}
};

export default Index;
