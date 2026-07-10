import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bonvoyagers.co'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers()
  const host = headersList.get('host') ?? ''

  const isProductionHost = host === 'bonvoyagers.co' || host === 'www.bonvoyagers.co'

  if (isProductionHost) {
    return {
      rules: {
        userAgent: '*',
        allow: '/',
      },
      sitemap: `${SITE_URL}/sitemap.xml`,
    }
  }

  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  }
}
