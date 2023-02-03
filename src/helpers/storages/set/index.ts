import AsyncStorage from '@react-native-async-storage/async-storage';

// Function Type
type HelperStorageSet = (key: string, value: string) => Promise<boolean>;

const Index: HelperStorageSet = async (key, value) => {
	try {
		await AsyncStorage.setItem(key, value);

		return true;
	} catch (error) {
		return false;
	}
};

export default Index;
