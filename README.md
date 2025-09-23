# CodeYouTube 🎥💻

A powerful web-based code editor with integrated YouTube video player for following coding tutorials. Built with React and Vite.

## ✨ Features

### 🎬 **Video Integration**
- **YouTube video embedding** with URL parsing
- **Playlist support** with navigation controls
- **Real-time video loading** from URLs
- **Shareable video sessions** with URL parameters

### 💻 **Code Editor**
- **Monaco Editor** with syntax highlighting
- **Multi-language support** (HTML, CSS, JavaScript)
- **IntelliSense** and auto-completion
- **Live code preview** with automatic updates

### 🎨 **UI/UX**
- **Resizable panels** with drag handles
- **Dark/light theme** toggle
- **Responsive design** for all devices
- **Panel visibility controls** with checkboxes
- **Keyboard shortcuts** for productivity

### ⌨️ **Keyboard Shortcuts**
- `Ctrl/Cmd + 1-3`: Switch editor tabs
- `Ctrl/Cmd + Enter`: Update preview
- `Ctrl/Cmd + D`: Toggle theme
- `Ctrl/Cmd + R`: Reset panel sizes

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+ 
- YouTube Data API v3 key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CodeYT
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your YouTube API key:
   ```
   VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🔑 **Getting YouTube API Key**

1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select existing one
3. Enable **YouTube Data API v3**
4. Create credentials (API Key)
5. Add the API key to your `.env` file

## 📦 **Deployment**

### Netlify Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variable: `VITE_YOUTUBE_API_KEY`

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```
   
3. **Add environment variables** in Vercel dashboard

### Manual Deployment

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Upload `dist` folder** to your hosting provider

3. **Configure environment variables** on your hosting platform

## 🛠️ **Tech Stack**

- **Frontend**: React 19, Vite 7
- **Editor**: Monaco Editor (@monaco-editor/react 4.6.0)
- **Styling**: CSS Custom Properties, Flexbox, Grid
- **API**: YouTube Data API v3
- **Build Tool**: Vite with HMR

## 📁 **Project Structure**

```
CodeYT/
├── src/
│   ├── App.jsx          # Main application component
│   ├── App.css          # Application styles
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── .env.example         # Environment variables template
├── package.json         # Dependencies and scripts
└── vite.config.js       # Vite configuration
```

## 🌐 **URL Parameters**

The application supports various URL parameters for direct video/playlist loading:

- `?v=VIDEO_ID` - Load specific video
- `?list=PLAYLIST_ID` - Load playlist (first video)
- `?v=VIDEO_ID&list=PLAYLIST_ID` - Load specific video in playlist context

## 🔧 **Configuration**

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_YOUTUBE_API_KEY` | YouTube Data API v3 key | Yes |

### API Limits

- YouTube API has daily quotas
- Consider implementing caching for production
- Monitor API usage in Google Cloud Console

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 **License**

This project is licensed under the MIT License.

## 🆘 **Support**

For support and questions:
- Create an issue on GitHub
- Check existing documentation
- Review API quotas and limits

---

**Made with ❤️ for developers learning through video tutorials**
