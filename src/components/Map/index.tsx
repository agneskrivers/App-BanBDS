import React, { FunctionComponent } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { Modal } from 'native-base';
import { Dimensions } from 'react-native';

// Props
interface Props {
	isOpen: boolean;
	latitude: number;
	longitude: number;

	onClose(): void;
}

const Index: FunctionComponent<Props> = props => {
	// Constants
	const { width, height } = Dimensions.get('screen');

	// Props
	const { isOpen, latitude, longitude, onClose } = props;

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="xl">
			<Modal.Content>
				<Modal.Body p={0}>
					<MapView
						initialRegion={{
							latitude: latitude,
							longitude: longitude,
							latitudeDelta: 0.1,
							longitudeDelta: 0.1,
						}}
						style={{
							width: width * 0.9,
							height: height * 0.6,
						}}
					>
						<Marker
							coordinate={{
								latitude: latitude,
								longitude: longitude,
							}}
						/>
					</MapView>
				</Modal.Body>
			</Modal.Content>
		</Modal>
	);
};

export default Index;
