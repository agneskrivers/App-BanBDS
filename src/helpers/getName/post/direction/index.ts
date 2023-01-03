// Interfaces
import type { IPostDirection } from '@interfaces';

// Function Type
type HelperGetNamePostDirection = (direction: IPostDirection) => string;

const Index: HelperGetNamePostDirection = direction => {
	switch (direction) {
		case 'east':
			return 'Đông';
		case 'north':
			return 'Bắc';
		case 'south':
			return 'Nam';
		case 'west':
			return 'Tây';
		case 'northeast':
			return 'Đông Bắc';
		case 'northwest':
			return 'Tây Bắc';
		case 'southeast':
			return 'Đông Nam';
		case 'southwest':
			return 'Tây Nam';
	}
};

export default Index;
