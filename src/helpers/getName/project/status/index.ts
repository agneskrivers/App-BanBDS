// Interfaces
import type { IProjectStatus } from '@interfaces';

// Function Type
type HelperGetNameProjectStatus = (status: IProjectStatus) => string;

const Index: HelperGetNameProjectStatus = status => {
	switch (status) {
		case 'handedOver':
			return 'Đã bàn giao';
		case 'onSale':
			return 'Đang mở bán';
		case 'openingSoon':
			return 'Sắp mở bán';
	}
};

export default Index;
