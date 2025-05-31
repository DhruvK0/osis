import React, { useState } from 'react';

const App = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('Ready to find and click Slack');

  const handleFindAndClickSlack = async () => {
    setIsProcessing(true);
    setStatus('Taking screenshot...');

    try {
      // Take screenshot
      const screenshot = await window.electronAPI.takeScreenshot();
      setStatus('Analyzing screenshot with AI...');

      // Send to OpenAI Vision API to find Slack icon
      const coordinates = await window.electronAPI.findSlackIcon(screenshot);
      setStatus(`Found Slack at coordinates: ${coordinates.x}, ${coordinates.y}`);

      // Click on the Slack icon
      await window.electronAPI.clickAtCoordinates(coordinates.x, coordinates.y);
      setStatus('Successfully clicked on Slack!');

    } catch (error) {
      console.error('Error:', error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="app">
      <div className="main-content">
        <div className="slack-finder">
          <h1>🤖 OSIS - Slack Finder</h1>
          <p className="description">
            Click the button below to automatically find and open Slack on your screen
          </p>
          
          <button 
            className={`find-slack-button ${isProcessing ? 'processing' : ''}`}
            onClick={handleFindAndClickSlack}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="spinner">⏳</span>
                Processing...
              </>
            ) : (
              <>
                <span>🎯</span>
                Find & Click Slack
              </>
            )}
          </button>

          <div className="status">
            <p>{status}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App; 