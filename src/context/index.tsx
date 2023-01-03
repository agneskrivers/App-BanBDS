import React, {
	createContext,
	FunctionComponent,
	useEffect,
	useState,
} from 'react';
import { Alert, VStack, HStack, useToast, Text } from 'native-base';
import { useNetInfo } from '@react-native-community/netinfo';

// Type
type AlertStatus = 'info' | 'error' | 'warning';

// Interface
interface ContextInterface {
	isNetwork: boolean;

	onNotification(
		id: string,
		message: string,
		title?: string,
		status?: AlertStatus,
	): void;
}

// Props
interface Props {
	children: React.ReactNode | React.ReactNode[];
}

// Context
const contextDefault: ContextInterface = {
	isNetwork: true,

	onNotification() {
		console.log('Notification');
	},
};

export const Context = createContext<ContextInterface>(contextDefault);

const Index: FunctionComponent<Props> = ({ children }) => {
	// States
	const [isNetwork, setIsNetwork] = useState<boolean>(true);

	// Hooks
	const toast = useToast();
	const netInfo = useNetInfo();

	// Effect
	useEffect(() => {
		const id = 'toast-check-network';

		if (netInfo.isConnected !== null) {
			if (
				netInfo.type === 'none' ||
				netInfo.type === 'unknown' ||
				netInfo.type === 'bluetooth' ||
				netInfo.isInternetReachable === false
			) {
				if (!toast.isActive(id)) {
					toast.show({
						id,
						placement: 'bottom',
						render: () => (
							<Alert
								maxWidth="90%"
								alignSelf="center"
								flexDirection="row"
								status="warning"
								variant="subtle"
							>
								<VStack space={1} flexShrink={1} w="100%">
									<HStack
										space={2}
										flexShrink={1}
										alignItems="center"
									>
										<Alert.Icon />
										<Text
											px={4}
											color="coolGray.800"
											fontWeight={600}
										>
											Không có kết nối mạng!
										</Text>
									</HStack>
								</VStack>
							</Alert>
						),
					});
				}

				if (isNetwork === true) {
					setIsNetwork(false);
				}
			} else {
				if (toast.isActive(id)) {
					toast.close(id);
				}

				if (isNetwork === false) {
					setIsNetwork(true);
				}
			}
		}
	}, [netInfo, toast, isNetwork]);

	// Handle
	const handleNotification = (
		id: string,
		message: string,
		title?: string,
		status?: AlertStatus,
	) => {
		if (!toast.isActive(id)) {
			toast.show({
				id,
				placement: 'top',
				render: () => (
					<Alert
						maxWidth="90%"
						alignSelf="center"
						flexDirection="row"
						status={status ? status : 'success'}
						variant="subtle"
					>
						<VStack space={1} flexShrink={1} w="100%">
							{title && (
								<HStack
									space={2}
									flexShrink={1}
									alignItems="center"
								>
									<Alert.Icon />
									<Text
										fontSize="md"
										fontWeight="medium"
										flexShrink={1}
										color="solid"
									>
										{title}
									</Text>
								</HStack>
							)}
							{!title ? (
								<HStack
									space={2}
									flexShrink={1}
									alignItems="center"
								>
									<Alert.Icon />
									<Text
										px={4}
										color="coolGray.800"
										fontWeight={600}
									>
										{message}
									</Text>
								</HStack>
							) : (
								<Text
									px={6}
									color="coolGray.800"
									fontWeight={600}
								>
									{message}
								</Text>
							)}
						</VStack>
					</Alert>
				),
			});
		}
	};

	const value: ContextInterface = {
		isNetwork,
		onNotification: handleNotification,
	};

	return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default Index;
