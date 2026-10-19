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

## Adding a Research Work

1. Create a directory: `src/content/works/<work-slug>/` (e.g. `src/content/works/sample-work/`).
2. Add an `index.mdx` file with metadata and page content. Add supporting files such as a PDF or teaser image in the same directory when available.
3. Configure frontmatter in `index.mdx`:

```yaml
---
title: "Work Title"
description: "A short description of the work."
date: 2024-06-18
venue: "Conference 2024"
featured: false # Set true to feature at top of homepage
tags: ["Computer Vision", "Edge AI"]
authors:
  - name: "Author One"
    affiliation: "1"
    equalContribution: true
  - name: "Author Two"
    affiliation: "1"
    equalContribution: true
affiliations:
  - id: "1"
    name: "Department or Institution"
links:
  - label: "Paper (PDF)"
    url: "./paper.pdf"
  - label: "Code"
    url: "https://github.com/..."
bibtex: |
  @inproceedings{author2024work,
    title={Work Title},
    author={One, Author and Two, Author},
    booktitle={Conference 2024},
    year={2024}
  }
---

## Overview
Write the project page in standard Markdown. Math equations use standard LaTeX:
$$
\mathcal{L} = \mathcal{L}_{\text{task}} + \lambda \mathcal{L}_{\text{reg}}
$$
```

---

## Deployment

Pushes to `main` and manual workflow runs build and publish to GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
