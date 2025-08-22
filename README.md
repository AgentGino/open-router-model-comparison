# 🤖 AI Model Comparison Tool

A powerful web application for comparing responses from multiple AI models using the OpenRouter API. Test prompts across different models side-by-side to find the best AI for your specific needs.

![AI Model Comparison](https://img.shields.io/badge/AI-Model_Comparison-blue.svg)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-cyan.svg)
![OpenRouter](https://img.shields.io/badge/OpenRouter-API-green.svg)

## ✨ Features

### 🎯 **Core Functionality**

- **Multi-Model Selection**: Choose from 100+ AI models via OpenRouter API
- **Side-by-Side Comparison**: View responses from multiple models simultaneously
- **Real-Time Streaming**: Optional streaming responses for immediate feedback
- **Performance Metrics**: Track response time and token usage for each model

### 🔍 **Advanced Search & Selection**

- **Smart Search**: Filter models by name, provider, or capabilities
- **Multi-Select Dropdown**: Intuitive interface with visual model chips
- **Bulk Operations**: Select All / Clear All functionality
- **Auto-Load**: Automatically loads models when API key is available

### 🎨 **User Experience**

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Modern UI**: Clean interface built with TailwindCSS
- **Loading States**: Visual feedback during API requests
- **Error Handling**: Comprehensive error messages and recovery
- **Copy Functionality**: One-click copy of any model response

### 🔒 **Security & Storage**

- **Secure API Key Storage**: Local storage with browser encryption
- **No Server Required**: Runs entirely in the browser
- **CORS Compliant**: Properly configured for OpenRouter API

## 🚀 Quick Start

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- An [OpenRouter API key](https://openrouter.ai/keys)

### Installation

1. **Clone or Download**

   ```bash
   git clone <repository-url>
   # or download and extract the ZIP file
   ```
2. **Start Local Server**

   ```bash
   # Using Python 3
   python3 -m http.server 8080

   # Using Node.js (if you have it)
   npx http-server -p 8080

   # Using PHP (if you have it)
   php -S localhost:8080
   ```
3. **Open in Browser**

   ```
   http://localhost:8080
   ```

### First Time Setup

1. **Get OpenRouter API Key**

   - Visit [OpenRouter](https://openrouter.ai/keys)
   - Create an account and generate an API key
   - Copy your API key
2. **Configure Application**

   - Enter your API key in the application
   - Models will automatically load
   - Your API key is saved locally for future use

## 📖 How to Use

### 1. **Model Selection**

- Click the search box to open the model dropdown
- Type to search for specific models (e.g., "GPT-4", "Claude", "Mistral")
- Click on models to select them
- Selected models appear as blue chips below the search box
- Use "Select All" or "Clear All" for bulk operations

### 2. **Sending Prompts**

- Enter your prompt in the text area
- Optionally enable streaming for real-time responses
- Click "Send Prompt" to submit to all selected models
- Responses appear in individual cards for easy comparison

### 3. **Comparing Results**

- Each model's response appears in its own card
- Performance metrics (response time, tokens used) are shown
- Copy any response using the copy button
- Cards are automatically arranged in a responsive grid

## 🏗️ Project Structure

```
├── index.html          # Main HTML structure
├── styles.css          # Custom CSS styles and dropdown components
├── script.js           # JavaScript application logic
└── README.md           # This documentation file
```

### 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **OpenRouter** for providing access to multiple AI models through a single API
- **TailwindCSS** for the utility-first CSS framework
- **AI Model Providers** for creating the amazing models we can compare

**Made with ❤️ for the AI community**
