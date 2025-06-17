require('dotenv').config()

const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const screenshot = require('screenshot-desktop')
const { spawn } = require('child_process')
const { GoogleGenAI } = require('@google/genai')

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // Load the built React app
  win.loadFile(path.join(__dirname, 'dist', 'index.html'))
  
  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools()
  }
}

// IPC Handlers

// Screenshot handler
ipcMain.handle('screenshot:take', async () => {
  try {
    const img = await screenshot({ format: 'png' })
    
    // Get screen dimensions
    const { screen } = require('electron')
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.bounds
    const scaleFactor = primaryDisplay.scaleFactor
    
    return {
      image: img.toString('base64'),
      screenWidth: width,
      screenHeight: height,
      scaleFactor: scaleFactor
    }
  } catch (error) {
    console.error('Screenshot error:', error)
    throw new Error('Failed to take screenshot')
  }
})

// Gemini Vision API handler
ipcMain.handle('ai:findSlackIcon', async (event, screenshotData) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not found. Please set GEMINI_API_KEY environment variable.')
    }

    const { image: imageBase64, screenWidth, screenHeight, scaleFactor } = screenshotData

    // Load the reference Slack icon
    const fs = require('fs')
    let slackIconBase64 = null
    
    try {
      const slackIconPath = path.join(__dirname, 'assets', 'slack-icon.png')
      const slackIconBuffer = fs.readFileSync(slackIconPath)
      slackIconBase64 = slackIconBuffer.toString('base64')
      console.log('Loaded Slack icon reference image')
    } catch (iconError) {
      console.warn('Could not load Slack icon reference image:', iconError.message)
    }

    const prompt = `Please analyze this screenshot and find the Slack application icon that matches the reference icon provided. 

IMPORTANT: This screenshot is from a screen with dimensions ${screenWidth}x${screenHeight} pixels (scale factor: ${scaleFactor}). 

Look for an icon that closely matches the reference Slack icon image. The icon might be in the taskbar, desktop, or system tray.

REFERENCE INFORMATION: On this particular screen setup, the Slack icon has previously been found at coordinates (1310, 1030). Use this as a reference point to help locate the icon, but provide the actual current coordinates you detect in the screenshot.

Return ONLY a JSON object with the x and y coordinates of the center of the Slack icon. The coordinates should be relative to the top-left corner of the screen and match the actual screen dimensions of ${screenWidth}x${screenHeight}.

If you cannot find the Slack icon that matches the reference, return {"error": "Slack icon not found"}. 

Format: {"x": number, "y": number}

Make sure the coordinates are within the screen bounds (0-${screenWidth} for x, 0-${screenHeight} for y).

Pay special attention to the area around coordinates (1310, 1030) as that's where the Slack icon is typically located on this system.`

    // Use the correct Gemini API structure
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    // Prepare content array
    const contentArray = [prompt]
    
    // Add reference Slack icon if available
    if (slackIconBase64) {
      contentArray.push({
        inlineData: {
          data: slackIconBase64,
          mimeType: "image/png"
        }
      })
    }
    
    // Add the screenshot
    contentArray.push({
      inlineData: {
        data: imageBase64,
        mimeType: "image/png"
      }
    })

    const response = await model.generateContent(contentArray)
    
    const content = response.response.text()
    console.log('Gemini response:', content)
    console.log('Screen info:', { screenWidth, screenHeight, scaleFactor })
    
    // Extract JSON from the response (Gemini might include extra text)
    const jsonMatch = content.match(/\{[^}]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response')
    }
    
    const coordinates = JSON.parse(jsonMatch[0])
    
    if (coordinates.error) {
      throw new Error(coordinates.error)
    }
    
    // Validate coordinates
    if (typeof coordinates.x !== 'number' || typeof coordinates.y !== 'number') {
      throw new Error('Invalid coordinates received from AI')
    }
    
    console.log('Final Slack icon coordinates:', coordinates)
    
    return coordinates
  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error(`AI analysis failed: ${error.message}`)
  }
})

// Gemini Vision API handler for finding Dhruv Kanetkar DM
ipcMain.handle('ai:findDhruvDM', async (event, screenshotData) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not found. Please set GEMINI_API_KEY environment variable.')
    }

    const { image: imageBase64, screenWidth, screenHeight, scaleFactor } = screenshotData

    console.log('Starting Dhruv DM search with screen dimensions:', { screenWidth, screenHeight, scaleFactor })

    const prompt = `Please analyze this Slack application screenshot and find the direct message channel or conversation with "Dhruv Kanetkar". 

IMPORTANT: This screenshot is from a screen with dimensions ${screenWidth}x${screenHeight} pixels (scale factor: ${scaleFactor}). 

Look for:
- A direct message entry with the name "Dhruv Kanetkar" 
- This could be in the left sidebar under "Direct messages" section
- It might show as "Dhruv Kanetkar" or just "Dhruv" 
- Look for a clickable area that represents this person's DM channel
- The name might appear in a list of conversations or channels

Return ONLY a JSON object with the x and y coordinates of the center of the clickable area for Dhruv Kanetkar's direct message. The coordinates should be relative to the top-left corner of the screen and match the actual screen dimensions of ${screenWidth}x${screenHeight}.

If you cannot find Dhruv Kanetkar's direct message channel, return {"error": "Dhruv Kanetkar DM not found"}. 

Format: {"x": number, "y": number}

Make sure the coordinates are within the screen bounds (0-${screenWidth} for x, 0-${screenHeight} for y).`

    // Use the correct Gemini API structure
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const response = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/png"
        }
      }
    ])
    
    const content = response.response.text()
    console.log('Gemini response for Dhruv DM:', content)
    console.log('Screen info:', { screenWidth, screenHeight, scaleFactor })
    
    // Extract JSON from the response (Gemini might include extra text)
    const jsonMatch = content.match(/\{[^}]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', content)
      throw new Error('No valid JSON found in response')
    }
    
    const coordinates = JSON.parse(jsonMatch[0])
    
    if (coordinates.error) {
      throw new Error(coordinates.error)
    }
    
    // Validate coordinates
    if (typeof coordinates.x !== 'number' || typeof coordinates.y !== 'number') {
      throw new Error('Invalid coordinates received from AI')
    }
    
    if (coordinates.x < 0 || coordinates.x > screenWidth || coordinates.y < 0 || coordinates.y > screenHeight) {
      console.warn('Coordinates out of bounds:', coordinates, 'Screen:', { screenWidth, screenHeight })
    }
    
    console.log('Final Dhruv DM coordinates:', coordinates)
    
    return coordinates
  } catch (error) {
    console.error('Gemini API error for Dhruv DM:', error)
    throw new Error(`AI analysis failed: ${error.message}`)
  }
})

// Mouse click handler using direct PowerShell
ipcMain.handle('mouse:click', async (event, x, y) => {
  try {
    // Use a simpler PowerShell command for mouse clicking
    const powershellCommand = `
      Add-Type -AssemblyName System.Windows.Forms
      Add-Type -AssemblyName System.Drawing
      
      # Set cursor position
      [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${x}, ${y})
      
      # Wait a moment for cursor to move
      Start-Sleep -Milliseconds 100
      
      # Perform mouse click using Windows API
      Add-Type @"
        using System;
        using System.Runtime.InteropServices;
        public class MouseClick {
          [DllImport("user32.dll", CharSet = CharSet.Auto, CallingConvention = CallingConvention.StdCall)]
          public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint cButtons, uint dwExtraInfo);
          
          public static void Click() {
            mouse_event(0x02, 0, 0, 0, 0); // MOUSEEVENTF_LEFTDOWN
            mouse_event(0x04, 0, 0, 0, 0); // MOUSEEVENTF_LEFTUP
          }
        }
"@
      
      [MouseClick]::Click()
    `
    
    return new Promise((resolve, reject) => {
      const process = spawn('powershell', [
        '-WindowStyle', 'Hidden',
        '-ExecutionPolicy', 'Bypass',
        '-Command', powershellCommand
      ], {
        windowsHide: true
      })
      
      let output = ''
      let errorOutput = ''
      
      process.stdout.on('data', (data) => {
        output += data.toString()
      })
      
      process.stderr.on('data', (data) => {
        errorOutput += data.toString()
      })
      
      process.on('close', (code) => {
        console.log(`Mouse click process exited with code ${code}`)
        if (errorOutput) {
          console.log('PowerShell error output:', errorOutput)
        }
        
        if (code === 0) {
          resolve({ success: true, x, y })
        } else {
          reject(new Error(`Failed to click at coordinates. Exit code: ${code}, Error: ${errorOutput}`))
        }
      })
      
      process.on('error', (error) => {
        console.error('Process spawn error:', error)
        reject(new Error(`Click process error: ${error.message}`))
      })
      
      // Timeout after 10 seconds
      setTimeout(() => {
        process.kill()
        reject(new Error('Click operation timed out'))
      }, 10000)
    })
  } catch (error) {
    console.error('Mouse click error:', error)
    throw new Error('Failed to click at coordinates')
  }
})

app.whenReady().then(() => {
    createWindow()
  
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  })
  
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })