import typescript from 'rollup-plugin-typescript'

export default {
	moduleName: 'hook',
	plugins: [
		typescript({
			typescript: require('typescript')
		})
	],
}