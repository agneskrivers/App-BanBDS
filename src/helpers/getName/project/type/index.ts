// Interfaces
import type { IProjectType } from '@interfaces';

// Function Type
type HelperGetNameProjectType = (type: IProjectType) => string;

const Index: HelperGetNameProjectType = type => {
	switch (type) {
		case 'apartment':
			return 'Chung cư';
		case 'land':
			return 'Đất nền';
	}
};

export default Index;
