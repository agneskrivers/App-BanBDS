import React, { FunctionComponent, useState, useEffect, useRef } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAvoidingView } from 'react-native';
import {
	Box,
	HStack,
	Text,
	FormControl,
	TextArea,
	Input,
	Select,
	Button,
	Center,
	useToast,
	Icon,
	ScrollView,
} from 'native-base';

// Components
import UploadComponent from '@components/Upload';

// Utils
import { getImageSize } from '@utils';

// Interfaces
import type {
	ICompositeNavigationStacks,
	IPostInfo,
	IPostType,
	IMyPostInfo,
} from '@interfaces';

// Interface
interface PropsEditData extends IMyPostInfo {
	postID: number;
}
interface PropsCreate {
	status: 'create';
	type: IPostType;
	fullName: string;
	phoneNumber: string;
}
interface PropsEdit {
	status: 'edit';
	data: PropsEditData;
	onSold(): void;
}

// Props
type Props = PropsCreate | PropsEdit;

const Index: FunctionComponent<Props> = props => {
	return (
		<>
			<Box mb={4}>
				<Text fontSize={18} fontWeight="bold" mb={2}>
					Thông tin cơ bản
				</Text>
				<FormControl isRequired mb={2}>
					<FormControl.Label>Loại bất động sản</FormControl.Label>
					<Select
						placeholder="VD: Chung Cư"
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
						<Select.Item value="apartment" label="Chung Cư" />
						<Select.Item value="house" label="Nhà Riêng" />
						<Select.Item value="soil" label="Đất Nền" />
					</Select>
				</FormControl>
				<FormControl isRequired>
					<FormControl.Label>Địa Chỉ </FormControl.Label>
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
			</Box>
			<Box mb={4}>
				<Text fontSize={18} fontWeight="bold" mb={2}>
					Thông tin bài viết
				</Text>
				<FormControl isRequired mb={2}>
					<FormControl.Label>Tiêu đề </FormControl.Label>
					<TextArea
						h={20}
						placeholder="VD: Bán nhà riêng 50m2 chính chủ tại Cầu Giấy"
						autoCompleteType="off"
						maxLength={100}
						scrollEnabled={false}
					/>
				</FormControl>
				<FormControl>
					<FormControl.Label>Mô tả</FormControl.Label>
					<TextArea
						h={56}
						autoCompleteType="off"
						placeholder="Nhập mô tả chung về bất động sản của bạn. Ví dụ: Khu nhà có vị trí thuận lợi, gần công viên, gần trường học ... "
						maxLength={3000}
						scrollEnabled={false}
					/>
				</FormControl>
			</Box>
			<Box mb={4}>
				<Text fontSize={18} fontWeight="bold" mb={2}>
					Thông tin bất động sản
				</Text>
				<FormControl isRequired mb={2}>
					<FormControl.Label>Diện tích </FormControl.Label>
					<Input
						keyboardType="numeric"
						h={10}
						rightElement={
							<Text mr={2} color="gray.600">
								m²
							</Text>
						}
					/>
				</FormControl>
				<FormControl isRequired mb={2}>
					<FormControl.Label>Mức giá </FormControl.Label>
					<HStack justifyContent="space-between" alignItems="center">
						<Input h={10} keyboardType="numeric" flex={2} mr={1} />
						<Select
							flex={1}
							ml={1}
							h={10}
							selectedValue="million"
							dropdownIcon={
								<Icon
									as={MaterialCommunityIcons}
									name="chevron-down"
									size={5}
									mr={2}
								/>
							}
						>
							<Select.Item value="million" label="Triệu" />
							<Select.Item value="billion" label="Tỷ" />
						</Select>
					</HStack>
				</FormControl>
				<HStack alignItems="center" justifyContent="space-between">
					<FormControl flex={1} mr={1}>
						<FormControl.Label>Giấy tờ pháp lý</FormControl.Label>
						<Select
							flex={1}
							placeholder="Chọn giấy tờ pháp lý"
							h={10}
							dropdownIcon={
								<Icon
									as={MaterialCommunityIcons}
									name="chevron-down"
									size={5}
									mr={2}
								/>
							}
						>
							<Select.Item value="book" label="Sổ đỏ/ Sổ hồng" />
							<Select.Item
								value="saleContract"
								label="Hợp đồng mua bán"
							/>
							<Select.Item
								value="waitingForBook"
								label="Đang chờ sổ"
							/>
						</Select>
					</FormControl>
					<FormControl flex={1} ml={1}>
						<FormControl.Label>Hướng nhà</FormControl.Label>
						<Select
							flex={1}
							placeholder="Chọn Hướng"
							h={10}
							dropdownIcon={
								<Icon
									as={MaterialCommunityIcons}
									name="chevron-down"
									size={5}
									mr={2}
								/>
							}
						>
							<Select.Item value="east" label="Đông" />
							<Select.Item value="west" label="Tây" />
							<Select.Item value="south" label="Nam" />
							<Select.Item value="north" label="Bắc" />
							<Select.Item value="northeast" label="Đông Bắc" />
							<Select.Item value="northwest" label="Tây Bắc" />
							<Select.Item value="southwest" label="Tây Nam" />
							<Select.Item value="southeast" label="Đông Nam" />
						</Select>
					</FormControl>
				</HStack>
				<HStack
					alignItems="center"
					justifyContent="space-between"
					mb={2}
				>
					<FormControl flex={1} mr={1}>
						<FormControl.Label>Đường vào</FormControl.Label>
						<Input
							flex={1}
							keyboardType="numeric"
							placeholder="Nhập số"
							h={10}
							rightElement={
								<Text mr={2} color="gray.600">
									m
								</Text>
							}
						/>
					</FormControl>
					<FormControl flex={1} ml={1}>
						<FormControl.Label>Mặt tiền</FormControl.Label>
						<Input
							flex={1}
							keyboardType="numeric"
							placeholder="Nhập số"
							h={10}
							rightElement={
								<Text mr={2} color="gray.600">
									m
								</Text>
							}
						/>
					</FormControl>
				</HStack>
			</Box>
			<Box mb={4}>
				<Text fontSize={18} fontWeight="bold" mb={2}>
					Thông tin liên hệ
				</Text>
				<FormControl isRequired mb={2}>
					<FormControl.Label>Tên liên hệ </FormControl.Label>
					<Input placeholder="Nhập tên" h={10} />
				</FormControl>
				<FormControl isRequired>
					<FormControl.Label>Số điện thoại </FormControl.Label>
					<Input placeholder="Nhập số điện thoại." h={10} />
					<FormControl.HelperText>
						Lưu ý: Mỗi số cách nhau dấu phẩy
					</FormControl.HelperText>
				</FormControl>
			</Box>
			<Box mb={4}>
				<Text fontSize={18} fontWeight="bold" mb={2}>
					{'Hình ảnh & Video'}
				</Text>
				<Input
					flex={1}
					h={10}
					placeholder="Nhập Link Video Youtube (Nếu có)"
					mb={2}
				/>
				<UploadComponent />
			</Box>
			<Center flexDirection="row">
				<Button
					size="lg"
					px={props.status === 'edit' ? 5 : 16}
					colorScheme="blue"
					_text={{ fontWeight: 'semibold' }}
					mr={props.status === 'edit' ? 2 : 0}
				>
					{props.status === 'create' ? 'Đăng tin' : 'Lưu'}
				</Button>
				{props.status === 'edit' && (
					<Button
						size="lg"
						colorScheme="success"
						_text={{ fontWeight: 'semibold' }}
						ml={2}
						px={5}
						onPress={props.onSold}
					>
						Đã bán
					</Button>
				)}
			</Center>
		</>
	);
};

export default Index;
