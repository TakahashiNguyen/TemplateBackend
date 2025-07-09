import tailwindcssBoxShadow from 'tailwindcss-box-shadow';
import tailwindcssEmailVariants from 'tailwindcss-email-variants';
import tailwindcssMso from 'tailwindcss-mso';
import tailwindcssPresentEmail from 'tailwindcss-preset-email';

/** @type {import('tailwindcss').Config} */
export default {
	presets: [tailwindcssPresentEmail],
	content: [
		'./components/**/*.html',
		'./emails/**/*.html',
		'./layouts/**/*.html',
	],
	plugins: [tailwindcssBoxShadow, tailwindcssEmailVariants, tailwindcssMso],
};
