import React, { FunctionComponent } from 'react';
import { Box, Center, Spinner } from 'native-base';

// Props
interface Props {
	isLoad: boolean;
}

const Index: FunctionComponent<Props> = ({ isLoad }) => {
	if (isLoad)
		return (
			<Center pb={4} background="white">
				<Spinner size="lg" />
			</Center>
		);

	return <Box pb={4} background="white" />;
};

export default Index;
