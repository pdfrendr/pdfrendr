# GitHub Pages Setup Instructions

To enable GitHub Pages deployment for this repository, follow these steps:

## 🔧 Repository Settings

1. **Go to Repository Settings**
   - Navigate to your GitHub repository
   - Click on "Settings" tab

2. **Enable GitHub Pages**
   - Scroll down to "Pages" section (in left sidebar)
   - Under "Source", select **"GitHub Actions"**
   - Save the settings

3. **Set Repository Permissions**
   - Go to "Actions" → "General" in repository settings
   - Under "Workflow permissions", select:
     - ✅ **"Read and write permissions"**
     - ✅ **"Allow GitHub Actions to create and approve pull requests"**
   - Save the settings

## 🚀 Deployment Process

After setup, the deployment will:

1. **Auto-trigger** on every push to `main` branch
2. **Build** the PDFRendr library and React frontend
3. **Deploy** to `https://[username].github.io/[repository-name]`

## 📋 Manual Deployment

If you need to manually trigger deployment:

```bash
git push origin main
```

## 🔍 Troubleshooting

### Common Issues:

- **"Pages not enabled"** → Follow step 2 above
- **"Insufficient permissions"** → Follow step 3 above  
- **"Build failed"** → Check Actions tab for error details

### Debug Commands:

```bash
# Test local build
npm run build:library
cd frontend && npm run build

# Check if files are created
ls -la dist-github/
```

## 📖 Expected Result

After successful deployment, your demo will be live at:
**`https://pdfrendr.github.io`** (or your GitHub Pages URL)

The demo includes:
- ✅ Complete PDF processing interface
- ✅ 17-pattern threat detection
- ✅ Drag & drop file upload
- ✅ Real-time processing with progress
- ✅ Download processed PDFs
