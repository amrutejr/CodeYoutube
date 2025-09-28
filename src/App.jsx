import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import './App.css'

function App() {
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [videoId, setVideoId] = useState('')
  const [isLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('html')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [panelWidths, setPanelWidths] = useState({
    video: 33.33,
    editor: 33.33,
    preview: 33.34
  })
  const [panelVisibility, setPanelVisibility] = useState({
    video: true,
    editor: true,
    preview: true
  })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState(null)
  const [startX, setStartX] = useState(0)
  const [startWidths, setStartWidths] = useState({ video: 0, editor: 0, preview: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const resizeTimeoutRef = useRef(null)
  const [code, setCode] = useState({
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Project</title>
</head>
<body>
    <h1>Hello CodeYouTube!</h1>
    <p>Start coding along with your tutorial!</p>
</body>
</html>`,
    css: `body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;


h1 {
    text-align: center;
    margin-bottom: 20px;
}

p {
    text-align: center;
    font-size: 18px;
}`,
    javascript: `// Welcome to CodeYouTube!
// Write your JavaScript code here

console.log('Hello from CodeYouTube!');

// Example: Add interactivity
document.addEventListener('DOMContentLoaded', function() {
    const h1 = document.querySelector('h1');
    if (h1) {
        h1.addEventListener('click', function() {
            this.style.color = this.style.color === 'yellow' ? 'white' : 'yellow';
        });
    }
});`
  })

  const previewRef = useRef(null)
  const fullscreenPreviewRef = useRef(null)

  // Extract YouTube video ID from URL
  const extractVideoId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }


  // Get URL parameters
  const getUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search)
    return {
      v: urlParams.get('v'), // YouTube video ID
      list: urlParams.get('list'), // YouTube playlist ID
      index: urlParams.get('index'), // Video index in playlist
      watch: urlParams.get('watch') // Alternative parameter name
    }
  }

  // Update browser URL with current video
  const updateBrowserUrl = (videoId) => {
    if (videoId) {
      const newUrl = `${window.location.origin}${window.location.pathname}?v=${videoId}`
      window.history.pushState({ videoId }, '', newUrl)
    } else {
      const newUrl = `${window.location.origin}${window.location.pathname}`
      window.history.pushState({}, '', newUrl)
    }
  }

  // Load YouTube video
  const loadVideo = () => {
    const videoId = extractVideoId(youtubeUrl)
    
    if (videoId) {
      setVideoId(videoId)
      updateBrowserUrl(videoId)
    } else {
      alert('Please enter a valid YouTube video URL')
    }
  }


  // Load video from URL parameters
  const loadVideoFromUrl = () => {
    const params = getUrlParams()
    let videoIdFromUrl = null

    // Check for direct video ID in 'v' parameter
    if (params.v) {
      videoIdFromUrl = params.v
    }
    // Check for 'watch' parameter (for URLs like ?watch=v=VIDEO_ID)
    else if (params.watch) {
      const watchParam = params.watch
      if (watchParam.startsWith('v=')) {
        videoIdFromUrl = watchParam.substring(2)
      } else {
        videoIdFromUrl = watchParam
      }
    }

    // Validate video ID format (YouTube video IDs are 11 characters)
    if (videoIdFromUrl && videoIdFromUrl.length === 11) {
      setVideoId(videoIdFromUrl)
      setYoutubeUrl(`https://www.youtube.com/watch?v=${videoIdFromUrl}`)
      return true
    }
    
    return false
  }

  // Navigate playlist (previous/next video)
  const navigatePlaylist = (direction) => {
    if (!isPlaylistMode || !playlistVideos.length) return

    let newIndex = currentVideoIndex
    if (direction === 'next' && currentVideoIndex < playlistVideos.length - 1) {
      newIndex = currentVideoIndex + 1
    } else if (direction === 'prev' && currentVideoIndex > 0) {
      newIndex = currentVideoIndex - 1
    }

    if (newIndex !== currentVideoIndex) {
      const newVideo = playlistVideos[newIndex]
      if (newVideo) {
        setCurrentVideoIndex(newIndex)
        setVideoId(newVideo.id)
        setYoutubeUrl(`https://www.youtube.com/watch?v=${newVideo.id}&list=${playlistId}`)
        updateBrowserUrl(newVideo.id)
      }
    }
  }

  // Share current video URL
  const shareVideo = () => {
    if (videoId) {
      const shareUrl = `${window.location.origin}${window.location.pathname}?v=${videoId}`
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Share URL copied to clipboard!')
      }).catch(() => {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea')
        textArea.value = shareUrl
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        alert('Share URL copied to clipboard!')
      })
    } else {
      alert('No video loaded to share')
    }
  }

  // Handle code changes
  const handleCodeChange = (value) => {
    setCode(prev => ({
      ...prev,
      [activeTab]: value || ''
    }))
  }

  // Update preview
  const updatePreview = () => {
    const fullCode = `
      ${code.html}
      <style>${code.css}</style>
      <script>${code.javascript}</script>
    `
    
    // Update regular preview
    if (previewRef.current) {
      const iframe = previewRef.current
      const doc = iframe.contentDocument || iframe.contentWindow.document
      
      doc.open()
      doc.write(fullCode)
      doc.close()
    }
    
    // Update fullscreen preview if it exists
    if (fullscreenPreviewRef.current) {
      const iframe = fullscreenPreviewRef.current
      const doc = iframe.contentDocument || iframe.contentWindow.document
      
      doc.open()
      doc.write(fullCode)
      doc.close()
    }
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  // Reset panel sizes to default
  const resetPanels = () => {
    setPanelWidths({
      video: 33.33,
      editor: 33.33,
      preview: 33.34
    })
  }

  // Toggle panel visibility
  const togglePanelVisibility = (panel) => {
    setPanelVisibility(prev => ({
      ...prev,
      [panel]: !prev[panel]
    }))
  }

  // Toggle fullscreen preview
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Calculate dynamic widths based on visible panels
  const getVisiblePanels = () => {
    const visible = Object.entries(panelVisibility).filter(([_, isVisible]) => isVisible)
    return visible.map(([panel]) => panel)
  }

  const calculateDynamicWidths = () => {
    const visiblePanels = getVisiblePanels()
    const visibleCount = visiblePanels.length
    
    if (visibleCount === 0) return { video: 0, editor: 0, preview: 0 }
    if (visibleCount === 1) return { 
      video: visiblePanels.includes('video') ? 100 : 0,
      editor: visiblePanels.includes('editor') ? 100 : 0,
      preview: visiblePanels.includes('preview') ? 100 : 0
    }
    
    // Calculate proportional widths for visible panels
    const totalVisibleWidth = visiblePanels.reduce((sum, panel) => sum + panelWidths[panel], 0)
    const result = { video: 0, editor: 0, preview: 0 }
    
    visiblePanels.forEach(panel => {
      result[panel] = (panelWidths[panel] / totalVisibleWidth) * 100
    })
    
    return result
  }

  // Resize functionality
  const handleMouseDown = (handle) => (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const container = document.querySelector('.main-content.resizable')
    if (!container) return
    
    const containerRect = container.getBoundingClientRect()
    
    setIsResizing(true)
    setResizeHandle(handle)
    setStartX(e.clientX)
    setStartWidths({ ...panelWidths })
    
    // Add visual feedback
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const handleMouseMove = (e) => {
    if (!isResizing || !resizeHandle) return

    const container = document.querySelector('.main-content.resizable')
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const containerWidth = containerRect.width
    const deltaX = e.clientX - startX
    const deltaPercentage = (deltaX / containerWidth) * 100

    // Minimum and maximum width constraints
    const minWidth = 15
    const maxWidth = 70

    let newWidths = { ...startWidths }

    if (resizeHandle === 'video-editor') {
      // Adjust video and editor panels, keep preview proportional
      const newVideoWidth = Math.max(minWidth, Math.min(maxWidth, startWidths.video + deltaPercentage))
      const newEditorWidth = Math.max(minWidth, Math.min(maxWidth, startWidths.editor - deltaPercentage))
      
      // Ensure both panels respect constraints
      if (newVideoWidth >= minWidth && newVideoWidth <= maxWidth && 
          newEditorWidth >= minWidth && newEditorWidth <= maxWidth) {
        newWidths = {
          video: newVideoWidth,
          editor: newEditorWidth,
          preview: startWidths.preview
        }
      }
    } else if (resizeHandle === 'editor-preview') {
      // Adjust editor and preview panels, keep video fixed
      const newEditorWidth = Math.max(minWidth, Math.min(maxWidth, startWidths.editor + deltaPercentage))
      const newPreviewWidth = Math.max(minWidth, Math.min(maxWidth, startWidths.preview - deltaPercentage))
      
      // Ensure both panels respect constraints
      if (newEditorWidth >= minWidth && newEditorWidth <= maxWidth && 
          newPreviewWidth >= minWidth && newPreviewWidth <= maxWidth) {
        newWidths = {
          video: startWidths.video,
          editor: newEditorWidth,
          preview: newPreviewWidth
        }
      }
    }

    // Normalize to ensure total is 100%
    const total = newWidths.video + newWidths.editor + newWidths.preview
    if (total > 0) {
      // Clear any existing timeout
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
      
      // Update immediately for smooth visual feedback
      setPanelWidths({
        video: (newWidths.video / total) * 100,
        editor: (newWidths.editor / total) * 100,
        preview: (newWidths.preview / total) * 100
      })
    }
  }

  const handleMouseUp = () => {
    setIsResizing(false)
    setResizeHandle(null)
    setStartX(0)
    setStartWidths({ video: 0, editor: 0, preview: 0 })
    
    // Remove visual feedback
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  // Add mouse event listeners for resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      // Prevent text selection during resize
      document.addEventListener('selectstart', (e) => e.preventDefault())
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('selectstart', (e) => e.preventDefault())
    }
  }, [isResizing, resizeHandle, startX, startWidths])


  // Load video from URL parameters on component mount
  useEffect(() => {
    loadVideoFromUrl()
  }, [])

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.videoId) {
        setVideoId(event.state.videoId)
        setYoutubeUrl(`https://www.youtube.com/watch?v=${event.state.videoId}`)
      } else {
        loadVideoFromUrl()
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Auto-update preview when code changes
  useEffect(() => {
    const timer = setTimeout(updatePreview, 500)
    return () => clearTimeout(timer)
  }, [code])

  return (
    <div className={`app ${isDarkMode ? 'dark' : 'light'}`}>
      <header className="header">
        <h1>CodeYouTube</h1>
        
        <div className="header-controls">
          {/* Panel Visibility Controls */}
          <div className="panel-controls">
            <label className="panel-checkbox">
              <input
                type="checkbox"
                checked={panelVisibility.video}
                onChange={() => togglePanelVisibility('video')}
              />
              <span>🎬 Video</span>
            </label>
            <label className="panel-checkbox">
              <input
                type="checkbox"
                checked={panelVisibility.editor}
                onChange={() => togglePanelVisibility('editor')}
              />
              <span>💻 Editor</span>
            </label>
            <label className="panel-checkbox">
              <input
                type="checkbox"
                checked={panelVisibility.preview}
                onChange={() => togglePanelVisibility('preview')}
              />
              <span>👁️ Preview</span>
            </label>
          </div>

          {/* Reset and Theme Controls */}
          <div className="action-controls">
            <button className="reset-button" onClick={resetPanels} title="Reset panel sizes">
              🔄 Reset
            </button>
            <button className="theme-toggle" onClick={toggleDarkMode} title="Toggle theme">
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      <div className={`main-content resizable ${isResizing ? 'resizing' : ''}`}>
        {/* YouTube Panel */}
        {panelVisibility.video && (
          <div className="video-panel" style={{ width: `${calculateDynamicWidths().video}%` }}>
          <div className="video-controls">
            <input
              type="text"
              placeholder="Paste YouTube video URL here..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && loadVideo()}
            />
            <button onClick={loadVideo} disabled={isLoading}>
              {isLoading ? '⏳ Loading...' : 'Load Video'}
            </button>
            {videoId && (
              <button onClick={shareVideo} title="Share this video session">
                🔗 Share
              </button>
            )}
          </div>
          
          {videoId ? (
            <div className="video-container">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="video-placeholder">
              <p>🎬 Load a YouTube video to get started!</p>
            </div>
          )}
          </div>
        )}

        {/* Resize Handle 1: Between Video and Editor */}
        {panelVisibility.video && panelVisibility.editor && (
          <div 
            className={`resize-handle ${isResizing && resizeHandle === 'video-editor' ? 'active' : ''}`}
            onMouseDown={handleMouseDown('video-editor')}
          >
            <div className="resize-line"></div>
          </div>
        )}

        {/* Editor Panel */}
        {panelVisibility.editor && (
          <div className="editor-panel" style={{ width: `${calculateDynamicWidths().editor}%` }}>
          <div className="editor-tabs">
            <button
              className={`tab ${activeTab === 'html' ? 'active' : ''}`}
              onClick={() => setActiveTab('html')}
            >
              HTML
            </button>
            <button
              className={`tab ${activeTab === 'css' ? 'active' : ''}`}
              onClick={() => setActiveTab('css')}
            >
              CSS
            </button>
            <button
              className={`tab ${activeTab === 'javascript' ? 'active' : ''}`}
              onClick={() => setActiveTab('javascript')}
            >
              JavaScript
            </button>
          </div>
          
          <div className="editor-container">
            <Editor
              height="100%"
              language={activeTab === 'javascript' ? 'javascript' : activeTab}
              theme={isDarkMode ? 'vs-dark' : 'vs-light'}
              value={code[activeTab]}
              onChange={handleCodeChange}
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on'
              }}
            />
          </div>
          </div>
        )}

        {/* Resize Handle 2: Between Editor and Preview */}
        {panelVisibility.editor && panelVisibility.preview && (
          <div 
            className={`resize-handle ${isResizing && resizeHandle === 'editor-preview' ? 'active' : ''}`}
            onMouseDown={handleMouseDown('editor-preview')}
          >
            <div className="resize-line"></div>
          </div>
        )}

        {/* Preview Panel */}
        {panelVisibility.preview && (
          <div className="preview-panel" style={{ width: `${calculateDynamicWidths().preview}%` }}>
          <div className="preview-header">
            <span>Preview</span>
            <div className="preview-controls">
              <button className="preview-fullscreen" onClick={toggleFullscreen} title="Toggle fullscreen">
                {isFullscreen ? '🗗' : '🗖'} {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </button>
              <button className="preview-refresh" onClick={updatePreview}>
                🔄 Refresh
              </button>
            </div>
          </div>
          
          <div className="preview-container">
            <iframe
              ref={previewRef}
              title="Code Preview"
              sandbox="allow-scripts allow-same-origin"
            ></iframe>
          </div>
          </div>
        )}
      </div>

      {/* Fullscreen Preview Overlay */}
      {isFullscreen && (
        <div className="fullscreen-overlay">
          <div className="fullscreen-header">
            <span>Preview - Fullscreen Mode</span>
            <div className="fullscreen-controls">
              <button className="preview-refresh" onClick={updatePreview}>
                🔄 Refresh
              </button>
              <button className="fullscreen-exit" onClick={toggleFullscreen}>
                🗗 Exit Fullscreen
              </button>
            </div>
          </div>
          <div className="fullscreen-preview">
            <iframe
              ref={fullscreenPreviewRef}
              title="Code Preview - Fullscreen"
              sandbox="allow-scripts allow-same-origin"
            ></iframe>
          </div>
        </div>
      )}

    </div>
  )
}

export default App
