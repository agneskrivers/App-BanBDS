import React, { FunctionComponent } from 'react';
import { Center, Image, Spinner } from 'native-base';

// Assets
import LogoDark from '@assets/images/logo-dark.png';

const Index: FunctionComponent = () => (
	<Center flex={1}>
		<Image
			source={LogoDark}
			alt="BanBds"
			style={{ aspectRatio: 663 / 150 }}
			h={60}
		/>
		<Spinner mt={6} size="lg" />
	</Center>
);

export default Index;
