import { StyleSheet } from 'react-native';

export default StyleSheet.create({
	codeFieldRoot: {
		width: 280,
		marginLeft: 'auto',
		marginRight: 'auto',
	},
	cellRoot: {
		width: 60,
		height: 50,
		justifyContent: 'center',
		alignItems: 'center',
		borderBottomColor: '#ccc',
		borderBottomWidth: 1,
	},
	cellText: {
		color: '#000',
		fontSize: 21,
		textAlign: 'center',
		fontWeight: '600',
	},
	focusCell: {
		borderBottomColor: '#007AFF',
		borderBottomWidth: 2,
	},
});
