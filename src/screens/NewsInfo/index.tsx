import React, {
	FunctionComponent,
	useState,
	useEffect,
	useContext,
} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import RenderHTML from 'react-native-render-html';
import { format } from 'date-fns';
import { Dimensions, StatusBar, Platform } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { Box, HStack, Text, Icon, ScrollView, Pressable } from 'native-base';

// Components
import { LoadingComponent } from '@components';

// Context
import { Context } from '@context';

// Helpers
import { storages, renewTokenDevice } from '@helpers';

// Services
import services from '@services';

// Interfaces
import type {
	INewsInfo,
	ICompositeNavigationStacks,
	IStackParams,
} from '@interfaces';

// Props
interface Props {
	navigation: ICompositeNavigationStacks<'NewsInfo'>;
	route: RouteProp<IStackParams, 'NewsInfo'>;
}

const Index: FunctionComponent<Props> = ({ navigation, route }) => {
	// Constants
	const { width: screenWidth } = Dimensions.get('screen');

	// States
	const [data, setData] = useState<INewsInfo | null>(null);

	// Hooks
	const { isNetwork, onNotification } = useContext(Context);

	// Effects
	useEffect(() => {
		const controllers = new AbortController();

		const getData = async (
			signal: AbortSignal,
			tokenDevice?: string,
		): Promise<void> => {
			let token: string | null | undefined = tokenDevice;

			if (!token) {
				token = await storages.get.str('device');
			}

			if (!token) {
				token = await renewTokenDevice(signal);
			}

			if (!token) throw new Error();

			const result = await services.news.info(
				signal,
				token,
				route.params.id,
			);

			if (!result) throw new Error();

			if (result === 'BadRequest') {
				onNotification(
					'toast-screen-news-info-bad-request',
					'Lỗi tải tin',
					undefined,
					'warning',
				);

				setTimeout(() => navigation.navigate('News'), 1000);

				return;
			}

			if (result === 'UnauthorizedDevice') {
				if (tokenDevice) throw new Error();

				const renewToken = await renewTokenDevice(signal);

				if (!renewToken) {
					onNotification(
						'toast-screen-news-info-no-result',
						'Máy chủ bị lỗi',
						'Vui lòng thử lại sau',
						'error',
					);

					navigation.navigate('News');

					return;
				}

				return getData(signal, renewToken);
			}

			setData(result);
		};

		if (isNetwork) {
			getData(controllers.signal).catch(() => {
				onNotification(
					'toast-screen-news-info-error',
					'Máy chủ bị lỗi',
					'Vui lòng thử lại sau!',
					'error',
				);

				navigation.navigate('News');

				return;
			});
		} else {
			onNotification(
				'toast-screen-news-info-no-network',
				'Không có mạng',
				'Vui lòng thử lại sau!',
				'error',
			);

			navigation.navigate('News');

			return;
		}

		return () => controllers.abort();
	}, [isNetwork, route, navigation, onNotification]);

	// Handle
	const handlePressGoBack = () => {
		if (navigation.canGoBack()) {
			navigation.goBack();
		} else {
			navigation.navigate('News');
		}
	};

	return (
		<>
			<StatusBar barStyle="dark-content" />
			<HStack
				pb={2}
				px={4}
				borderBottomColor={data !== null ? 'gray.300' : 'white'}
				borderBottomWidth={data !== null ? 1 : 0}
				safeAreaTop
				alignItems="center"
				pt={Platform.OS === 'android' ? 2 : 0}
			>
				<Pressable onPress={handlePressGoBack}>
					<Icon
						as={MaterialCommunityIcons}
						name={data !== null ? 'arrow-left' : 'close'}
						size="lg"
						mr={2}
					/>
				</Pressable>
				{data && (
					<Text
						flex={1}
						fontSize={16}
						fontWeight="bold"
						color="dark.200"
					>
						{decodeURI(data.title)}
					</Text>
				)}
			</HStack>
			{data !== null ? (
				<ScrollView
					p={4}
					bg="white"
					showsHorizontalScrollIndicator={false}
					showsVerticalScrollIndicator={false}
					flexShrink={1}
				>
					<Box safeAreaBottom>
						<Text
							color="muted.400"
							fontSize={12}
							mb={2}
							textAlign="right"
						>
							{format(data.time, 'dd/MM/yyyy HH:mm')}
						</Text>
						<Text fontWeight="bold" mb={2}>
							{decodeURI(data.description)}
						</Text>
						<RenderHTML
							source={{
								html: decodeURI(data.content),
							}}
							contentWidth={screenWidth - 30}
						/>
					</Box>
				</ScrollView>
			) : (
				<LoadingComponent />
			)}
		</>
	);
};

export default Index;
