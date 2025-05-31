import React, { useState } from 'react'
import './App.css'

function App() {
  const [status, setStatus] = useState('Ready to find Slack icon')
  const [isProcessing, setIsProcessing] = useState(false)
  const [screenshotData, setScreenshotData] = useState(null)
  const [coordinates, setCoordinates] = useState(null)

  const handleFindAndClick = async () => {
    setIsProcessing(true)
    setStatus('Taking screenshot...')
    
    try {
      // Take screenshot and get screen info
      const screenshotResult = await window.electronAPI.takeScreenshot()
      setScreenshotData(screenshotResult)
      setStatus('Analyzing screenshot with AI...')
      
      // Find Slack icon using AI
      const coords = await window.electronAPI.findSlackIcon(screenshotResult)
      setCoordinates(coords)
      setStatus(`Found Slack icon at (${coords.x}, ${coords.y}). Clicking...`)
      
      // Click on the coordinates
      const clickResult = await window.electronAPI.clickMouse(coords.x, coords.y)
      
      if (clickResult.success) {
        setStatus(`Successfully clicked Slack icon at (${coords.x}, ${coords.y})`)
      } else {
        setStatus('Failed to click on Slack icon')
      }
    } catch (error) {
      console.error('Error:', error)
      setStatus(`Error: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="app">
      <div className="container">
        <h1>Slack Icon Finder</h1>
        <p className="description">
          Click the button below to automatically find and click the Slack icon on your screen.
        </p>
        
        <button 
          onClick={handleFindAndClick}
          disabled={isProcessing}
          className="main-button"
        >
          {isProcessing ? 'Processing...' : 'Find and Click Slack Icon'}
        </button>
        
        <div className="status">
          <strong>Status:</strong> {status}
        </div>

        {screenshotData && (
          <div className="info">
            <h3>Screen Information:</h3>
            <p>Width: {screenshotData.screenWidth}px</p>
            <p>Height: {screenshotData.screenHeight}px</p>
            <p>Scale Factor: {screenshotData.scaleFactor}</p>
          </div>
        )}

        {coordinates && (
          <div className="info">
            <h3>Detected Coordinates:</h3>
            <p>X: {coordinates.x}</p>
            <p>Y: {coordinates.y}</p>
          </div>
        )}

        {screenshotData && (
          <div className="screenshot-preview">
            <h3>Screenshot Preview:</h3>
            <img 
              src={`data:image/png;base64,${screenshotData.image}`} 
              alt="Screenshot" 
              style={{ maxWidth: '100%', maxHeight: '400px', border: '1px solid #ccc' }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default App 