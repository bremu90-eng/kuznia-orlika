import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/oferta`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/cennik`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/trenerzy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/grafik`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/kontakt`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/polityka-prywatnosci`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/regulamin`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]
}
