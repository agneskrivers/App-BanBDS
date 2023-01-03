import React, {
	FunctionComponent,
	useState,
	useEffect,
	useContext,
} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
	Box,
	Icon,
	Pressable,
	Text,
	Button,
	Image,
	PresenceTransition,
	HStack,
	useToast,
	Spinner,
	Center,
} from 'native-base';
import { StatusBar } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import {
	CodeField,
	Cursor,
	useBlurOnFulfill,
	useClearByFocusCell,
} from 'react-native-confirmation-code-field';

// Styles
import Styles from './styles';

// Assets
import LogoDark from '@assets/images/logo-dark.png';

// Helpers
import { formatPhoneNumber, formatTime } from '@helpers';

// Interfaces
import type { ICompositeNavigationStacks, IStackParams } from '@interfaces';

// Props
interface Props {
	navigation: ICompositeNavigationStacks<'Login'>;
	route: RouteProp<IStackParams, 'Confirm'>;
}

const Index: FunctionComponent<Props> = ({ navigation, route }) => {
	// States
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isResend, setIsResend] = useState<boolean>(false);

	const [value, setValue] = useState<string>('');
	const [count, setCount] = useState<number>(59);

	const [failed, setFailed] = useState<number>(0);
	const [resend, setResend] = useState<number>(0);

	// Hooks
	const ref = useBlurOnFulfill({ value, cellCount: 4 });
	const [props, getCellOnLayoutHandler] = useClearByFocusCell({
		value,
		setValue,
	});

	// Effect
	useEffect(() => {
		if (ref && ref.current) {
			ref.current.focus();
		}
	}, [ref]);
	useEffect(() => {
		let id: number;

		if (count <= 0) return () => clearTimeout(id);

		id = setTimeout(() => setCount(preCount => preCount - 1), 1000);

		return () => clearTimeout(id);
	}, [count]);
	useEffect(() => {
		if (value.length === 4) {
			setIsLoading(true);
		}
	}, [value]);
	useEffect(() => {
		const getData = async () => {
			setTimeout(() => setIsLoading(false), 2000);
		};

		if (isLoading) {
			getData();
		}
	}, [isLoading]);

	// Handles
	const handlePressGoBack = () => {
		if (navigation.canGoBack()) {
			navigation.goBack();
		} else {
			navigation.push('Root', { screen: 'Home', params: undefined });
		}
	};

	return (
		<>
			<StatusBar barStyle="dark-content" />
			<Box flex={1} safeArea px={4} backgroundColor="white">
				<Box>
					<Pressable mb={5} onPress={handlePressGoBack}>
						<Icon
							as={MaterialCommunityIcons}
							name="arrow-left"
							size={7}
							color="dark.400"
						/>
					</Pressable>
				</Box>
				<Box alignItems="center">
					<PresenceTransition
						visible
						initial={{
							opacity: 0,
							scale: 0,
						}}
						animate={{
							opacity: 1,
							scale: 1,
							transition: {
								duration: 250,
							},
						}}
					>
						<Image
							source={LogoDark}
							height={45}
							mb={10}
							alt="Logo"
							style={{ aspectRatio: 226 / 50 }}
						/>
					</PresenceTransition>
					<Text
						fontSize="xl"
						color="dark.200"
						fontWeight="bold"
						mb={2}
						mt={5}
					>
						Nhập mã xác nhận
					</Text>
					<Text
						fontSize="md"
						mb={8}
						color="dark.400"
						textAlign="center"
					>
						{`Mã xác minh vừa gửi vào số điện thoại ${formatPhoneNumber(
							route.params.phoneNumber,
						)} của bạn`}
					</Text>
					<CodeField
						ref={ref}
						{...props}
						value={value}
						onChangeText={setValue}
						cellCount={4}
						rootStyle={Styles.codeFieldRoot}
						keyboardType="number-pad"
						textContentType="oneTimeCode"
						renderCell={({ index, symbol, isFocused }) => (
							<Box
								onLayout={getCellOnLayoutHandler(index)}
								key={index}
								style={[
									Styles.cellRoot,
									isFocused && Styles.focusCell,
								]}
							>
								<Text style={Styles.cellText}>
									{symbol || (isFocused ? <Cursor /> : null)}
								</Text>
							</Box>
						)}
					/>
					<HStack mt={6} alignItems="center">
						<Text
							fontSize={15}
							fontWeight="medium"
							color="muted.600"
						>
							{count <= 0
								? 'Không nhận được mã?'
								: 'Gửi lại mã sau'}
						</Text>
						{count <= 0 ? (
							<Button
								variant="unstyled"
								p={0}
								_text={{
									color: 'info.600',
									fontWeight: 'semibold',
									fontSize: 16,
								}}
								ml={1}
							>
								Gửi lại mã
							</Button>
						) : (
							<Text
								color="info.600"
								fontWeight="semibold"
								fontSize={16}
							>{` 00:${formatTime(count)}`}</Text>
						)}
					</HStack>
				</Box>
			</Box>
			{isLoading && (
				<Center
					position="absolute"
					top={0}
					left={0}
					bgColor="#00000060"
					width="100%"
					height="100%"
					zIndex={2}
				>
					<Spinner size="lg" color="white" />
				</Center>
			)}
		</>
	);
};

export default Index;
