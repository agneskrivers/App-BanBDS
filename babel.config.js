module.exports = {
	presets: ['module:metro-react-native-babel-preset'],
	plugins: [
		[
			'module-resolver',
			{
				root: ['./src'],
				extensions: [
					'.ios.js',
					'.android.js',
					'.js',
					'.ts',
					'.tsx',
					'.json',
				],
				alias: {
					'@assets': './assets',
					'@components': './src/components',
					'@configs': './src/configs',
					'@context': './src/context',
					'@helpers': './src/helpers',
					'@navigation': './src/navigation',
					'@screens': './src/screens',
					'@utils': './src/utils',
				},
			},
		],
	],
};
