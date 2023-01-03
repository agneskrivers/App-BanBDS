import React, { FunctionComponent, useState } from 'react';
import { WebView } from 'react-native-webview';
import { Dimensions } from 'react-native';

const Index: FunctionComponent = () => {
	// Constants
	const { width, height } = Dimensions.get('screen');

	// States
	const [code] = useState<string>('');

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
