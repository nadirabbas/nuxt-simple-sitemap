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
      autoLastmod: false,
      siteUrl: 'https://nuxtseo.com',
    },
  },
})
describe('prod', () => {
  it('basic', async () => {
    const sitemapIndex = (await $fetch('/sitemap_index.xml')).replace(/lastmod>(.*?)</g, 'lastmod><')

    expect(sitemapIndex).toMatchInlineSnapshot(`
      "<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?><?xml-stylesheet type=\\"text/xsl\\" href=\\"/__sitemap__/style.xsl\\"?>
      <sitemapindex xmlns=\\"http://www.sitemaps.org/schemas/sitemap/0.9\\">
          <sitemap>
              <loc>https://nuxtseo.com/posts-sitemap.xml</loc>
          </sitemap>
          <sitemap>
              <loc>https://nuxtseo.com/pages-sitemap.xml</loc>
              <lastmod></lastmod>
          </sitemap>
          <sitemap>
              <loc>https://www.odysseytraveller.com/sitemap-pages.xml</loc>
          </sitemap>
      </sitemapindex>"
    `)

    expect(await $fetch('/posts-sitemap.xml')).toMatchInlineSnapshot(`
      "<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?><?xml-stylesheet type=\\"text/xsl\\" href=\\"/__sitemap__/style.xsl\\"?>
      <urlset xmlns:xsi=\\"http://www.w3.org/2001/XMLSchema-instance\\" xmlns:video=\\"http://www.google.com/schemas/sitemap-video/1.1\\" xmlns:xhtml=\\"http://www.w3.org/1999/xhtml\\" xmlns:image=\\"http://www.google.com/schemas/sitemap-image/1.1\\" xsi:schemaLocation=\\"http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd\\" xmlns=\\"http://www.sitemaps.org/schemas/sitemap/0.9\\">
          <url>
              <xhtml:link rel=\\"alternate\\" hreflang=\\"fr\\" href=\\"https://nuxtseo.com/fr/blog\\" />
              <loc>https://nuxtseo.com/blog</loc>
          </url>
          <url>
              <xhtml:link rel=\\"alternate\\" hreflang=\\"fr\\" href=\\"https://nuxtseo.com/fr/blog/categories\\" />
              <loc>https://nuxtseo.com/blog/categories</loc>
          </url>
          <url>
              <loc>https://nuxtseo.com/blog/post-1</loc>
          </url>
          <url>
              <loc>https://nuxtseo.com/blog/post-2</loc>
          </url>
          <url>
              <loc>https://nuxtseo.com/blog/post-3</loc>
          </url>
          <url>
              <loc>https://nuxtseo.com/blog/post-4</loc>
          </url>
          <url>
              <loc>https://nuxtseo.com/blog/post-5</loc>
          </url>
          <url>
              <xhtml:link rel=\\"alternate\\" hreflang=\\"fr\\" href=\\"https://nuxtseo.com/fr/blog/tags\\" />
              <loc>https://nuxtseo.com/blog/tags</loc>
          </url>
      </urlset>"
    `)

    expect(await $fetch('/pages-sitemap.xml')).toContain('<?xml')
  }, 60000)
})
