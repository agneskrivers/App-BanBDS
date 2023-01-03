import React, { FunctionComponent, useState, useEffect } from 'react';
import {
	ScrollView,
	Pressable,
	Image,
	Center,
	Text,
	HStack,
	Box,
	Icon,
} from 'native-base';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Assets
import LeasePNG from '@assets/images/lease.png';

// Components
import { HeaderComponent, ProjectComponent, PostComponent } from '@components';

// Configs
import {
	HomeMenus,
	ListProjectCompactDefault,
	ListPostCompactDefault,
} from '@configs';

// Interfaces
import type {
	IPostCompact,
	IProjectCompact,
	ICompositeNavigationBottomTabs,
} from '@interfaces';

// Props
interface Props {
	navigation: ICompositeNavigationBottomTabs<'Home'>;
}

const Index: FunctionComponent<Props> = ({ navigation }) => {
	// States
	const [isLoaded, setIsLoaded] = useState<boolean>(false);

	const [projects, setProjects] = useState<IProjectCompact[] | null>(null);
	const [posts, setPosts] = useState<IPostCompact[] | null>(null);
	const [totals, setTotals] = useState<number | null>(null);

	// Effect
	useEffect(() => {
		const getData = async () => {
			setTimeout(() => {
				setProjects(ListProjectCompactDefault);
				setPosts(ListPostCompactDefault);

				setTotals(1000);

				setIsLoaded(true);
			}, 2000);
		};

		getData();
	}, []);

	// Handles
	const handlePressProjects = () => navigation.navigate('Projects');
	const handlePressPosts = () => navigation.navigate('Posts');
	const handlePressProject = (projectID: number) =>
		navigation.navigate('Project', { projectID });
	const handlePressPost = () =>
		navigation.navigate('MyPost', {
			postID: 1111111,
		});

	return (
		<ScrollView
			showsHorizontalScrollIndicator={false}
			showsVerticalScrollIndicator={false}
			bg="white"
			scrollEventThrottle={16}
			flexGrow={1}
		>
			<HeaderComponent>
				<HStack
					justifyContent="space-evenly"
					px={2}
					py={3}
					borderRadius={8}
					shadow={9}
					mt={{ base: 0, lg: 12 }}
					bg="white"
					maxW="90%"
				>
					{HomeMenus.map((item, index) => (
						<Pressable key={index} flex={1}>
							<Center>
								<Image
									source={item.icon}
									size={12}
									alt={`BanBds Icon ${item.content}`}
									style={{ aspectRatio: 129 / 129 }}
								/>
								<Text mt={1} fontSize={13} fontWeight={600}>
									{item.content}
								</Text>
							</Center>
						</Pressable>
					))}
				</HStack>
			</HeaderComponent>
			<Box mt={7} px={4}>
				<Pressable mb={2} onPress={handlePressProjects}>
					<HStack justifyContent="space-between" alignItems="center">
						<HStack flex={1}>
							<Box>
								<Image
									source={LeasePNG}
									h={7}
									style={{ aspectRatio: 48 / 48 }}
									alt="BanBds Project"
								/>
							</Box>
							<Text ml={2} fontWeight="bold" fontSize="lg">
								Dự Án
							</Text>
						</HStack>
						<Icon
							as={MaterialCommunityIcons}
							name="arrow-right-bold-box"
							size={7}
							color="info.600"
						/>
					</HStack>
				</Pressable>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					p={0.5}
				>
					{[...(projects ? projects : ListProjectCompactDefault)].map(
						(item, index) => (
							<Pressable
								key={item.projectID}
								onPress={() =>
									handlePressProject(item.projectID)
								}
							>
								<ProjectComponent
									data={item}
									isLoaded={projects !== null && isLoaded}
									isFirst={index === 0}
									isLast={index === 9}
								/>
							</Pressable>
						),
					)}
				</ScrollView>
			</Box>
			<Box mt={7} px={4}>
				<Pressable mb={2} onPress={handlePressPosts}>
					<HStack justifyContent="space-between" alignItems="center">
						<HStack flex={1}>
							<Box>
								<Image
									source={LeasePNG}
									h={7}
									style={{ aspectRatio: 48 / 48 }}
									alt="BanBds Project"
								/>
							</Box>
							<HStack alignItems="center" ml={2}>
								<Text fontWeight="bold" fontSize="lg">
									BĐS cần bán
								</Text>
								{totals && totals > 0 && (
									<Text ml="2" fontSize="12">
										{`(${totals.toLocaleString()} tin đăng)`}
									</Text>
								)}
							</HStack>
						</HStack>
						<Icon
							as={MaterialCommunityIcons}
							name="arrow-right-bold-box"
							size={7}
							color="info.600"
						/>
					</HStack>
				</Pressable>
				{[...(posts ? posts : ListPostCompactDefault)].map(item => (
					<Pressable
						my={2}
						key={item.postID}
						onPress={handlePressPost}
					>
						<PostComponent
							data={item}
							isLoaded={
								posts !== null && isLoaded && totals !== null
							}
						/>
					</Pressable>
				))}
			</Box>
		</ScrollView>
	);
};

export default Index;
