# Project Setup Guide

## Prerequisites
- Active Google Cloud account
- Active Google Cloud billing account

## Setup Steps

### 1. Create Google Cloud Project
1. Log in to Google Cloud Console
2. Create a new project

### 2. Enable Required APIs
Enable the following APIs in your Google Cloud project:
- Cloud Natural Language API
- Cloud Translation API

### 3. Configure API Key
- Follow the API key setup link: https://chatgpt.com/share/6752a97c-a934-8013-b859-d4ca2ed89f5a

### 4. Project Installation
```bash
# Install project dependencies
npm install

# Start the API server
node api
```

### 5. Running the Application
1. Open `index.html` in your web browser
2. Type your diseases in the input field
3. View the results

## Troubleshooting
- Ensure you have Node.js installed. i use node v20.11.0
- Verify your Google Cloud API credentials
- Check that all dependencies are correctly installed
