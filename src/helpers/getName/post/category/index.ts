// Interfaces
import type { IPostCategory } from '@interfaces';

// Function Type
type HelperGetNamePostCategory = (category: IPostCategory) => string;

const Index: HelperGetNamePostCategory = category => {
	switch (category) {
		case 'apartment':
			return 'Chung Cư';
		case 'house':
			return 'Nhà Riêng';
		case 'soil':
			return 'Đất Nền';
	}
};

export default Index;
