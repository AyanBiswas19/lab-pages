# Lab Pages

Static research lab website and publication portal, built with [Astro](https://astro.build) and deployed automatically to GitHub Pages.

---

## Quick Start

```bash
bun install    # Install dependencies
bun dev        # Start local dev server at localhost:4321
bun run build  # Build production site to ./dist/
```

---

## Adding a Paper

1. Create a directory: `src/content/works/<work-slug>/` (e.g. `src/content/works/face-recognition/`).
2. Add your files:
   - `index.mdx`: Project page content and metadata frontmatter.
   - `paper.pdf`: Camera-ready PDF (linkable as `./paper.pdf`).
   - `teaser.png` *(optional)*: Teaser or figure image.
3. Configure frontmatter in `index.mdx`:

```yaml
---
title: "Paper Title"
description: "A short 1-2 sentence summary of the paper."
date: 2024-06-18
venue: "CVPR 2024"
featured: false # Set true to feature at top of homepage
tags: ["Computer Vision", "Edge AI"]
authors:
  - name: "Author One"
    url: "https://author-one.org"
    affiliation: "1"
    equalContribution: true
  - name: "Author Two"
    affiliation: "1"
    equalContribution: true
  - name: "Anoop M. Namboodiri"
    affiliation: "1"
affiliations:
  - id: "1"
    name: "Center for Visual Information Technology (CVIT), IIIT Hyderabad"
links:
  - label: "Paper (PDF)"
    url: "./paper.pdf"
  - label: "Code"
    url: "https://github.com/..."
bibtex: |
  @inproceedings{author2024title,
    title={Paper Title},
    author={One, Author and Two, Author and Namboodiri, Anoop M.},
    booktitle={IEEE Conference on Computer Vision and Pattern Recognition (CVPR)},
    year={2024}
  }
---

## Abstract
Abstract text...

## Methodology
Write in standard Markdown. Math equations use standard LaTeX:
$$
\mathcal{L} = \mathcal{L}_{\text{task}} + \lambda \mathcal{L}_{\text{reg}}
$$
```

---

## Deployment

Pull requests merged into `main` automatically build and publish to GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
