/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://pendingcase.in',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/dashboard', '/admin', '/api'] },
    ],
  },
  exclude: ['/dashboard/*', '/admin', '/api/*', '/login', '/register'],
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  additionalPaths: async (config) => [
    await config.transform(config, '/'),
    await config.transform(config, '/search'),
    await config.transform(config, '/verify'),
  ],
}
