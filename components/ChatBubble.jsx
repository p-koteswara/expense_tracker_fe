'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import axiosInstance from '@/api/axios';
import { useAuth } from '@/context/AuthContext';

function normalizeDate(input) {
  if (!input) return new Date().toISOString().split('T')[0];

  const lower = String(input).trim().toLowerCase();
  if (lower.includes('today')) return new Date().toISOString().split('T')[0];
  if (lower.includes('yesterday')) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }

  const parsed = new Date(input);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
  return new Date().toISOString().split('T')[0];
}

function toTitle(value) {
  if (!value) return '';
  return String(value)
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

export default function ChatBubble() {
  const { token, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: crypto.randomUUID(),
      role: 'ai',
      type: 'text',
      text: 'Hi! I am Cashually AI. Ask me about your spending or tell me an expense to add.',
    },
  ]);
  const [pendingExpense, setPendingExpense] = useState(null);
  const [categories, setCategories] = useState([]);
  const messagesEndRef = useRef(null);

  const isLoggedIn = useMemo(() => !loading && Boolean(token), [loading, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isLoggedIn) {
      setIsOpen(false);
      setPendingExpense(null);
    }
  }, [isLoggedIn]);

  const fetchCategories = async () => {
    if (categories.length > 0) return categories;
    const response = await axiosInstance.get('/categories');
    setCategories(response.data || []);
    return response.data || [];
  };

  const addFriendlyError = (text = 'Something went wrong, try again!') => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: 'ai',
        type: 'text',
        text,
      },
    ]);
  };

  const sendChatMessage = async (message) => {
    try {
      return await axiosInstance.post('/chat/', { message });
    } catch (error) {
      const status = error?.response?.status;
      const configuredBaseUrl = String(process.env.NEXT_PUBLIC_API_URL || '').toLowerCase();
      const usesRemoteApi =
        configuredBaseUrl &&
        !configuredBaseUrl.includes('127.0.0.1') &&
        !configuredBaseUrl.includes('localhost');

      // If deployed API doesn't have /chat yet, try local backend automatically.
      if (status === 404 && usesRemoteApi) {
        return axiosInstance.post('http://127.0.0.1:8000/chat/', { message });
      }
      throw error;
    }
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content || isTyping) return;

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', type: 'text', text: content },
    ]);
    setInput('');
    setIsTyping(true);
    setPendingExpense(null);

    try {
      const response = await sendChatMessage(content);
      const data = response.data || {};

      if (data.action === 'add_expense') {
        const candidate = {
          amount: Number(data.amount),
          description: data.description || 'New expense',
          category: toTitle(data.category || 'Other'),
          date: normalizeDate(data.date),
        };
        setPendingExpense(candidate);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'ai',
            type: 'confirm_expense',
            expense: candidate,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'ai',
            type: 'text',
            text: data.response || 'I am here to help with your spending.',
          },
        ]);
      }
    } catch (error) {
      console.error('Chat request failed', error);
      if (error?.response?.status === 404) {
        addFriendlyError('Chat service is not available yet. Start backend on port 8000 or deploy the /chat endpoint.');
      } else if (error?.code === 'ERR_NETWORK') {
        addFriendlyError('Cannot reach the chat backend. Make sure API server is running on port 8000.');
      } else {
        addFriendlyError();
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleConfirmExpense = async () => {
    if (!pendingExpense) return;

    setIsTyping(true);
    try {
      const loadedCategories = await fetchCategories();
      const matchedCategory = loadedCategories.find(
        (cat) => String(cat.name).toLowerCase() === String(pendingExpense.category).toLowerCase()
      );

      if (!matchedCategory) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'ai',
            type: 'text',
            text: `I could not find the "${pendingExpense.category}" category. Please add it first or try again with another category.`,
          },
        ]);
        setPendingExpense(null);
        return;
      }

      await axiosInstance.post('/expenses', {
        description: pendingExpense.description,
        amount: pendingExpense.amount,
        category_id: matchedCategory.id,
        date: pendingExpense.date,
        note: 'Added via Cashually AI',
      });

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'ai',
          type: 'text',
          text: 'Expense added successfully!',
        },
      ]);
      setPendingExpense(null);
    } catch (error) {
      console.error('Failed to add expense', error);
      addFriendlyError();
    } finally {
      setIsTyping(false);
    }
  };

  const handleCancelExpense = () => {
    setPendingExpense(null);
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: 'ai',
        type: 'text',
        text: 'No problem, I canceled that expense.',
      },
    ]);
  };

  if (!isLoggedIn) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[70] font-sans flex flex-col items-end">
      {isOpen && (
        <div className="absolute bottom-16 right-0 mb-2 w-[400px] max-w-[calc(100vw-3rem)] rounded-2xl border border-border bg-surface shadow-2xl">
          <div className="flex items-center justify-between rounded-t-2xl border-b border-border bg-background px-4 py-3">
            <h3 className="font-semibold text-foreground text-lg">Cashually AI ✦</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-muted-foreground hover:bg-surface"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          <div className="h-[480px] space-y-3 overflow-y-auto px-4 py-4 bg-background/60">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'confirm_expense' ? (
                  <div className="max-w-[90%] rounded-xl border border-border bg-surface p-4 text-sm text-foreground shadow-sm">
                    <p className="font-semibold text-base">Got it! Add this expense?</p>
                    <p className="mt-2 text-sm">
                      <span className="mr-1">📝</span>${message.expense.amount} - {message.expense.description} -{' '}
                      {message.expense.category} - {message.expense.date}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={handleConfirmExpense}
                        className="rounded-lg bg-accent-green px-4 py-2 text-xs font-bold text-white hover:opacity-90"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={handleCancelExpense}
                        className="rounded-lg border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-background"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm md:text-base ${
                      message.role === 'user'
                        ? 'bg-accent-green text-white shadow-sm'
                        : 'border border-border bg-surface text-foreground shadow-sm'
                    }`}
                  >
                    {message.text}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-surface px-4 py-2.5 shadow-sm">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-accent-green [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-accent-green [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-accent-green" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-center gap-2 border-t border-border p-4 bg-background">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder="Ask about your spending..."
              className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-green/20"
            />
            <button
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              className="rounded-xl bg-accent-green p-2.5 text-white disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-green text-white shadow-lg shadow-accent-green/30 hover:scale-105 active:scale-95 transition-transform"
        aria-label="Toggle Cashually AI chat"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
}
