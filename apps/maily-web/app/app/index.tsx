import { Suspense } from 'react'
import { GetStaticProps } from 'next'
import { headers } from 'next/headers'
import { Metadata } from 'next'
import { Hero } from '@/components/ui/hero'
import { Features } from '@/components/ui/features'
import { Pricing } from '@/components/ui/pricing'
import { LoadingSpinner } from '@/components/ui/loading'
import { getCountryFromIP } from '@/lib/utils'

export const runtime = 'edge'

export const metadata: Metadata = {
  title: 'Maily - AI-Powered Email Marketing',
  description: 'Next-generation email marketing platform powered by AI',
  openGraph: {
    title: 'Maily - AI-Powered Email Marketing',
    description: 'Next-generation email marketing platform powered by AI',
    url: 'https://maily.app',
    siteName: 'Maily',
    images: [
      {
        url: 'https://maily.app/og.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en-US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maily - AI-Powered Email Marketing',
    description: 'Next-generation email marketing platform powered by AI',
    creator: '@mailyapp',
    images: ['https://maily.app/og.png'],
  },
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      country: getCountryFromIP(),
    },
    revalidate: 3600, // Revalidate every hour
  }
}

export default function Home({ country }: { country: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Hero country={country} />
      
      <Suspense fallback={<LoadingSpinner />}>
        <Features />
      </Suspense>
      
      <Suspense fallback={<LoadingSpinner />}>
        <Pricing country={country} />
      </Suspense>
    </main>
  )
} 