# Research Lab Website Implementation Plan

## 1. Goal & Architecture Overview

Build a zero-maintenance, zero-cost, static research website for the lab using **Astro** and deploy it to **GitHub Pages** via **GitHub Actions** (`deploy-pages`).

- **Static & Fast**: Pure static HTML/CSS with zero server dependencies, instant load times, and maximum SEO/discoverability.
- **Author-Friendly**: Each research project is an MDX document (`src/content/works/<slug>/index.mdx`) with typed YAML frontmatter for metadata (authors, venue, links, BibTeX, teaser).
- **Extensible**: Standard papers use the clean academic layout; works needing interactive demos or 3D visualizers import custom Astro/UI components directly inside MDX.
- **Zero-Budget Hosting**: Deployed automatically to GitHub Pages (`https://<owner>.github.io/<repo>/`) on push to `main` with dynamic base path detection.

---

## 2. Fierce Audit & Key Architectural Decisions

| Area | Initial Ambiguity / Flaw in Draft | Resolution & Decision |
| :--- | :--- | :--- |
| **Metadata Storage** | Split across `work.yaml` and `index.mdx` (duplicate source of truth, breaks Astro Content Collections loader). | **Unified in `index.mdx` Frontmatter**: Validated via Astro 5 Content Collections & Zod schema in `src/content.config.ts`. Single source of truth. |
| **Deployment Method** | Pushing compiled assets to a `gh-pages` branch via Git commits. | **GitHub Actions Pages Deployment**: Uses official `actions/upload-pages-artifact@v3` and `actions/deploy-pages@v4`. No dirty commit history or orphan branch. |
| **Base Path & Domain** | Hardcoded base path risks 404s on asset/page links across local dev and GitHub Pages project subpaths. | **Adaptive Base URL**: In `astro.config.mjs`, dynamically set `base` from `process.env.GITHUB_REPOSITORY` in CI, falling back to `/` in local dev. |
| **Custom Work Pages** | Proposing separate `.astro` pages under `src/pages/works/` (risks bypassing catalog discovery and metadata validation). | **MDX Component Ingestion**: Every work remains a typed MDX entry; custom interactive elements are imported as Astro/React components directly in the MDX body. |
| **Nested Articles** | Over-complicated nested subtrees (`details/*.mdx`) with undefined breadcrumbs. | **Catch-all Dynamic Routing**: `src/pages/works/[...slug].astro` renders `index.mdx` by default, while seamlessly supporting nested detail pages (`works/<slug>/supplementary`) if needed. |
| **Academic Needs** | Math and BibTeX were mentioned without implementation details. | **Built-in KaTeX & BibTeX UX**: MDX configured with `remark-math` and `rehype-katex`; BibTeX block component with one-click clipboard copy. |
| **Multi-Format Artefacts** | Unclear how non-MDX files (standalone HTML demos, PDFs) are handled. | **Full Multi-Format Support**: `.md` and `.mdx` are parsed into pages; `.pdf` and standalone `.html` (e.g., 3D visualizers, Plotly exports) co-located in the work directory are published verbatim and linkable via relative URLs or `<iframe>`. |
| **Package Manager** | Bun selected, but environment needs Bun installed. | **Bun Locked in CI**: CI uses `oven-sh/setup-bun@v2` with `bun.lock` for sub-second reproducible builds. |

---

## 3. Directory Layout

```text
.
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions deploy to GitHub Pages
├── astro.config.mjs               # Astro configuration (MDX, KaTeX, adaptive base, asset copier)
├── package.json
├── bun.lock
├── tsconfig.json
├── public/
│   ├── favicon.svg
│   └── CNAME                      # Optional: only if custom domain added later
└── src/
    ├── content.config.ts          # Zod schema for research works
    ├── content/
    │   └── works/
    │       └── <work-slug>/
    │           ├── index.mdx       # Main landing page (frontmatter + rich content)
    │           ├── teaser.png      # Colocated teaser/figure image
    │           ├── paper.pdf       # Colocated PDF artefact (paper, poster, slides)
    │           ├── demo.html       # Colocated standalone HTML demo (3D viewer, Plotly)
    │           ├── appendix.md     # Colocated supplementary markdown or mdx
    │           └── assets/         # Additional figures, diagrams, clips (< 5MB)
    ├── layouts/
    │   ├── BaseLayout.astro       # HTML head, nav, footer, SEO metadata
    │   └── WorkLayout.astro       # Academic project page template
    ├── components/
    │   ├── ProjectHeader.astro    # Title, authors, affiliations, quick action buttons
    │   ├── ActionButton.astro     # Paper, Code, arXiv, Dataset, Video pill buttons
    │   ├── Figure.astro           # Responsive image with caption and label
    │   ├── Video.astro            # Native HTML5 video with poster & loop controls
    │   ├── BibtexBlock.astro      # Formatted BibTeX with 1-click copy button
    │   └── WorkCard.astro         # Homepage project card with teaser
    ├── pages/
    │   ├── index.astro            # Lab home & publication catalog (chronological/featured)
    │   └── works/
    │       └── [...slug].astro    # Dynamic router for works and sub-articles
    └── styles/
        └── global.css             # Typography, KaTeX CSS import, clean minimal styling
```

---

## 4. Multi-Format Artefact Handling

Authors can drop files directly into their work folder (`src/content/works/<slug>/`):

1. **`.md` and `.mdx` (Articles & Notes)**:
   - Handled natively by Astro Content Collections.
   - `index.mdx` (or `index.md`) defines the main paper landing page and frontmatter metadata.
   - Any supplementary files (e.g., `appendix.md`, `details/methodology.mdx`) are automatically routed to `/works/<slug>/appendix` or `/works/<slug>/details/methodology`.

2. **`.pdf` (Papers, Slides, Posters)**:
   - Dropped directly into the work directory (e.g. `paper.pdf` or `poster.pdf`).
   - The build pipeline copies non-markdown assets from `src/content/works/` directly to the output `dist/works/`.
   - Linkable directly in frontmatter action buttons:
     ```yaml
     links:
       - label: "Paper (PDF)"
         url: "./paper.pdf"
       - label: "Poster"
         url: "./poster.pdf"
     ```
   - Or linked inline within markdown text: `[Download Camera-Ready PDF](./paper.pdf)`.

3. **Standalone `.html` (Interactive 3D Visualizers, Plotly / WebGL / Three.js Exports)**:
   - Dropped directly into the work directory (e.g. `interactive_viewer.html`).
   - Copied verbatim to the final build output without being parsed or mangled by Astro/MDX compilers.
   - Authors can link it directly via button (`url: "./interactive_viewer.html"`) for full-screen viewing, or embed it directly into the MDX document via an iframe:
     ```html
     <iframe src="./interactive_viewer.html" width="100%" height="600" class="rounded-lg border my-6"></iframe>
     ```

---

## 5. Metadata Schema (`src/content.config.ts`)

Every project entry in `src/content/works/<slug>/index.mdx` adheres to this typed Zod schema:

```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const works = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/works' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      venue: z.string(), // e.g. "ICCVW 2023", "CVPR 2024", "Preprint"
      authors: z.array(
        z.object({
          name: z.string(),
          url: z.string().url().optional(),
          affiliation: z.string().optional(),
          equalContribution: z.boolean().optional(),
        })
      ),
      affiliations: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
        })
      ).optional(),
      teaser: image().optional(),
      teaserAlt: z.string().optional(),
      links: z.array(
        z.object({
          label: z.string(), // "Paper", "arXiv", "Code", "Dataset", "Video"
          url: z.string().url(),
          icon: z.string().optional(),
        })
      ).default([]),
      bibtex: z.string().optional(),
      featured: z.boolean().default(false),
      tags: z.array(z.string()).default([]),
    }),
});

export const collections = { works };
```

---

## 6. Reusable Academic UI Components

1. **`ProjectHeader.astro`**:
   - Renders paper title in clean academic typography.
   - Author list with clickable personal homepages and equal-contribution markers (`*`).
   - Affiliations numbered and linked.
   - Venue banner (e.g., *IEEE International Conference on Computer Vision Workshops (ICCVW) 2023*).
   - Prominent pill buttons: PDF, arXiv, GitHub, Dataset, Video, Demo.
2. **`BibtexBlock.astro`**:
   - Monospace block displaying pre-formatted BibTeX.
   - Client-side copy-to-clipboard button with visual confirmation tooltip.
3. **`Figure.astro` & `Video.astro`**:
   - Semantic `<figure>` and `<figcaption>`.
   - Video handles `<video autoplay loop muted playsinline>` with responsive poster image and external video link fallback.
4. **`WorkCard.astro`**:
   - Grid/list card for homepage catalog: teaser thumbnail, publication year/venue badge, title, authors, quick links.

---

## 7. Implementation Sequence

### Step 1: Tooling & Project Scaffolding
- Ensure Bun is installed locally (`curl -fsSL https://bun.sh/install | bash` or brew).
- Initialize minimal Astro project:
  ```bash
  bun create astro@latest . --template minimal --no-install --typescript strict
  bun install
  bun add @astrojs/mdx remark-math rehype-katex katex
  ```
- Configure `astro.config.mjs` with adaptive `base`, `site`, KaTeX math, and automatic multi-format asset copying (`.pdf`, `.html`, etc.):
  ```javascript
  import { defineConfig } from 'astro/config';
  import mdx from '@astrojs/mdx';
  import remarkMath from 'remark-math';
  import rehypeKatex from 'rehype-katex';
  import fs from 'node:fs';
  import path from 'node:path';

  const isCI = Boolean(process.env.CI);
  const repoName = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : '';

  // Tiny zero-dependency integration to copy co-located non-md/mdx files (.pdf, .html, etc.) to dist/works
  function copyWorkArtefacts() {
    return {
      name: 'copy-work-artefacts',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          const srcWorks = path.resolve('src/content/works');
          if (!fs.existsSync(srcWorks)) return;
          const distWorks = path.join(dir.pathname, repoName, 'works');
          fs.cpSync(srcWorks, distWorks, {
            recursive: true,
            filter: (src) => !src.endsWith('.md') && !src.endsWith('.mdx'),
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
    integrations: [mdx(), copyWorkArtefacts()],
    markdown: {
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    },
  });
  ```

### Step 2: Content Schema & Base Layout
- Implement `src/content.config.ts` with the Zod schema above.
- Create `src/layouts/BaseLayout.astro` and `src/styles/global.css` (clean, responsive, academic CSS with KaTeX stylesheet).
- Implement `src/layouts/WorkLayout.astro`.

### Step 3: Components & Dynamic Routes
- Implement `ProjectHeader.astro`, `ActionButton.astro`, `Figure.astro`, `Video.astro`, and `BibtexBlock.astro`.
- Implement dynamic routing in `src/pages/works/[...slug].astro` using `getStaticPaths()` from `getCollection('works')`.
- Implement `src/pages/index.astro` (lab intro + publication aggregator sorted by date, with featured section).

### Step 4: First Real Work Migration
- Migrate `temp_artefacts/Biswas_Characterizing_Face_Recognition_...pdf` into a real project entry:
  `src/content/works/edge-face-recognition/index.mdx`
- Include real authors, abstract, ICCVW 2023 venue, BibTeX, and local PDF/figures.
- Verify math equations ($...$ and $$...$$) and code blocks.

### Step 5: GitHub Actions CI/CD Pipeline
- Create `.github/workflows/deploy.yml`:
  ```yaml
  name: Deploy to GitHub Pages

  on:
    push:
      branches: [main]
    workflow_dispatch:

  permissions:
    contents: read
    pages: write
    id-token: write

  concurrency:
    group: pages
    cancel-in-progress: false

  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: oven-sh/setup-bun@v2
          with:
            bun-version: latest
        - run: bun install --frozen-lockfile
        - run: bun run build
        - uses: actions/upload-pages-artifact@v3
          with:
            path: ./dist

    deploy:
      environment:
        name: github-pages
        url: ${{ steps.deployment.outputs.page_url }}
      runs-on: ubuntu-latest
      needs: build
      steps:
        - id: deployment
          uses: actions/deploy-pages@v4
  ```

### Step 6: Documentation & Authoring Guide
- Create `README.md` with:
  - Local setup: `bun install`, `bun dev`, `bun build`.
  - Authoring guide: How to add a new paper in 5 minutes by copying the template.
  - Large media guidance: Media < 5MB directly in Git; videos > 5MB embed YouTube/Vimeo/Zenodo URL.
  - One-time GitHub repo setting: Enable Pages from GitHub Actions.
