import { extendTheme } from 'native-base';

const Index = extendTheme({
	fontConfig: {
		Montserrat: {
			200: {
				normal: 'Montserrat-Thin',
				italic: 'Montserrat-ThinItalic',
			},
			300: {
				normal: 'Montserrat-Light',
				italic: 'Montserrat-LightItalic',
			},
			400: {
				normal: 'Montserrat-Regular',
			},
			500: {
				normal: 'Montserrat-Medium',
				italic: 'Montserrat-MediumItalic',
			},
			600: {
				normal: 'Montserrat-SemiBold',
				italic: 'Montserrat-SemiBoldItalic',
			},
			700: {
				normal: 'Montserrat-Bold',
				italic: 'Montserrat-BoldItalic',
			},
			800: {
				normal: 'Montserrat-ExtraBold',
			},
			900: {
				normal: 'Montserrat-Black',
				italic: 'Montserrat-BlackItalic',
			},
		},
	},

	fonts: {
		heading: 'Montserrat',
		body: 'Montserrat',
		mono: 'Montserrat',
	},
});

export default Index;
