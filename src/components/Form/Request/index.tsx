import React, { FunctionComponent, useState, useEffect, useRef } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
	Box,
	FormControl,
	Text,
	Select,
	HStack,
	Input,
	Center,
	Button,
	TextArea,
	WarningOutlineIcon,
	useToast,
	Icon,
} from 'native-base';

const Index: FunctionComponent = () => {
	return (
		<>
			<Box mb={4}>
				<FormControl isRequired mb={2}>
					<FormControl.Label>Mô tả</FormControl.Label>
					<TextArea
						h={24}
						autoCompleteType="off"
						placeholder="Bạn cần mua nhà hay đất yêu cầu như thế nào?"
						scrollEnabled={false}
					/>
				</FormControl>
				<FormControl isRequired mb={2}>
					<FormControl.Label>Vị trí</FormControl.Label>
					<Box>
						<Select
							flex={1}
							placeholder="Tỉnh/Thành Phố"
							h={10}
							dropdownIcon={
								<Icon
									as={MaterialCommunityIcons}
									name="chevron-down"
									size={6}
									mr={2}
								/>
							}
						>
							<Select.Item value="HN" label="Hà Nội" />
							<Select.Item value="HCM" label="Hồ Chí Minh" />
							<Select.Item value="BN" label="Bắc Ninh" />
						</Select>
						<HStack
							justifyContent="space-between"
							alignItems="center"
							mt={2}
						>
							<Select
								flex={1}
								placeholder="Quận/Huyện"
								h={10}
								mr={1}
								dropdownIcon={
									<Icon
										as={MaterialCommunityIcons}
										name="chevron-down"
										size={5}
										mr={2}
									/>
								}
							>
								<Select.Item value="HN" label="Hà Nội" />
								<Select.Item value="HCM" label="Hồ Chí Minh" />
								<Select.Item value="BN" label="Bắc Ninh" />
							</Select>
							<Select
								flex={1}
								placeholder="Phường/Xã"
								h={10}
								ml={1}
								dropdownIcon={
									<Icon
										as={MaterialCommunityIcons}
										name="chevron-down"
										size={5}
										mr={2}
									/>
								}
							>
								<Select.Item value="HN" label="Hà Nội" />
								<Select.Item value="HCM" label="Hồ Chí Minh" />
								<Select.Item value="BN" label="Bắc Ninh" />
							</Select>
						</HStack>
					</Box>
				</FormControl>
				<FormControl isRequired>
					<FormControl.Label>Khoảng giá</FormControl.Label>
					<HStack justifyContent="space-between" alignItems="center">
						<Box w="35%">
							<Input
								w="100%"
								placeholder="Từ"
								keyboardType="numeric"
								h={10}
							/>
						</Box>
						<Text mx={2}>~</Text>
						<Box w="35%">
							<Input
								w="100%"
								placeholder="Đến"
								keyboardType="numeric"
								h={10}
							/>
						</Box>
						<Box flex={1} ml={2}>
							<Select
								selectedValue="million"
								flex={1}
								dropdownIcon={
									<Icon
										as={MaterialCommunityIcons}
										name="chevron-down"
										size={3}
										mr={2}
									/>
								}
								h={10}
							>
								<Select.Item value="million" label="Triệu" />
								<Select.Item value="billion" label="Tỷ" />
							</Select>
						</Box>
					</HStack>
					<FormControl.ErrorMessage
						leftIcon={<WarningOutlineIcon size="xs" />}
					>
						Phạm vi giá thấp không thể lớn hơn phạm vi giá cao
					</FormControl.ErrorMessage>
				</FormControl>
			</Box>
			<Center>
				<Button
					size="lg"
					px="16"
					colorScheme="blue"
					isLoadingText="Đang tạo yêu cầu"
					_text={{ fontWeight: 'semibold' }}
				>
					Yêu Cầu
				</Button>
			</Center>
		</>
	);
};

export default Index;
