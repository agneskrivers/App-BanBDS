import React, { FunctionComponent } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { HStack, Box, Image, Select, Icon } from 'native-base';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

// Assets
import BgBorder from '@assets/images/bg-border.png';
import LogoLight from '@assets/images/logo-light.png';

// Props
interface Props {
	isDark?: boolean;

	children?: React.ReactNode;
}

const Index: FunctionComponent<Props> = ({ children, isDark }) => {
	// Hooks
	const insets = useSafeAreaInsets();

	return (
		<>
			<StatusBar
				animated={true}
				barStyle={isDark ? 'dark-content' : 'light-content'}
			/>
			<Image
				source={BgBorder}
				height={200}
				resizeMode="cover"
				alt="BanBds Background"
			/>
			<HStack
				mt={-200 + insets.top}
				px={4}
				py={2}
				mb={4}
				justifyContent="space-between"
				alignItems="center"
			>
				<Box flex={1}>
					<Image
						source={LogoLight}
						height={30}
						style={{ aspectRatio: 226 / 50 }}
						alt="BanBds Logo"
					/>
				</Box>
				<Select
					height={10}
					color="white"
					width={110}
					fontWeight="bold"
					overflow="hidden"
					dropdownIcon={
						<Icon
							as={MaterialCommunityIcons}
							name="chevron-down"
							color="white"
							size="md"
							mr={1}
						/>
					}
					defaultValue="HN"
				>
					<Select.Item value="HN" label="Hà Nội" />
					<Select.Item value="HCM" label="Hồ Chí Minh" />
					<Select.Item value="BN" label="Bắc Ninh" />
				</Select>
			</HStack>
			<Box justifyContent="center" alignItems="center">
				{children && children}
			</Box>
		</>
	);
};

export default Index;
