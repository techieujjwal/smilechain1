import { Analytics } from '@vercel/analytics/react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const TITLE = 'Proof of Smile'
const DESCRIPTION = 'Get paid for your smile. Turn real human joy into on-chain value on Base.'
const TWITTER_HANDLE = '@openputer'
const TWITTER_CARD = 'social-twitter.png'
const FACEBOOK_CARD = 'social-og.png'
const THEME_COLOR = '#FFF7ED'
const SITE_URL = 'https://smile.openputer.com'

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		default: TITLE,
		template: `%s • ${TITLE}`,
	},
	description: DESCRIPTION,
	openGraph: {
		title: TITLE,
		description: DESCRIPTION,
		siteName: TITLE,
		type: 'website',
		url: SITE_URL,
		images: FACEBOOK_CARD,
	},
	twitter: {
		creator: TWITTER_HANDLE,
		description: DESCRIPTION,
		card: 'summary_large_image',
		images: TWITTER_CARD,
	},
	applicationName: TITLE,
	appleWebApp: {
		capable: true,
		title: TITLE,
		statusBarStyle: 'default',
	},
	formatDetection: {
		telephone: false,
	},
	icons: [
		{ rel: 'mask-icon', url: 'https://pub-0a8864c7b35943799c57616bf42c2669.r2.dev/positive-icon.png', color: THEME_COLOR },
		{ rel: 'shortcut icon', url: 'https://pub-0a8864c7b35943799c57616bf42c2669.r2.dev/positive-icon.png' },
		{ rel: 'icon', url: 'https://pub-0a8864c7b35943799c57616bf42c2669.r2.dev/positive-icon.png', sizes: '32x32' },
		{ rel: 'icon', url: 'https://pub-0a8864c7b35943799c57616bf42c2669.r2.dev/positive-icon.png', sizes: '16x16' },
		{ rel: 'apple-touch-icon', url: 'https://pub-0a8864c7b35943799c57616bf42c2669.r2.dev/positive-icon.png' },
		{ rel: 'apple-touch-icon', url: 'https://pub-0a8864c7b35943799c57616bf42c2669.r2.dev/positive-icon.png', sizes: '152x152' },
		{ rel: 'apple-touch-icon', url: 'https://pub-0a8864c7b35943799c57616bf42c2669.r2.dev/positive-icon.png', sizes: '180x180' },
		{ rel: 'apple-touch-icon', url: 'https://pub-0a8864c7b35943799c57616bf42c2669.r2.dev/positive-icon.png', sizes: '167x167' },
	],
}

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1" />
			</head>
			<body className={`${inter.className} bg-[#FFFAF5] text-gray-900 min-h-screen antialiased`}>
				<Providers>
					{children}
					<Analytics />
				</Providers>
			</body>
		</html>
	)
}
