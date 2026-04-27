'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  needsHuman?: boolean;
}

export default function SaraChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'سلام! من SARA هستم، دستیار هوشمند DirectKey. چطور می‌تونم کمکتون کنم؟ 🏠',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const history = newMessages.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages([...newMessages, { role: 'assistant', content: `❌ خطا: ${data.error}` }]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: data.response,
            needsHuman: data.needsHuman,
          },
        ]);
      }
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: '❌ خطای اتصال. دوباره تلاش کنید.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl flex flex-col h-[90vh] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-blue-900 px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
            S
          </div>
          <div>
            <div className="text-white font-semibold">SARA — DirectKey AI</div>
            <div className="text-blue-300 text-sm">دستیار هوشمند املاک</div>
          </div>
          <div className="mr-auto bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            🟢 TEST MODE
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-700 text-gray-100 rounded-bl-sm'
                }`}
                dir="auto"
              >
                {msg.content}
                {msg.needsHuman && (
                  <div className="mt-2 text-xs text-yellow-300 border-t border-yellow-500 pt-1">
                    ⚠️ نیاز به مشاور انسانی
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-gray-300 rounded-2xl rounded-bl-sm px-4 py-3 text-sm">
                <span className="animate-pulse">SARA در حال تایپ...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-gray-800 flex gap-3 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="پیام خود را بنویسید... (Enter برای ارسال)"
            rows={1}
            dir="auto"
            className="flex-1 bg-gray-700 text-white placeholder-gray-400 rounded-xl px-4 py-3 text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white rounded-xl px-5 py-3 text-sm font-medium transition-colors"
          >
            ارسال
          </button>
        </div>
      </div>

      <p className="text-gray-600 text-xs mt-3">
        این صفحه فقط برای تست است — directkey.app/sara-test
      </p>
    </div>
  );
}
