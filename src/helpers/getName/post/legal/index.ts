// Interfaces
import type { IPostLegal } from '@interfaces';

// Function Type
type HelperGetNamePostLegal = (legal: IPostLegal) => string;

const Index: HelperGetNamePostLegal = legal => {
	switch (legal) {
		case 'book':
			return 'Sổ đỏ/Sổ hồng';
		case 'saleContract':
			return 'Hợp đồng mua bán';
		case 'waitingForBook':
			return 'Đang chờ sổ';
	}
};

export default Index;
