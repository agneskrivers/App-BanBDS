export {};

declare global {
	declare module '*.png' {
		const value: any;

		export = value;
	}
}
