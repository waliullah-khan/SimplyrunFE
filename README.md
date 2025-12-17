# GHL AI Assistant Chatbot

A beautiful, modern chatbot interface for GoHighLevel AI Assistant powered by n8n automation workflows. This chatbot helps automate marketing, sales, and business operations through intelligent conversation.

## Features

- **Modern UI/UX**: Beautiful gradient design with smooth animations
- **Real-time Chat**: Interactive chat interface with typing indicators
- **Session Management**: Persistent chat sessions using localStorage
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Quick Suggestions**: Pre-configured action cards for common tasks
- **N8N Integration**: Connected to n8n workflow automation

### Capabilities

- 💳 Invoicing & Payments
- ✍️ Social Media Post Creation
- 📝 Blog Management
- 🗓️ Calendar & Scheduling
- 🙋‍♂️ CRM & Contact Management
- 📁 Documents & Media Handling
- 📋 Surveys & Forms
- ⚡ Workflow Automation

## Project Structure

```
NXAI/
├── public/
│   ├── index.html          # Main HTML file
│   ├── css/
│   │   └── styles.css      # All styles and animations
│   └── js/
│       └── app.js          # Chat logic and API integration
├── index.html             # Root redirect for Vercel
├── vercel.json            # Vercel deployment configuration
├── package.json           # Project dependencies
├── .gitignore            # Git ignore rules
├── .env.example          # Environment variables template
└── README.md             # This file
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher) - Optional, for local development server
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Active n8n webhook URL

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NXAI
   ```

2. **Configure the webhook URL** (Optional)

   The webhook URL is currently hardcoded in `public/js/app.js`. To change it:

   - Open `public/js/app.js`
   - Update the `webhookUrl` in the CONFIG object:
     ```javascript
     const CONFIG = {
         webhookUrl: 'YOUR_N8N_WEBHOOK_URL',
         particleCount: 50
     };
     ```

### Running the Application

#### Option 1: Using npm (Recommended for development)

```bash
# Install dependencies (http-server)
npm install

# Start the development server
npm run dev

# Or for production mode
npm start
```

The application will automatically open in your default browser at `http://localhost:8080`.

#### Option 2: Using Python's built-in server

```bash
cd public
python -m http.server 8080
```

Then open your browser and navigate to `http://localhost:8080`.

#### Option 3: Direct file access

Simply open `public/index.html` in your web browser. Note that some features may not work due to CORS restrictions.

#### Option 4: Deploy to Vercel (Recommended for Production)

This project is pre-configured for Vercel deployment:

**One-Click Deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/waliullah-khan/NXAI)

**Manual Deployment:**

1. Install Vercel CLI (optional):
   ```bash
   npm install -g vercel
   ```

2. Deploy from the project root:
   ```bash
   vercel
   ```

3. Or deploy via Vercel Dashboard:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect the configuration
   - Click "Deploy"

The `vercel.json` file is already configured to serve the app from the `public/` directory.

**Alternative Static Hosting Options:**

Deploy the entire project (with vercel.json) to:
- Netlify - Auto-detects configuration
- GitHub Pages - Deploy the `public/` folder
- AWS S3 - Upload `public/` folder contents
- Azure Static Web Apps - Import from GitHub
- Cloudflare Pages - Connect your repository

## Usage

1. **Start a conversation**: Type your message in the input field or click one of the suggestion cards
2. **Send messages**: Press Enter or click the send button
3. **View responses**: The AI assistant will respond to your queries
4. **Session persistence**: Your chat session is saved in localStorage and persists across page reloads

## Customization

### Changing the Theme

Edit `public/css/styles.css` to customize:
- Colors: Update the gradient values in the `body` selector
- Animations: Modify keyframe animations
- Layout: Adjust container widths and padding

### Adding New Suggestions

Edit `public/index.html` to add more suggestion cards:

```html
<div class="suggestion-card" data-suggestion="Your suggestion text">
    <div class="suggestion-icon">🎯</div>
    <div class="suggestion-text">Your suggestion text</div>
</div>
```

### Modifying Chat Behavior

Edit `public/js/app.js`:
- Update the `CONFIG` object for configuration changes
- Modify the `ChatApp` class methods to change chat behavior
- Customize error messages and response handling

## N8N Webhook Integration

The chatbot expects the following request format:

```json
{
  "action": "sendMessage",
  "sessionId": "session_timestamp_randomid",
  "chatInput": "User's message text"
}
```

Expected response format:

```json
{
  "output": "AI assistant's response",
  "message": "Alternative response field"
}
```

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Fully responsive

## Security Considerations

- The webhook URL is exposed in the client-side code. Ensure your n8n webhook has proper authentication if needed.
- Consider implementing rate limiting on the n8n side to prevent abuse.
- For production use, consider adding CSRF protection and input validation.

## Troubleshooting

### Chat not working

1. Check browser console for errors
2. Verify the webhook URL is correct and accessible
3. Ensure your n8n workflow is active
4. Check CORS settings on your n8n instance

### Styling issues

1. Clear browser cache
2. Check that CSS file is loading correctly
3. Verify no ad blockers are interfering

### Session not persisting

1. Check if localStorage is enabled in your browser
2. Ensure you're not in incognito/private mode
3. Check browser privacy settings

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue in the repository.