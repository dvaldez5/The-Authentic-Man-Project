# AM Chat System Documentation

## Overview
The AM Chat system is a unified, context-aware AI mentor and best friend that provides personalized guidance across The AM Project platform. It operates as a single, cohesive system with shared conversation history and real-time access to user data.

## Architecture

### Core Components

#### 1. UnifiedAMChat Component (`client/src/components/UnifiedAMChat.tsx`)
- **Purpose**: Single component handling all chat implementations
- **Modes**: 
  - `type="bubble"` - Floating chat bubble (global)
  - `type="dashboard"` - Inline dashboard chat
  - `type="homepage"` - Marketing page showcase
- **Features**: Structured message formatting, authentication-aware UI, responsive design

#### 2. UnifiedAMChatContext (`client/src/contexts/UnifiedAMChatContext.tsx`)
- **Purpose**: Central state management and API communication
- **Responsibilities**:
  - Authentication token handling
  - Message state management
  - API request coordination
  - User name resolution

#### 3. Server API Endpoints (`server/routes.ts`)
- **POST /api/ai/chat**: Main chat endpoint with context-aware responses
- **GET /api/ai/chat/history**: Conversation history retrieval
- **Database**: `chat_messages` table for persistence

## Authentication Flow

### Token Management
```typescript
// UnifiedAMChatContext.tsx - Lines 45-50
const authToken = token || localStorage.getItem('auth_token');
if (authToken) {
  headers['Authorization'] = `Bearer ${authToken}`;
}
```

### Authentication States
- **Authenticated Users**: Access to personalized responses with real user data
- **Guest Users**: Generic responses with signup encouragement
- **Development Mode**: Override for testing scenarios

## Usage Patterns

### 1. Global Chat Bubble
```tsx
// App.tsx - Line 302
{showAMChat && <UnifiedAMChat type="bubble" />}
```
- Appears on all pages except splash screen
- Floating position with responsive design
- Shared conversation history

### 2. Dashboard Integration
```tsx
// Dashboard.tsx - Line 8
<UnifiedAMChat defaultExpanded={true} showHeader={false} />
```
- Inline component within dashboard
- Pre-expanded for immediate access
- Same backend, same context

## Context Awareness

### Real-Time Data Access
The AM Chat system has live access to:
- **User Progress**: XP, courses, lessons completed
- **Learning Data**: Active courses, stalled progress, next steps  
- **Journal Entries**: Recent reflections, pinned entries
- **Gamification**: Badges, achievements, streaks
- **Blog Articles**: Dynamic content recommendations
- **Challenges**: Daily challenges, weekly scenarios

### Personalization Engine
```javascript
// Server context gathering (routes.ts)
- User courses and progress percentages
- Recent journal entries and themes
- XP level and badge achievements
- Challenge completion status
- Blog article recommendations
```

## API Integration

### Request Format
```typescript
{
  text: string,           // User message
  context: 'dashboard' | 'public',  // Authentication context
  firstName: string       // User's first name for personalization
}
```

### Response Processing
- **Structured Formatting**: Paragraphs, bullet points, bold text
- **Link Rendering**: Automatic link detection and styling  
- **Error Handling**: Graceful fallbacks for connectivity issues

## Database Schema

### Chat Messages Table
```sql
chat_messages:
  - id: serial (primary key)
  - userId: integer (references users.id)
  - role: text ('user' | 'am')
  - text: text (message content)  
  - timestamp: timestamp (auto-generated)
```

## Development Guidelines

### Adding New Context Data
1. **Server Side**: Add data gathering in `/api/ai/chat` endpoint
2. **Context Formation**: Include new data in OpenAI prompt context
3. **No Frontend Changes**: UnifiedAMChat automatically displays new responses

### Extending Chat Functionality
1. **Single Source**: All changes go through UnifiedAMChat component
2. **Unified Context**: Use UnifiedAMChatContext for state management
3. **Authentication**: Always use useAuth() hook pattern

### Testing Authentication
```bash
# Check server logs for authentication status
# Look for: "✅ AUTHENTICATION SUCCESS" or "❌ AUTHENTICATION FAILURE"
```

## Security Considerations

### Token Handling
- **Primary**: useAuth() hook from authentication context
- **Fallback**: localStorage('auth_token') for persistence
- **Never**: Cookie-based authentication (eliminated)

### Rate Limiting
- **Authenticated**: Unlimited chat access
- **Public**: 5 messages per hour limit
- **Development**: No limits for testing

## Troubleshooting

### Common Issues
1. **"Connection Error"**: Check authentication token presence
2. **Generic Responses**: Verify userId is reaching server
3. **No Personalization**: Confirm user data gathering in server logs

### Debug Process
1. Check browser network tab for /api/ai/chat requests
2. Verify Authorization header includes Bearer token
3. Review server logs for authentication status
4. Confirm user data availability in database

## File Structure
```
client/src/
├── components/UnifiedAMChat.tsx      # Main chat component
├── contexts/UnifiedAMChatContext.tsx # State management
└── hooks/use-auth.tsx                # Authentication provider

server/
├── routes.ts                         # API endpoints
└── storage.ts                        # Database operations

shared/
└── schema.ts                         # Database schema
```

## Version History
- **v2.12.7**: Context-aware responses with real user data access
- **v2.12.5**: Unified component architecture established
- **Current**: Clean unified system with AMInlineChat removed

---

**Key Principle**: One component, one context, one authentication method. No redundancy, no confusion.