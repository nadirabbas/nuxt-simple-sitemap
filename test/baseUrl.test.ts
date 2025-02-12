import { describe, expect, it } from 'vitest'
import { createResolver } from '@nuxt/kit'
import { $fetch, setup } from '@nuxt/test-utils'

const { resolve } = createResolver(import.meta.url)

await setup({
  rootDir: resolve('../.playground'),
  build: true,
  server: true,
  nuxtConfig: {
    app: {
      baseURL: '/base',
    },
    sitemap: {
      autoLastmod: false,
      credits: false,
      siteUrl: 'https://nuxtseo.com',
    },
  },
})
describe('base', () => {
  it('basic', async () => {
    const sitemapIndex = await $fetch('/base/sitemap_index.xml')

    expect(sitemapIndex).not.match(/\/base\/base\//g)

    let posts = await $fetch('/base/posts-sitemap.xml')

    // remove lastmods before tresting
    posts = posts.replace(/lastmod>(.*?)</g, 'lastmod><')
    expect(posts).toMatchInlineSnapshot(`
      "<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?><?xml-stylesheet type=\\"text/xsl\\" href=\\"/base/__sitemap__/style.xsl\\"?>
      <urlset xmlns:xsi=\\"http://www.w3.org/2001/XMLSchema-instance\\" xmlns:video=\\"http://www.google.com/schemas/sitemap-video/1.1\\" xmlns:xhtml=\\"http://www.w3.org/1999/xhtml\\" xmlns:image=\\"http://www.google.com/schemas/sitemap-image/1.1\\" xsi:schemaLocation=\\"http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd\\" xmlns=\\"http://www.sitemaps.org/schemas/sitemap/0.9\\">
          <url>
              <xhtml:link rel=\\"alternate\\" hreflang=\\"fr\\" href=\\"https://nuxtseo.com/base/fr/blog\\" />
              <loc>https://nuxtseo.com/base/blog</loc>
          </url>
          <url>
              <xhtml:link rel=\\"alternate\\" hreflang=\\"fr\\" href=\\"https://nuxtseo.com/base/fr/blog/categories\\" />
              <loc>https://nuxtseo.com/base/blog/categories</loc>
          </url>
          <url>
              <loc>https://nuxtseo.com/base/blog/post-1</loc>
          </url>
          <url>
              <loc>https://nuxtseo.com/base/blog/post-2</loc>
          </url>
          <url>
              <loc>https://nuxtseo.com/base/blog/post-3</loc>
          </url>
          <url>
              <loc>https://nuxtseo.com/base/blog/post-4</loc>
          </url>
          <url>
              <loc>https://nuxtseo.com/base/blog/post-5</loc>
          </url>
          <url>
              <xhtml:link rel=\\"alternate\\" hreflang=\\"fr\\" href=\\"https://nuxtseo.com/base/fr/blog/tags\\" />
              <loc>https://nuxtseo.com/base/blog/tags</loc>
          </url>
      </urlset>"
    `)

    let pages = await $fetch('/base/pages-sitemap.xml')
    // remove lastmods before tresting
    pages = pages.replace(/lastmod>(.*?)</g, 'lastmod><')
    expect(pages).toMatchInlineSnapshot(`
      "<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?><?xml-stylesheet type=\\"text/xsl\\" href=\\"/base/__sitemap__/style.xsl\\"?>
      <urlset xmlns:xsi=\\"http://www.w3.org/2001/XMLSchema-instance\\" xmlns:video=\\"http://www.google.com/schemas/sitemap-video/1.1\\" xmlns:xhtml=\\"http://www.w3.org/1999/xhtml\\" xmlns:image=\\"http://www.google.com/schemas/sitemap-image/1.1\\" xsi:schemaLocation=\\"http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd\\" xmlns=\\"http://www.sitemaps.org/schemas/sitemap/0.9\\">
          <url>
              <xhtml:link rel=\\"alternate\\" hreflang=\\"fr\\" href=\\"https://nuxtseo.com/base/fr\\" />
              <loc>https://nuxtseo.com/base/</loc>
          </url>
          <url>
              <xhtml:link rel=\\"alternate\\" href=\\"https://nuxtseo.com/base/fr/about\\" hreflang=\\"fr\\" />
              <loc>https://nuxtseo.com/base/about</loc>
              <lastmod></lastmod>
              <changefreq>daily</changefreq>
              <priority>0.3</priority>
              <image:image>
                  <image:loc>https://example.com/image.jpg</image:loc>
              </image:image>
              <image:image>
                  <image:loc>https://example.com/image2.jpg</image:loc>
              </image:image>
              <image:image>
                  <image:loc>https://example.com/image-3.jpg</image:loc>
              </image:image>
          </url>
          <url>
              <xhtml:link rel=\\"alternate\\" hreflang=\\"fr\\" href=\\"https://nuxtseo.com/base/fr/hidden-path-but-in-sitemap\\" />
              <loc>https://nuxtseo.com/base/hidden-path-but-in-sitemap</loc>
          </url>
          <url>
              <xhtml:link rel=\\"alternate\\" hreflang=\\"fr\\" href=\\"https://nuxtseo.com/base/fr/new-page\\" />
              <loc>https://nuxtseo.com/base/new-page</loc>
          </url>
          <url>
              <loc>https://nuxtseo.com/base/foo/1</loc>
          </url>
          <url>
              <loc>https://nuxtseo.com/base/foo/2</loc>
          </url>
          <url>
              <loc>https://nuxtseo.com/base/foo/3</loc>
          </url>
          <url>
              <loc>https://nuxtseo.com/base/users-lazy/1</loc>
          </url>
          <url>
              <loc>https://nuxtseo.com/base/users-lazy/2</loc>
          </url>
          <url>
              <loc>https://nuxtseo.com/base/users-lazy/3</loc>
          </url>
      </urlset>"
    `)
  }, 60000)
})
