import AsyncStorage from '@react-native-async-storage/async-storage';

// Function Type
type HelperStorageRemove = (key: string) => Promise<boolean>;

const Index: HelperStorageRemove = async key => {
	try {
		await AsyncStorage.removeItem(key);

		return true;
	} catch (error) {
		return false;
	}
};

export default Index;
