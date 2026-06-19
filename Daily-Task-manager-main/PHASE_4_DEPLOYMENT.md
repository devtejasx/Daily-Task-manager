# Phase 4 Deployment Guide: Voice Input & AI Suggestions

## 🔧 Environment Setup

### Required Environment Variables

Add these to your `.env` file in the backend root:

```env
# OpenAI Configuration (CRITICAL for Phase 4)
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-4
OPENAI_WHISPER_MODEL=whisper-1
OPENAI_TTS_MODEL=tts-1

# Add to existing .env (from Phase 1-3)
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

### Getting OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Copy the key (only shown once!)
4. Paste into `.env` file
5. Set up billing: [OpenAI Billing](https://platform.openai.com/account/billing/overview)

**⚠️ Important**: 
- Whisper API costs ~$0.02 per minute of audio
- GPT-4 costs more than GPT-3.5 (~$0.03-0.06 per 1K tokens)
- Monitor usage to avoid surprises

---

## 📦 Installation & Setup

### Backend Setup

```bash
cd backend

# Install multer for file uploads (if not already installed)
npm install multer
npm install @types/multer --save-dev

# Or if using yarn
yarn add multer
yarn add -D @types/multer

# Verify installation
npm list multer
```

### Frontend Setup

```bash
cd frontend

# No new packages required - all dependencies already installed
npm install  # Just to be safe

# Verify
npm list axios  # Should show axios already added
```

---

## 🚀 Starting the Application

### Terminal 1: Backend
```bash
cd backend
npm run dev
# Expected output:
# 🚀 Server running on http://localhost:5000
# 🔌 WebSocket server ready
# ✅ MongoDB Connected
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
# Expected output:
# ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Browser
1. Open `http://localhost:3000`
2. Login/Register
3. Click "✨ AI" button in navbar
4. Test voice and suggestions

---

## 🧪 Testing Phase 4

### Quick Voice Test

1. **Navigate to AI page**: Click "✨ AI" in navbar
2. **Test Microphone**:
   - Click mic button
   - Speak: "Buy groceries tomorrow morning"
   - Should create task with parsed details
   - Check browser console for any errors

3. **Test Suggestions**:
   - Click "AI Suggestions" tab
   - View AI-generated task suggestions
   - Click ✓ to add as task
   - Verify task appears in sidebar

### API Testing with cURL

```bash
# 1. Get your JWT token first from login
TOKEN="your-jwt-token-here"

# 2. Test transcription endpoint
curl -X POST http://localhost:5000/api/voice/transcribe \
  -H "Authorization: Bearer $TOKEN" \
  -F "audio=@path/to/audio.webm"

# 3. Test AI suggestions
curl -X GET "http://localhost:5000/api/ai/suggestions?count=5" \
  -H "Authorization: Bearer $TOKEN"

# 4. Test smart recommendations
curl -X GET http://localhost:5000/api/ai/smart-recommendations \
  -H "Authorization: Bearer $TOKEN"

# 5. Test pattern analysis
curl -X GET http://localhost:5000/api/ai/analyze-patterns \
  -H "Authorization: Bearer $TOKEN"

# 6. Test priority suggestion
curl -X POST http://localhost:5000/api/ai/suggest-priority \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Finish report","description":"Quarterly report needed"}'
```

---

## 📝 Common Setup Issues & Solutions

### Issue: "OPENAI_API_KEY is not set"
**Solution**: Check `.env` file exists and has correct format
```env
OPENAI_API_KEY=sk-... # No spaces around =
```

### Issue: "Multer is not installed"
**Solution**: 
```bash
npm install multer
npm install --save-dev @types/multer
```

### Issue: "Microphone permission denied"
**Solution**: 
- Check browser permissions (Chrome → Settings → Privacy → Microphone)
- Try incognito mode
- Verify site is localhost or HTTPS

### Issue: "Audio transcription fails silently"
**Solution**:
- Check OpenAI API quota at [Usage](https://platform.openai.com/account/usage/overview)
- Verify API key is correct
- Try with shorter audio (< 1 minute)

### Issue: "No tasks appear in suggestions"
**Solution**:
- Create at least 5 tasks first (AI needs data)
- Wait a few moments for processing
- Check browser console for errors

---

## 🔐 Security Considerations

### For Development
```env
OPENAI_API_KEY=sk-dev-key-here
NODE_ENV=development
```

### For Production
```env
# Use environment variables from hosting provider
# Never commit .env to git
OPENAI_API_KEY=sk-prod-key-here
NODE_ENV=production
```

### Security Checklist
- ✅ `.env` is in `.gitignore`
- ✅ OPENAI_API_KEY not logged in console
- ✅ All endpoints require authentication (JWT)
- ✅ File uploads validated (multipart-only)
- ✅ OpenAI responses sanitized

---

## 📊 Performance Tuning

### Backend Optimization
```typescript
// In VoiceService.ts - Already implemented
- Audio compression before API call
- Request timeout: 30 seconds
- Error retry logic

// In AISuggestionsService.ts - Already implemented
- Query limit: 100 tasks max
- Caching ready (Redis integration)
- Response pagination
```

### Frontend Optimization
```typescript
// In VoiceRecorder.tsx - Already implemented
- Lazy loading of Web Audio API
- Memory cleanup on unmount
- Minimal re-renders

// In AISuggestions.tsx - Already implemented
- Tab-based lazy loading
- Response caching
- Progressive rendering
```

### Monitoring & Logging

Add to backend `index.ts`:
```typescript
// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Add error logging
if (process.env.NODE_ENV === 'production') {
  app.use((err: any, req: Request, res: Response) => {
    console.error('Error:', err.message)
    // Send to logging service (Sentry, LogRocket, etc.)
  })
}
```

---

## 🌍 Deployment Options

### Option 1: Docker (Recommended)

```bash
# Build image
docker build -t task-manager-phase4 .

# Run container
docker run -p 5000:5000 \
  -e OPENAI_API_KEY=sk-... \
  -e MONGODB_URI=mongodb+srv://... \
  task-manager-phase4
```

### Option 2: Heroku

```bash
# Install Heroku CLI
heroku login

# Create app
heroku create your-app-name
heroku config:set OPENAI_API_KEY=sk-...
heroku config:set MONGODB_URI=mongodb+srv://...

# Deploy
git push heroku main
```

### Option 3: AWS/DigitalOcean

```bash
# Similar to Heroku - set environment variables in console
# Deploy using their CLI or git push
```

---

## 📚 API Response Examples

### Voice Transcription Response
```json
{
  "success": true,
  "data": {
    "text": "Buy groceries tomorrow morning",
    "confidence": 0.95,
    "valid": true
  }
}
```

### Task Created from Voice
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "title": "Buy groceries",
    "dueDate": "2024-01-18",
    "priority": "High",
    "category": "Shopping",
    "createdAt": "2024-01-17T10:30:00Z"
  },
  "transcription": "Buy groceries tomorrow morning"
}
```

### AI Suggestions Response
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Review weekly goals",
      "description": "Based on your Monday routine",
      "category": "Planning",
      "priority": "High",
      "confidence": 0.87
    }
  ]
}
```

### Pattern Analysis Response
```json
{
  "success": true,
  "data": {
    "insights": [
      "You're most productive on Tuesday mornings",
      "Average task completion time: 2.5 hours",
      "Your daily break: 15 minutes in early afternoon"
    ],
    "stats": {
      "total_tasks": 127,
      "completion_rate": 0.85,
      "best_day": "Tuesday",
      "best_time": "09:00"
    }
  }
}
```

---

## ✨ Features to Test

### Voice Features
- [ ] Microphone access request works
- [ ] Clear audio transcription
- [ ] Natural language parsing accurate
- [ ] Task creation from voice
- [ ] Error handling for unclear audio
- [ ] Multiple audio formats supported

### AI Features
- [ ] Suggestions load quickly
- [ ] Pattern analysis shows insights
- [ ] Smart recommendations vary by time
- [ ] Accept/dismiss functionality works
- [ ] Recent tasks list updates
- [ ] Tab switching smooth

### Integration
- [ ] Voice → task appears in recent list
- [ ] Suggestion → task appears in recent list
- [ ] Tasks persist after refresh
- [ ] Multiple users' data isolated
- [ ] Error messages helpful

---

## 🐛 Debugging

### Enable Debug Logging

**Backend**:
```typescript
// Add to index.ts
const DEBUG = process.env.DEBUG === 'true'

if (DEBUG) {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
    console.log('Body:', req.body)
    next()
  })
}
```

**Frontend**:
```typescript
// Add to voiceAiAPI.ts
const API_DEBUG = localStorage.getItem('API_DEBUG') === 'true'

api.interceptors.response.use(
  response => {
    if (API_DEBUG) console.log('API Response:', response.data)
    return response
  }
)
```

**Browser Console**:
```javascript
// Enable by typing in console:
localStorage.setItem('API_DEBUG', 'true')
location.reload()
```

---

## 📞 Support

### Quick Troubleshooting Checklist
1. ✅ Is `.env` file created with all variables?
2. ✅ Is OpenAI API key valid and has quota?
3. ✅ Is MongoDB connected?
4. ✅ Is backend server running on port 5000?
5. ✅ Is frontend running on port 3000?
6. ✅ Are you logged in?
7. ✅ Have you created at least 5 tasks (for suggestions)?

### Error Message Reference

| Error | Cause | Fix |
|-------|-------|-----|
| "401 Unauthorized" | JWT token missing | Re-login |
| "OPENAI_API_KEY is not defined" | .env not set | Add to .env |
| "Microphone denied" | Browser permission | Check browser settings |
| "No suggestions" | Need more tasks | Create 5+ tasks first |
| "Request timeout" | API slow | Try shorter audio |
| "Invalid audio format" | Wrong file type | Use .webm or .mp3 |

---

## ✅ Pre-Launch Checklist

- [ ] Backend runs without errors
- [ ] Frontend loads at localhost:3000
- [ ] Can login/register
- [ ] Voice recording works
- [ ] Transcription appears
- [ ] Tasks created from voice
- [ ] AI suggestions load
- [ ] Pattern analysis displays
- [ ] No console errors
- [ ] Mobile responsive

---

**🎉 Phase 4 is ready for deployment!**

For questions or issues, check the console logs first and review this guide's troubleshooting section.
