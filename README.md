# Markdown to PDF

A frontend-only Markdown to PDF converter with live preview. Built with React 19, TypeScript, and Vite.

![Markdown to PDF](https://img.shields.io/badge/markdown-to%20pdf-blue)
![React 19](https://img.shields.io/badge/react-19-61dafb)
![TypeScript](https://img.shields.io/badge/typescript-5.9-3178c6)
![Vite](https://img.shields.io/badge/vite-7-646cff)
![Docker](https://img.shields.io/badge/docker-ready-2496ED?logo=docker)

## ✨ Features

- 📝 **Live Preview** - See your markdown rendered in real-time as you type
- 🖨️ **Export to PDF** - Uses browser's native print-to-PDF for high-quality output
- 💾 **Save/Load Markdown** - Import and export `.md` files
- ✅ **Selectable Text** - PDFs have real, selectable, searchable text (not images!)
- 🔗 **Clickable Links** - Links in PDFs are preserved and clickable
- 📊 **GitHub Flavored Markdown** - Supports tables, strikethrough, task lists, and more
- 🎨 **Clean UI** - Modern dark-themed editor with split-pane preview
- 📱 **No Server Required** - Runs entirely in the browser

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Visit `http://localhost:5173` to use the application.

### 🐳 Docker

#### Build and Run with Docker

```bash
# Build the Docker image
docker build -t mdtopdf .

# Run the container
docker run -d -p 8080:80 --name mdtopdf mdtopdf

# Access the application
# Open http://localhost:8080/mdtopdf/ in your browser
```

#### Using Docker Compose

```bash
# Start the application
docker-compose up -d

# Stop the application
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# View logs
docker-compose logs -f
```

Access the application at `http://localhost:8080/mdtopdf/`

> **Note:** For development with hot-reload, you can copy `docker-compose.override.yml.example` to `docker-compose.override.yml` and run `docker-compose up`. This will mount your source files and run the dev server.

#### Docker Management Commands

```bash
# View running containers
docker ps

# View logs
docker logs mdtopdf

# Stop the container
docker stop mdtopdf

# Start the container
docker start mdtopdf

# Remove the container
docker rm mdtopdf

# Remove the image
docker rmi mdtopdf
```

#### Docker Architecture

The Docker setup uses a **multi-stage build** for optimal image size:

1. **Build Stage** - Uses `node:20-alpine` to install dependencies and build the application
2. **Production Stage** - Uses `nginx:alpine` to serve the static files

**Final image size:** ~45MB (compared to ~1GB if using Node.js to serve)

The application runs on the `/mdtopdf` path, configured through:
- Vite's `base` setting in `vite.config.ts`
- Nginx configuration in `nginx.conf`

## 📖 Usage

1. **Type or Paste Markdown** - Use the editor on the left to write your markdown
2. **See Live Preview** - Watch the formatted output on the right update in real-time
3. **Export to PDF** - Click "Export PDF" and save from your browser's print dialog
4. **Save/Load** - Use "Save MD" to download your markdown or "Load MD" to import a file

### Supported Markdown Features

- Headers (H1, H2, H3)
- **Bold**, *Italic*, and ~~Strikethrough~~ text
- `Inline code` and code blocks with syntax highlighting
- Ordered and unordered lists
- Blockquotes
- Links and images
- Tables
- Horizontal rules
- Task lists

## 🛠️ Tech Stack

- **React 19** - Latest React with modern hooks
- **TypeScript 5.9** - Strict type checking
- **Vite 7** - Lightning-fast build tool
- **Tailwind CSS v4** - Utility-first CSS with new Vite plugin
- **react-markdown** - Markdown parsing and rendering
- **remark-gfm** - GitHub Flavored Markdown support

## 🎨 How It Works

This application uses a unique approach to PDF generation:

1. **No PDF Libraries** - Instead of using jsPDF or pdfmake, we leverage the browser's native print functionality
2. **Print CSS** - Uses `@media print` queries to optimize the layout for printing
3. **Real Text** - The PDF contains actual selectable text, not rendered images
4. **Perfect Typography** - Browser rendering ensures high-quality, scalable text

### Benefits

- ✅ Smaller file sizes
- ✅ Perfect text selection and copying
- ✅ No pixelation at any zoom level
- ✅ Clickable links preserved
- ✅ Native browser rendering (no compatibility issues)

## � Project Structure

```
mdtopdf/
├── src/                    # React application source
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles with Tailwind
├── public/                # Static assets
├── Dockerfile             # Multi-stage Docker build
├── docker-compose.yml     # Docker Compose configuration
├── nginx.conf             # Nginx configuration for serving app
├── .dockerignore          # Files to exclude from Docker build
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Project dependencies
```

## �📦 Dependencies

```json
{
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "react-markdown": "^10.1.0",
  "remark-gfm": "^4.0.1",
  "tailwindcss": "^4.1.17"
}
```

## 🚢 Deployment

This project is configured for GitHub Pages deployment.

### GitHub Pages Setup

1. Go to your repository settings
2. Navigate to **Pages** section
3. Under **Build and deployment**:
   - Source: Select **GitHub Actions**
4. Push to `main` branch to trigger automatic deployment

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will:
- Install dependencies
- Run the build
- Deploy to GitHub Pages

Your site will be available at: `https://[username].github.io/mdtopdf/`

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

## Original Vite + React + TypeScript Template Notes

### Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
