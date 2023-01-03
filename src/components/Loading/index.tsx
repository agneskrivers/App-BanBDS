import React, { FunctionComponent } from 'react';
import { Center, Spinner } from 'native-base';

// Props
interface Props {
	isWhite?: boolean;
}

const Index: FunctionComponent<Props> = ({ isWhite }) => (
	<Center flex={1}>
		<Spinner size="lg" color={isWhite ? 'white' : undefined} />
	</Center>
);

export default Index;
