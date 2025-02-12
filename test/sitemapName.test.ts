import { describe, expect, it } from 'vitest'
import { createResolver } from '@nuxt/kit'
import { $fetch, setup } from '@nuxt/test-utils'

const { resolve } = createResolver(import.meta.url)

await setup({
  rootDir: resolve('../.playground'),
  build: true,
  server: true,
  nuxtConfig: {
    sitemap: {
      credits: false,
      sitemaps: false,
      sitemapName: 'test.xml',
      siteUrl: 'https://nuxtseo.com',
    },
  },
})
describe('sitemapName', () => {
  it('basic', async () => {
    let sitemap = await $fetch('/test.xml')
    // remove lastmods before tresting
    sitemap = sitemap.replace(/lastmod>(.*?)</g, 'lastmod><')
    // basic test to make sure we get a valid response
    expect(sitemap).toMatchInlineSnapshot(`
      "<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?><?xml-stylesheet type=\\"text/xsl\\" href=\\"/__sitemap__/style.xsl\\"?>
      <urlset xmlns:xsi=\\"http://www.w3.org/2001/XMLSchema-instance\\" xmlns:video=\\"http://www.google.com/schemas/sitemap-video/1.1\\" xmlns:xhtml=\\"http://www.w3.org/1999/xhtml\\" xmlns:image=\\"http://www.google.com/schemas/sitemap-image/1.1\\" xsi:schemaLocation=\\"http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd\\" xmlns=\\"http://www.sitemaps.org/schemas/sitemap/0.9\\">
          <url>
              <lastmod></lastmod>
              <xhtml:link rel=\\"alternate\\" hreflang=\\"fr\\" href=\\"https://nuxtseo.com/fr\\" />
              <loc>https://nuxtseo.com/</loc>
          </url>
          <url>
              <lastmod></lastmod>
              <xhtml:link rel=\\"alternate\\" hreflang=\\"fr\\" href=\\"https://nuxtseo.com/fr/about\\" />
              <loc>https://nuxtseo.com/about</loc>
              <changefreq>daily</changefreq>
              <priority>0.3</priority>
              <image:image>
                  <image:loc>https://example.com/image.jpg</image:loc>
              </image:image>
              <image:image>
                  <image:loc>https://example.com/image2.jpg</image:loc>
              </image:image>
          </url>
          <url>
              <lastmod></lastmod>
              <xhtml:link rel=\\"alternate\\" hreflang=\\"fr\\" href=\\"https://nuxtseo.com/fr/blog\\" />
              <loc>https://nuxtseo.com/blog</loc>
          </url>
          <url>
              <lastmod></lastmod>
              <xhtml:link rel=\\"alternate\\" hreflang=\\"fr\\" href=\\"https://nuxtseo.com/fr/hidden-path-but-in-sitemap\\" />
              <loc>https://nuxtseo.com/hidden-path-but-in-sitemap</loc>
          </url>
          <url>
              <lastmod></lastmod>
              <xhtml:link rel=\\"alternate\\" hreflang=\\"fr\\" href=\\"https://nuxtseo.com/fr/new-page\\" />
              <loc>https://nuxtseo.com/new-page</loc>
          </url>
          <url>
              <lastmod></lastmod>
              <xhtml:link rel=\\"alternate\\" hreflang=\\"fr\\" href=\\"https://nuxtseo.com/fr/blog/categories\\" />
              <loc>https://nuxtseo.com/blog/categories</loc>
          </url>
          <url>
              <lastmod></lastmod>
              <loc>https://nuxtseo.com/blog/post-1</loc>
          </url>
          <url>
              <lastmod></lastmod>
              <loc>https://nuxtseo.com/blog/post-2</loc>
          </url>
          <url>
              <lastmod></lastmod>
              <loc>https://nuxtseo.com/blog/post-3</loc>
          </url>
          <url>
              <lastmod></lastmod>
              <loc>https://nuxtseo.com/blog/post-4</loc>
          </url>
          <url>
              <lastmod></lastmod>
              <loc>https://nuxtseo.com/blog/post-5</loc>
          </url>
          <url>
              <lastmod></lastmod>
              <xhtml:link rel=\\"alternate\\" hreflang=\\"fr\\" href=\\"https://nuxtseo.com/fr/blog/tags\\" />
              <loc>https://nuxtseo.com/blog/tags</loc>
          </url>
          <url>
              <lastmod></lastmod>
              <loc>https://nuxtseo.com/users-lazy/1</loc>
          </url>
          <url>
              <lastmod></lastmod>
              <loc>https://nuxtseo.com/users-lazy/2</loc>
          </url>
          <url>
              <lastmod></lastmod>
              <loc>https://nuxtseo.com/users-lazy/3</loc>
          </url>
      </urlset>"
    `)
    expect(sitemap).toContain('<loc>https://nuxtseo.com/</loc>')
  }, 60000)
})
