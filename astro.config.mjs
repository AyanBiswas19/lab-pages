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
const workAssetExtensions = new Set([
  '.pdf', '.html', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.mp4', '.webm', '.mp3', '.wav',
]);

function isWithinDirectory(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === '' || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

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
          filter: (src) => {
            const relative = path.relative(srcWorks, src);
            if (
              !isWithinDirectory(srcWorks, src) ||
              (relative !== '' && relative.split(path.sep).some((part) => part.startsWith('.')))
            ) {
              return false;
            }
            const stats = fs.lstatSync(src);
            if (stats.isSymbolicLink()) return false;
            return stats.isDirectory() || (stats.isFile() && workAssetExtensions.has(path.extname(src).toLowerCase()));
          },
        });
      },
      'astro:server:setup': ({ server }) => {
        server.middlewares.use((req, res, next) => {
          if (!req.url) return next();
          const cleanUrl = req.url.split('?')[0];
          // Match /works/<slug>/<asset> or /<base>/works/<slug>/<asset>
          const match = cleanUrl.match(/(?:^|\/)works\/(.+)$/);
          if (!match) return next();

          let assetPath;
          try {
            assetPath = decodeURIComponent(match[1]);
          } catch {
            return next();
          }

          const srcWorks = path.resolve('src/content/works');
          const filePath = path.resolve(srcWorks, assetPath);
          if (!isWithinDirectory(srcWorks, filePath)) return next();

          try {
            const realRoot = fs.realpathSync(srcWorks);
            const realFile = fs.realpathSync(filePath);
            if (
              isWithinDirectory(realRoot, realFile) &&
              fs.statSync(realFile).isFile() &&
              workAssetExtensions.has(path.extname(realFile).toLowerCase())
            ) {
              return fs.createReadStream(realFile).pipe(res);
            }
          } catch {
            return next();
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
