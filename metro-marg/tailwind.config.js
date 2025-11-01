/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
				// Metro line colors (primary brand identity)
				metro: {
					blue: {
						50: '#E5F2FF',
						100: '#CCE5FF',
						500: '#0078D4',
						700: '#005A9E',
						900: '#003D6B',
					},
					red: {
						100: '#FFDCDD',
						500: '#D13438',
						700: '#9E2729',
					},
					aqua: {
						100: '#CCF5F8',
						500: '#00B7C3',
						700: '#008A93',
					},
					yellow: {
						100: '#FFF4CC',
						500: '#FFB900',
						700: '#CC9400',
					},
				},
				// Neutral palette
				neutral: {
					50: '#FAFAFA',
					100: '#F5F5F7',
					300: '#C7C7CC',
					500: '#86868B',
					700: '#424245',
					900: '#1D1D1F',
				},
				// Semantic colors
				success: {
					50: '#F0FDF4',
					100: '#D1F5DB',
					500: '#34C759',
					700: '#16A34A',
				},
				warning: {
					100: '#FEF3C7',
					500: '#FF9F0A',
				},
				error: {
					100: '#FEE2E2',
					500: '#FF3B30',
				},
			},
			backgroundImage: {
				'gradient-primary': 'linear-gradient(135deg, #E8EAF0 0%, #F4F5F9 50%, #FAFBFF 100%)',
				'gradient-hero': 'linear-gradient(135deg, #E3E8EE 0%, #EDF1F7 100%)',
				'gradient-dark': 'linear-gradient(135deg, #1a1a1c 0%, #2d2d30 100%)',
			},
			fontFamily: {
				sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
				mono: ['SF Mono', 'Consolas', 'monospace'],
			},
			spacing: {
				'2xs': '4px',
				'xs': '8px',
				'sm': '12px',
				'md': '16px',
				'lg': '24px',
				'xl': '32px',
				'2xl': '48px',
				'3xl': '64px',
				'4xl': '96px',
			},
			borderRadius: {
				'sm': '8px',
				'md': '12px',
				'lg': '16px',
				'xl': '24px',
				'2xl': '32px',
			},
			boxShadow: {
				'glass': '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.05)',
				'glass-hover': '0 12px 40px rgba(0, 0, 0, 0.12), 0 6px 20px rgba(0, 0, 0, 0.08)',
				'modal': '0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1)',
			},
			backdropBlur: {
				'glass': '15px',
				'glass-strong': '20px',
				'glass-intense': '30px',
			},
			animation: {
				'pulse-slow': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
			},
			transitionDuration: {
				'fast': '200ms',
				'normal': '300ms',
				'smooth': '400ms',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
}
