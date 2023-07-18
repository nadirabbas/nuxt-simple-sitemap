import { mkdir, writeFile } from "node:fs/promises";
import chalk from "chalk";
import { createRouter as createRadixRouter, toRouteMatcher } from "radix3";
import { withoutBase, withoutTrailingSlash } from "ufo";
import { defu } from "defu";
import { createSitePathResolver, withSiteUrl } from "nuxt-site-config-kit";
import { createResolver, useNuxt } from "@nuxt/kit";
import type { Nuxt } from "@nuxt/schema";
import { buildSitemap, buildSitemapIndex } from "./runtime/sitemap/builder";
import type {
  BuildSitemapIndexInput,
  ModuleComputedOptions,
  RuntimeModuleOptions,
  SitemapEntryInput,
  SitemapRenderCtx,
} from "./runtime/types";
import type { ModuleOptions } from "./module";
import { resolveAsyncDataSources } from "./runtime/sitemap/entries";

export function setupPrerenderHandler(
  moduleConfig: ModuleOptions,
  buildTimeMeta: ModuleComputedOptions,
  pagesPromise: Promise<SitemapEntryInput[]>,
  nuxt: Nuxt = useNuxt()
) {
  const { resolve } = createResolver(import.meta.url);

  nuxt.hooks.hook("nitro:init", async (nitro) => {
    const sitemapImages: Record<string, { loc: string }[]> = {};
    const sitemapVideos: any = {};
    // setup a hook for the prerender so we can inspect the image sources
    nitro.hooks.hook("prerender:route", async (ctx) => {
      const html = ctx.contents;
      if (ctx.fileName?.endsWith(".html") && html) {
        // only scan within the <main> tag
        const mainRegex = /<main[^>]*>([\s\S]*?)<\/main>/;
        const mainMatch = mainRegex.exec(html);
        if (!mainMatch || !mainMatch[1]) return;

        if (moduleConfig.discoverYoutubeVideos && moduleConfig.googleApiKey) {
          const youtubeRegex =
            /(?:https?:\/\/(?:www\.)?youtube\.com\/(?:embed\/|watch\?v=)([^"&?\/\s]{11}))/g;
          let match;

          while ((match = youtubeRegex.exec(html)) !== null) {
            const videoId = match[1];

            const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
            const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

            try {
              const response = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${moduleConfig.googleApiKey}`
              ).then((res) => res.json());
              const videoData = response.items[0];

              sitemapVideos[ctx.route] = sitemapVideos[ctx.route] || [];
              sitemapVideos[ctx.route].push({
                title: videoData.snippet.title,
                thumbnailLoc: thumbnailUrl,
                description: videoData.snippet.description,
                contentLoc: videoUrl,
                playerLoc: `https://www.youtube.com/embed/${videoId}`,
                duration:
                  parseInt(
                    videoData.contentDetails.duration.match(/PT(\d+)M(\d+)S/)[1]
                  ) *
                    60 +
                  parseInt(
                    videoData.contentDetails.duration.match(/PT(\d+)M(\d+)S/)[2]
                  ),
                viewCount: videoData.statistics.viewCount,
                publicationDate: videoData.snippet.publishedAt,
                familyFriendly: "yes",
                uploader: videoData.snippet.channelTitle,
                tag: (videoData.snippet.tags || []).join(","),
              });
            } catch (error) {
              console.error(`Error fetching YouTube video metadata: ${error}`);
            }
          }
        }

        if (moduleConfig.discoverImages && mainMatch[1].includes("<img")) {
          // extract image src using regex on the html
          const imgRegex = /<img[^>]+src="([^">]+)"/g;
          let match;
          // eslint-disable-next-line no-cond-assign
          while ((match = imgRegex.exec(mainMatch[1])) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (match.index === imgRegex.lastIndex) imgRegex.lastIndex++;
            let url = match[1];
            // if the match is relative
            if (url.startsWith("/")) url = withSiteUrl(url);
            sitemapImages[ctx.route] = sitemapImages[ctx.route] || [];
            sitemapImages[ctx.route].push({
              loc: url,
            });
          }
        }
      }
    });

    let sitemapGenerated = false;
    const outputSitemap = async () => {
      if (sitemapGenerated || nuxt.options.dev || nuxt.options._prepare) return;

      const prerenderUrls =
        (nitro._prerenderedRoutes || [])
          .filter((r) => !r.route.includes("."))
          .map((r) => ({ loc: r.route })) || [];

      if (!buildTimeMeta.prerenderSitemap) {
        // for SSR we always need to generate the routes.json payload
        await mkdir(resolve(nitro.options.output.publicDir, "__sitemap__"), {
          recursive: true,
        });
        await writeFile(
          resolve(nitro.options.output.publicDir, "__sitemap__/routes.json"),
          JSON.stringify(prerenderUrls)
        );
        nitro.logger.log(chalk.gray("  ├─ /__sitemap__/routes.json (0ms)"));
        return;
      }

      sitemapGenerated = true;

      // we need a siteUrl set for pre-rendering
      let start = Date.now();

      const _routeRulesMatcher = toRouteMatcher(
        createRadixRouter({ routes: nitro.options.routeRules })
      );

      const routeMatcher = (path: string) => {
        const matchedRoutes = _routeRulesMatcher
          .matchAll(
            withoutBase(withoutTrailingSlash(path), nuxt.options.app.baseURL)
          )
          .reverse();
        // inject our discovered images
        if (sitemapImages[path]) {
          matchedRoutes.push({
            sitemap: {
              images: sitemapImages[path],
            },
          });
        }
        if (sitemapVideos[path]) {
          matchedRoutes.push({
            sitemap: {
              videos: sitemapVideos[path],
            },
          });
        }
        return defu({}, ...matchedRoutes) as Record<string, any>;
      };

      const callHook = async (ctx: SitemapRenderCtx) => {
        // @ts-expect-error runtime type
        await nuxt.hooks.callHook("sitemap:prerender", ctx);
        // @ts-expect-error runtime type
        await nuxt.hooks.callHook("sitemap:resolved", ctx);
      };

      const options: BuildSitemapIndexInput = {
        moduleConfig: moduleConfig as RuntimeModuleOptions,
        nitroUrlResolver: createSitePathResolver({
          canonical: false,
          absolute: true,
          withBase: true,
        }),
        canonicalUrlResolver: createSitePathResolver({
          canonical: true,
          absolute: true,
          withBase: true,
        }),
        relativeBaseUrlResolver: createSitePathResolver({
          absolute: false,
          withBase: true,
        }),
        buildTimeMeta,
        getRouteRulesForPath: routeMatcher,
        callHook,
        prerenderUrls,
        pages: await pagesPromise,
      };
      const logs: string[] = [];
      if (moduleConfig.sitemaps) {
        start = Date.now();

        // rendering a sitemap_index
        const { xml, sitemaps } = await buildSitemapIndex(options);
        const indexHookCtx = { sitemap: xml, sitemapName: "index" };
        await nuxt.hooks.callHook("sitemap:output", indexHookCtx);
        await writeFile(
          resolve(nitro.options.output.publicDir, "sitemap_index.xml"),
          indexHookCtx.sitemap
        );
        const generateTimeMS = Date.now() - start;
        logs.push(`/sitemap_index.xml (${generateTimeMS}ms)`);
        // now generate all sub sitemaps
        for (const sitemap of sitemaps) {
          let sitemapXml = await buildSitemap({
            ...options,
            sitemap,
          });
          const ctx = { sitemap: sitemapXml, sitemapName: sitemap.sitemapName };
          await nuxt.hooks.callHook("sitemap:output", ctx);
          sitemapXml = ctx.sitemap;
          await writeFile(
            resolve(
              nitro.options.output.publicDir,
              `${sitemap.sitemapName}-sitemap.xml`
            ),
            sitemapXml
          );
          const generateTimeMS = Date.now() - start;
          logs.push(
            `/${sitemap.sitemapName}-sitemap.xml (${generateTimeMS}ms)`
          );
        }
      } else {
        let sitemapXml = await buildSitemap(options);
        const ctx = {
          sitemap: sitemapXml,
          sitemapName: moduleConfig.sitemapName,
        };
        await nuxt.hooks.callHook("sitemap:output", ctx);
        sitemapXml = ctx.sitemap;
        await writeFile(
          resolve(nitro.options.output.publicDir, moduleConfig.sitemapName),
          sitemapXml
        );
        const generateTimeMS = Date.now() - start;
        logs.push(`/${moduleConfig.sitemapName} (${generateTimeMS}ms)`);
      }

      if (moduleConfig.debug) {
        const sources = await resolveAsyncDataSources(options);
        start = Date.now();
        await mkdir(resolve(nitro.options.output.publicDir, "__sitemap__"), {
          recursive: true,
        });
        await writeFile(
          resolve(nitro.options.output.publicDir, "__sitemap__", "debug.json"),
          JSON.stringify({
            moduleConfig,
            buildTimeMeta,
            data: sources,
            _sources: sources.map((s) => {
              return {
                ...s,
                urls: s.urls.length || 0,
              };
            }),
          })
        );
        const generateTimeMS = Date.now() - start;
        logs.push(`/__sitemap__/debug.json (${generateTimeMS}ms)`);
      }

      for (const k in logs)
        nitro.logger.log(
          chalk.gray(
            `  ${Number.parseInt(k) === logs.length - 1 ? "└─" : "├─"} ${
              logs[k]
            }`
          )
        );
    };

    // SSR mode
    nitro.hooks.hook("rollup:before", async () => {
      await outputSitemap();
    });

    // SSG mode
    nitro.hooks.hook("close", async () => {
      await outputSitemap();
    });
  });
}
