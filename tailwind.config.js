/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			backgroundImage: () => ({
				'body-background': "url('../pizza.jpg')"
			}),
			fontFamily: {
				'body-font': ['Poppins', 'sans-serif']
			}
		}
	},
	plugins: []
};
