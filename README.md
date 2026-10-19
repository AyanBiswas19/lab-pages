# Anoop Lab Pages

Static research lab website and publication portal for **Anoop Lab**, built with [Astro](https://astro.build) and deployed automatically to GitHub Pages.

---

## 🚀 Quick Start (Local Development)

```bash
# Install dependencies
bun install

# Start local development server (with live reload)
bun dev

# Build production static output
bun run build

# Preview production build locally
bun run preview
```

---

## 📝 How to Add a New Paper / Project

Adding a new research project takes less than 5 minutes:

1. Create a new directory under `src/content/works/<work-slug>/` (e.g. `src/content/works/multimodal-face-antispoofing/`).
2. Drop your artefacts into this folder:
   - `index.mdx`: Project landing page with frontmatter metadata.
   - `paper.pdf`: Camera-ready PDF (linkable as `./paper.pdf`).
   - `demo.html` *(optional)*: Standalone interactive HTML demo or 3D viewer (embeddable via iframe).
   - `teaser.png` *(optional)*: Hero figure/diagram.
3. Configure the frontmatter at the top of `index.mdx`:

```yaml
---
title: "Paper Title"
description: "A 1-2 sentence summary of the paper for cards and search engines."
date: 2024-06-18
venue: "CVPR 2024"
featured: false # Set true to feature on the homepage top section
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
  - label: "Interactive Demo"
    url: "./demo.html"
bibtex: |
  @inproceedings{author2024title,
    title={Paper Title},
    author={One, Author and Two, Author and Namboodiri, Anoop M.},
    booktitle={IEEE Conference on Computer Vision and Pattern Recognition (CVPR)},
    year={2024}
  }
---

## Abstract
Your abstract here...

## Methodology & Equations
Math equations in standard LaTeX:
$$
\mathcal{L}_{\text{total}} = \mathcal{L}_{\text{ce}} + \lambda \mathcal{L}_{\text{reg}}
$$

## Interactive Viewer
<iframe src="./demo.html" width="100%" height="450" style="border: 1px solid var(--color-border); border-radius: 8px;"></iframe>
```

---

## 🌐 Publishing to GitHub Pages

Every commit pushed or merged to `main` triggers `.github/workflows/deploy.yml`:
1. Runs `bun run build`.
2. Automatically packages and publishes the static site using GitHub's official `actions/deploy-pages`.

### Repository One-Time Configuration
Under **Settings → Pages** in your GitHub repository:
- **Build and deployment → Source**: Select **GitHub Actions**.
