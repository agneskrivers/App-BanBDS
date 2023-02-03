import React, { FunctionComponent, useState, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { Dimensions } from 'react-native';

// Components
import { LoadingComponent } from '@components';

// Helpers
import { storages } from '@helpers';

const Index: FunctionComponent = () => {
	// Constants
	const { width, height } = Dimensions.get('screen');

	// States
	const [isLoaded, setIsLoaded] = useState<boolean>(false);

	const [code, setCode] = useState<string>('');

	// Effects
	useEffect(() => {
		const getData = async () => {
			const data = await storages.get.str('remaps');

			if (data) {
				setCode(data);
			}

			setIsLoaded(true);
		};

		getData();
	}, []);

	if (!isLoaded) return <LoadingComponent />;

	return (
		<WebView
			style={{ width, height }}
			source={{ uri: 'https://remaps.vn/maps/my-maps' }}
			injectedJavaScript={code}
			geolocationEnabled={true}
			onMessage={e => {
				console.log(e);
			}}
		/>
	);
};

export default Index;
