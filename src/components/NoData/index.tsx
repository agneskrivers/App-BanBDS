import React, { FunctionComponent } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Box, Icon, Text } from 'native-base';

// Props
interface Props {
	message: string;
}

const Index: FunctionComponent<Props> = ({ message }) => (
	<Box flex={1} justifyContent="center" alignItems="center" opacity={0.5}>
		<Icon
			as={MaterialCommunityIcons}
			name="database-search-outline"
			size={20}
			mb={4}
		/>
		<Text
			fontSize={17}
			color="muted.600"
			mb={24}
			fontWeight="semibold"
			px={10}
			textAlign="center"
		>
			{message}
		</Text>
	</Box>
);

export default Index;
