# PDFRendr Deployment Guide

## GitHub Pages Setup for pdfrendr.github.io

### Repository Configuration

1. **Repository Name**: Must be `pdfrendr.github.io` for the organization
2. **Branch**: Deploy from `main` branch
3. **Directory**: Deploy from `/dist-github/` directory

### Build Process

The deployment uses GitHub Actions to automatically build and deploy:

```bash
# Local build for testing
npm run build:pages

# This runs:
# 1. npm run build:library  - Builds the PDFRendr UMD library
# 2. npm run build:react    - Builds the React frontend  
# 3. npm run copy:assets    - Copies assets to dist-github/
```

### GitHub Actions Workflow

The `.github/workflows/deploy.yml` automatically:
- Installs dependencies for both root and frontend
- Builds the PDFRendr library as UMD module
- Builds the React frontend with Vite
- Copies all necessary assets
- Deploys to GitHub Pages

### Files Deployed

```
dist-github/
├── index.html              # React app entry point
├── assets/
│   ├── index-[hash].css     # Compiled Tailwind CSS
│   └── index-[hash].js      # React app bundle
├── pdfrendr.umd.cjs         # PDFRendr library
├── pdf.worker.min.js        # PDF.js worker
├── logo.png                 # PDFRendr logo
└── CNAME                    # Custom domain file
```

### Local Development

```bash
# Frontend development
cd frontend
npm run dev  # Starts dev server on :3001

# Test production build locally
npm run build:pages
npx http-server dist-github -p 3000
```

### Deployment Steps

1. Push changes to `main` branch
2. GitHub Actions automatically builds and deploys
3. Site available at `https://pdfrendr.github.io`

### Manual Deployment (if needed)

```bash
# Build everything
npm run build:pages

# The dist-github/ folder is ready for deployment
# Can be manually uploaded to any static hosting
```

### Environment Requirements

- Node.js 18+
- npm 8+
- Modern browser with ES2015+ support
- WebAssembly support for PDF.js

### Troubleshooting

- **CSS not loading**: Check that Tailwind CSS is being processed correctly
- **Library not found**: Ensure `pdfrendr.umd.cjs` is in the root of the deployed site
- **PDF.js errors**: Verify `pdf.worker.min.js` is accessible
- **Module errors**: Ensure the UMD library is loaded before the React app initializes