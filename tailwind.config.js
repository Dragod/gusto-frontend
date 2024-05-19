/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			backgroundImage: () => ({
				//'body-background': "url('./static/bg.svg')"
			}),
			fontFamily: {
				'body-font': ['Poppins', 'sans-serif']
			},
			colors: {
				default: '#003f36'
			}
		}
	},
	plugins: []
};
