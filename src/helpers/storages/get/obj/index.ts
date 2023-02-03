import AsyncStorage from '@react-native-async-storage/async-storage';

const Index = async <T>(key: string) => {
	try {
		const value = await AsyncStorage.getItem(key);

		if (!value) return null;

		const result = JSON.parse(value) as T;

		return result;
	} catch (error) {
		return null;
	}
};

export default Index;
