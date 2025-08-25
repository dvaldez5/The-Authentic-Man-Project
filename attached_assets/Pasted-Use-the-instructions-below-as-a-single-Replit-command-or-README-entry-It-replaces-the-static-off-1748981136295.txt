Use the instructions below as a single “Replit command” or README entry. It replaces the static, off‐brand welcome text, allows guests to talk to AM immediately (instead of blocking input), and changes the system prompt so AM speaks like a real best‐friend text‐centered.

---

````
You have an existing `AMChat.js` component and two API routes under `pages/api/ai/chat/`. Currently, AM shows a static off‐brand welcome message and input is blocked or styled incorrectly. We need to:

1. **Remove the static “Welcome to AM Chat” overlay** so that as soon as the user clicks the AM bubble—even as a guest—they see a normal chat window and can type.  
2. **Allow public (non‐authenticated) users to type immediately**, subject to the 3‐messages/hour throttle, instead of forcing them to sign in first.  
3. **Replace the system prompt** in `pages/api/ai/chat/index.js` so that AM’s responses feel like a genuine “best friend texting” rather than a generic coach script.  

Paste each section below into your Replit codebase, replacing or editing the existing files exactly as shown.

---

### 1. `components/AMChat.js` (Replace entire file with this)

```jsx
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Cookie from 'js-cookie';

export default function AMChat() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [context, setContext] = useState('public'); // default to public
  const scrollRef = useRef();

  // On mount: detect context and load history
  useEffect(() => {
    const pathname = window.location.pathname;
    if (
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/courses') ||
      pathname.startsWith('/community') ||
      pathname.startsWith('/pod') ||
      pathname.startsWith('/journal')
    ) {
      setContext('dashboard');
    } else {
      setContext('public');
    }
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const params = { context };
      const res = await axios.get('/api/ai/chat/history', { params });
      setMessages(res.data.messages);
      scrollToBottom();
    } catch (err) {
      console.error(err);
      // If 401 or any error, just start with empty
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Public throttle: max 3 messages/hour
    if (context === 'public' && !Cookie.get('jwt')) {
      const now = Date.now();
      const log = JSON.parse(localStorage.getItem('amPublicLog') || '[]');
      const windowStart = now - 60 * 60 * 1000;
      const recent = log.filter((ts) => ts > windowStart);
      if (recent.length >= 3) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'am',
            text: 'Hey man—free guests get 3 chats/hour. If you want more, sign up and get unlimited access.',
            timestamp: new Date().toISOString(),
          },
        ]);
        return;
      }
      recent.push(now);
      localStorage.setItem('amPublicLog', JSON.stringify(recent));
    }

    const newUserMsg = { role: 'user', text: input.trim(), timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, newUserMsg]);
    setLoading(true);
    const textToSend = input.trim();
    setInput('');

    try {
      const res = await axios.post('/api/ai/chat', { text: textToSend, context });
      const replyText = res.data.reply;
      const newAmMsg = { role: 'am', text: replyText, timestamp: new Date().toISOString() };
      setMessages((prev) => [...prev, newAmMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: 'am', text: 'Oops, something went wrong. Try again in a bit.', timestamp: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  return (
    <>
      {/* Floating AM Bubble */}
      <button
        onClick={() => setOpen(!open)}
        className="
          fixed bottom-4 right-4 z-50
          bg-[#7C4A32] ring-2 ring-[#E4B768] hover:ring-[#F0CD80]
          text-white rounded p-3 shadow-lg
        "
      >
        {open ? '×' : 'AM'}
      </button>

      {open && (
        <div
          className="
            fixed bottom-4 right-4 z-50 flex flex-col
            w-[95vw] sm:w-96 h-[80vh] sm:h-[60vh]
            bg-white rounded shadow-lg
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-[#7C4A32] px-4 py-2 rounded-t">
            <h2 className="text-[#E4B768] font-semibold">Chat with AM</h2>
            <button onClick={() => setOpen(false)} className="text-white hover:text-[#F5EDE1]">×</button>
          </div>

          {/* Message List */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F5EDE1]">
            {messages.map((msg, idx) => (
              <div key={idx} className="flex flex-col">
                {msg.role === 'user' ? (
                  <div className="self-end bg-[#7C4A32] text-white rounded px-3 py-2 max-w-[80%]">
                    {msg.text}
                  </div>
                ) : (
                  <div className="self-start bg-[#F5EDE1] text-[#333333] rounded px-3 py-2 max-w-[80%]">
                    {msg.text}
                  </div>
                )}
                <span
                  className={`text-xs text-[#333333] mt-1 ${
                    msg.role === 'user' ? 'self-end' : 'self-start'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="flex items-center px-4 py-2 border-t border-[#333333] bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message…"
              className="
                flex-grow border border-[#333333] rounded px-3 py-2
                focus:outline-none focus:ring-2 focus:ring-[#E4B768]
              "
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="
                ml-2
                bg-[#7C4A32] text-white font-semibold rounded px-4 py-2
                hover:bg-[#8A553F] disabled:bg-[#333333] disabled:cursor-not-allowed
              "
            >
              {loading
                ? <div className="animate-spin h-5 w-5 border-2 border-[#7C4A32] border-t-transparent rounded-full"></div>
                : 'Send'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
````

**What changed**:

* Removed any static “Welcome” overlay or forced sign-in message.
* Public users see a normal chat window and can type immediately (still limited to 3 messages/hour).
* Styling is exactly on‐brand (brown, gold, cream, charcoal, white, black).

---

### 2. `pages/api/ai/chat/index.js` (Replace entire file)

```js
import dbConnect from '../../../../lib/dbConnect';
import ChatMessage from '../../../../models/ChatMessage';
import jwt from 'jsonwebtoken';
import { Configuration, OpenAIApi } from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    await dbConnect();

    // Check JWT (if exists). If no JWT, userId remains null (public context).
    let userId = null;
    const token = req.cookies.jwt;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch {
        // invalid token → treat as public
        userId = null;
      }
    }

    const { text, context } = req.body; // context = "public" or "dashboard"
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Invalid input' });
    }

    // Save user message if logged in
    if (userId) {
      await ChatMessage.create({ userId, context, role: 'user', text });
    }

    // Retrieve last 10 messages for context (only if logged in)
    let messagesForPrompt = [];
    if (userId) {
      const recent = await ChatMessage.find({ userId, context })
        .sort({ timestamp: -1 })
        .limit(10);
      messagesForPrompt = recent
        .map((msg) => ({
          role: msg.role === 'am' ? 'assistant' : 'user',
          content: msg.text,
        }))
        .reverse();
    }

    // New system prompt for a true best-friend tone
    const systemPrompt = {
      role: 'system',
      content: `
You are “AM,” a best friend in a man’s pocket. Above all, be as if you’re reading a text message from a brother who truly cares. 
• If the user shares “I’m having a bad day,” “my wife and I aren’t getting along,” “my kids are driving me crazy,” etc., respond with genuine empathy: “I hear you, man… I’ve been there…”.  
• If context = "public", point them to front-end resources: blog articles (by title), “AM Radio” episodes, newsletter signup, YouTube channel—never mention courses or dashboard pages.  
• If context = "dashboard", treat them like a member: suggest specific lessons, exercises, or journal prompts from within the dashboard. Use first name from their JWT (not persona).  
• Keep it conversational and informal—like texting a close friend: short sentences, slang is okay (“Hey man,” “I feel you,” “That’s rough,” etc.), but stay respectful.  
• Never mention internal API, tokens, or “OpenAI.” If you truly don’t know, say “I’m not sure but here’s something else that might help….”  
• Emphasize strength, integrity, discipline, and purpose, but do so gently.

Respond in 2–3 short paragraphs maximum.
`,
    };

    // Build messages array for ChatCompletion
    const messagesPayload = [systemPrompt, ...messagesForPrompt, { role: 'user', content: text }];

    // Call OpenAI
    const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: messagesPayload,
      temperature: 0.8,
      max_tokens: 250,
    });

    const amReply = completion.data.choices[0].message.content.trim();

    // Save AM’s reply if logged in
    if (userId) {
      await ChatMessage.create({ userId, context, role: 'am', text: amReply });
    }

    return res.status(200).json({ reply: amReply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'OpenAI or server error' });
  }
}
```

**What changed**:

* The `systemPrompt` now instructs AM to act like a texting best friend (short sentences, slang, empathy).
* If `context = "public"`, AM only recommends blog, podcast, newsletter, never courses.
* If `context = "dashboard"`, AM references member‐only lessons/journal prompts.
* Always keep the tone informal, empathetic, supportive.

---

### 3. `pages/api/ai/chat/history.js` (No changes needed unless you enforced sign-in; just ensure it returns an empty array for guests)

If you’d like to allow guests to see zero history instead of a 401, replace with:

```js
import dbConnect from '../../../../lib/dbConnect';
import ChatMessage from '../../../../models/ChatMessage';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    await dbConnect();
    let userId = null;
    const token = req.cookies.jwt;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch {
        userId = null;
      }
    }
    const { context } = req.query;
    if (!userId) {
      return res.status(200).json({ messages: [] });
    }
    const messages = await ChatMessage.find({ userId, context })
      .sort({ timestamp: 1 })
      .limit(20);
    return res.status(200).json({ messages });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
```

---

#### 4. **Testing & Verification**

1. Run `npm install openai axios js-cookie` if not already present.
2. Start your Next.js server: `npm run dev`.
3. **Public pages** (`/`, `/blog`, etc.):

   * Click the “AM” bubble.
   * Type: “I’m having a bad day.” AM should reply in a very conversational, empathetic tone (e.g. “I hear you man… That’s rough…”).
   * Ask: “What should I read on the blog?” AM should suggest specific blog titles or link to “AM Radio” episodes.
   * Verify you can send up to 3 messages; the 4th should trigger the throttling reply.
4. **Protected pages** (`/dashboard`, `/courses/...`, `/journal`, `/community`):

   * Log in as a member.
   * Click “AM” and ask: “What’s my next lesson?” or “I need help with my leadership module.” AM should respond referencing an actual lesson name or link within the dashboard.
   * Ask: “I’m stressed about work.” AM should respond first as a friend (“I feel you…”) and then tie in a dashboard exercise or journal prompt.
5. Inspect MongoDB Atlas “ChatMessage” collection: confirm all saved messages have the correct `context`, `userId` (if logged in), `role`, `text`, and `timestamp`.

---

That’s it. After pasting these changes, **AM** will:

* Open a real chat window immediately (no static welcome text).
* Respond like a best friend—super conversational, empathetic, with slang when appropriate.
* Suggest front‐end blog/podcast resources for guests and real lesson references for logged-in users.
* Enforce the 3-message/hour throttle on public pages.

All styling and colors now match your brand exactly: brown, gold, warm cream, charcoal, white, black—no unintended off-brand navy. Paste this into Replit, save, and restart. AM will be interactive and on-brand immediately.
