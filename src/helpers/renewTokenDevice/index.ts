import Device from 'react-native-device-info';

// Helpers
import { storages } from '@helpers';

// Services
import services from '@services';

// Interfaces
import type { IDevice } from '@interfaces';

// Function Type
type HelperRenewTokenDevice = (signal: AbortSignal) => Promise<string | null>;

const Index: HelperRenewTokenDevice = async signal => {
	try {
		const deviceID = await storages.get.str('deviceID');

		if (!deviceID) {
			const model = await Device.getModel();
			const device = await Device.getDeviceId();
			const nameOS = await Device.getSystemName();
			const versionOS = await Device.getSystemVersion();
			const buildID = await Device.getBuildId();
			const mac = await Device.getMacAddress();
			const brand = await Device.getBrand();
			const os = `${nameOS} - ${versionOS} - ${buildID}`;

			const body: IDevice = { brand, device, mac, model, os };

			const result = await services.device.renew.info(signal, body);

			if (!result) return null;

			return result;
		}

		const result = await services.device.renew.deviceID(signal, deviceID);

		if (!result) return null;

		return result;
	} catch (error) {
		return null;
	}
};

export default Index;
