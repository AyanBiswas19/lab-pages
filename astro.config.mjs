// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const isCI = Boolean(process.env.CI);
const repoName = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : '';

/**
 * Astro integration to copy co-located non-md/mdx artefacts (.pdf, .html, etc.)
 * from `src/content/works/` to `dist/works/` on build, and serve them in dev mode.
 */
function copyWorkArtefacts() {
  return {
    name: 'copy-work-artefacts',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const srcWorks = path.resolve('src/content/works');
        if (!fs.existsSync(srcWorks)) return;
        const outDir = fileURLToPath(dir);
        const targetDir = path.join(outDir, 'works');
        fs.mkdirSync(targetDir, { recursive: true });
        fs.cpSync(srcWorks, targetDir, {
          recursive: true,
          filter: (src) => !src.endsWith('.md') && !src.endsWith('.mdx'),
        });
      },
      'astro:server:setup': ({ server }) => {
        server.middlewares.use((req, res, next) => {
          if (!req.url) return next();
          const cleanUrl = req.url.split('?')[0];
          // Match /works/<slug>/<asset> or /<base>/works/<slug>/<asset>
          const match = cleanUrl.match(/(?:^|\/)works\/(.+)$/);
          if (!match) return next();

          const assetPath = match[1];
          const filePath = path.resolve('src/content/works', assetPath);

          if (
            fs.existsSync(filePath) &&
            fs.statSync(filePath).isFile() &&
            !filePath.endsWith('.md') &&
            !filePath.endsWith('.mdx')
          ) {
            return fs.createReadStream(filePath).pipe(res);
          }
          next();
        });
      },
    },
  };
}

export default defineConfig({
  site: process.env.GITHUB_REPOSITORY
    ? `https://${process.env.GITHUB_REPOSITORY.split('/')[0]}.github.io`
    : 'http://localhost:4321',
  base: isCI && repoName ? `/${repoName}/` : '/',
  trailingSlash: 'always',
  integrations: [mdx(), copyWorkArtefacts()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
