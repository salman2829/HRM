"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from './AppContext';
import { 
  Bot, 
  Sparkles, 
  X, 
  Send, 
  Minimize2, 
  RotateCcw, 
  UserCheck, 
  MapPin, 
  Users, 
  Clock, 
  FileText, 
  HelpCircle, 
  Calendar, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Loader2,
  ChevronDown
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user' | 'system';
  content: string;
  timestamp: string;
  actionPayload?: {
    type: string;
    payload?: any;
  };
}

export default function HrmChatbot() {
  const { 
    currentUser, 
    role, 
    users, 
    metrics, 
    attendanceHistory,
    clockIn, 
    addStaff, 
    showToast,
    setSelectedStaffForDetail 
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // User-scoped chat history key
  const activeUserId = currentUser ? currentUser.id : null;

  // Load and isolate chat history whenever the active logged-in user changes
  useEffect(() => {
    if (!currentUser) {
      setIsOpen(false);
      setMessages([]);
      return;
    }

    const storageKey = `workpulse_chat_${currentUser.id}`;
    let saved: ChatMessage[] = [];
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
      if (raw) {
        saved = JSON.parse(raw);
      }
    } catch (e) {
      console.warn("Failed to parse user chat history", e);
    }

    if (saved && Array.isArray(saved) && saved.length > 0) {
      setMessages(saved);
    } else {
      const activeName = currentUser.name;
      const roleLabel = currentUser.role === 'ADMIN' ? 'Executive Admin' : currentUser.role === 'INTERN' ? 'Intern' : 'Employee';
      
      const initialGreeting: ChatMessage = {
        id: `msg-init-${currentUser.id}`,
        role: 'assistant',
        content: `Hi **${activeName}**! 👋 I am your **WorkPulse AI Assistant**, configured for your **${roleLabel}** workspace.\n\nHow can I help you today? Choose a quick action below or ask anything!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([initialGreeting]);
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(storageKey, JSON.stringify([initialGreeting]));
        }
      } catch (e) {}
    }
  }, [currentUser?.id, currentUser?.role, currentUser?.name]);

  // Persist messages for the active user
  const persistMessages = (newMsgs: ChatMessage[]) => {
    setMessages(newMsgs);
    if (!currentUser) return;
    try {
      if (typeof window !== 'undefined') {
        const storageKey = `workpulse_chat_${currentUser.id}`;
        localStorage.setItem(storageKey, JSON.stringify(newMsgs));
      }
    } catch (e) {}
  };

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Role-Aware Quick Prompt Chips configuration
  const getPromptChips = () => {
    if (role === 'ADMIN') {
      return [
        { label: "Who is clocked in?", intent: "WHO_IS_CLOCKED_IN", icon: Users },
        { label: "Find employee location", intent: "FIND_EMPLOYEE_LOCATION", icon: MapPin },
        { label: "Seed 10 mock staff", intent: "SEED_MOCK_STAFF", icon: Sparkles },
      ];
    }
    if (role === 'INTERN') {
      return [
        { label: "Draft weekly logbook", intent: "DRAFT_LOGBOOK", icon: FileText },
        { label: "Who is my mentor?", intent: "WHO_IS_MY_MENTOR", icon: UserCheck },
        { label: "Weeks left", intent: "WEEKS_LEFT", icon: Calendar },
      ];
    }
    // Default EMPLOYEE chips
    return [
      { label: "Clock me in", intent: "CLOCK_ME_IN", icon: Clock },
      { label: "Hours worked today", intent: "HOURS_WORKED", icon: Clock },
      { label: "Check leave policy", intent: "LEAVE_POLICY", icon: FileText },
    ];
  };

  const handleSendMessage = async (textToSend?: string, actionIntent?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text && !actionIntent) return;

    const userMsgId = `user-${Date.now()}`;
    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        role: 'user',
        content: text || (actionIntent ? actionIntent.replace(/_/g, ' ') : 'Quick Action'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];

    persistMessages(newMessages);
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          currentUser,
          users,
          metrics,
          attendanceHistory,
          actionIntent,
        }),
      });

      const data = await response.json();
      if (data.success) {
        const updatedMsgs: ChatMessage[] = [
          ...newMessages,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.response,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionPayload: data.action,
          },
        ];
        persistMessages(updatedMsgs);
      } else {
        const errorMsgs: ChatMessage[] = [
          ...newMessages,
          {
            id: `assistant-err-${Date.now()}`,
            role: 'assistant',
            content: `⚠️ ${data.error || "Unable to process request right now. Please check network connection."}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ];
        persistMessages(errorMsgs);
      }
    } catch (err: any) {
      const errorMsgs: ChatMessage[] = [
        ...newMessages,
        {
          id: `assistant-err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Network error connecting to WorkPulse AI service: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ];
      persistMessages(errorMsgs);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAction = async (action: { type: string; payload?: any }) => {
    if (action.type === 'EXECUTE_CLOCK_IN' || action.type === 'CLOCK_IN') {
      const res = await clockIn("Clocked in via WorkPulse AI Chatbot");
      if (res.success) {
        const updated: ChatMessage[] = [
          ...messages,
          {
            id: `action-confirm-${Date.now()}`,
            role: 'assistant',
            content: `✅ **Clock-In Executed Successfully!**\n\nYour presence has been logged and the Live Radar is broadcasting your verified office location.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ];
        persistMessages(updated);
      }
    } else if (action.type === 'TRIGGER_SEED' || action.type === 'SEED_STAFF') {
      await addStaff(action.payload?.count || 10);
      const updated: ChatMessage[] = [
        ...messages,
        {
          id: `action-seed-confirm-${Date.now()}`,
          role: 'assistant',
          content: `🌱 **Synthetic Staff Generation Complete!**\n\n10 new employee profiles with Indian geolocations and shift metrics have been registered into the database.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ];
      persistMessages(updated);
    } else if (action.type === 'FIND_LOCATION' && action.payload?.user) {
      setSelectedStaffForDetail(action.payload.user);
      showToast("Staff Selected", `Centered map radar on ${action.payload.user.name}`, "info");
    }
  };

  const handleClearChat = () => {
    const activeName = currentUser?.name || 'User';
    const resetMsg: ChatMessage[] = [
      {
        id: `msg-reset-${Date.now()}`,
        role: 'assistant',
        content: `Chat session reset. How can I assist you, **${activeName}**?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    persistMessages(resetMsg);
  };

  const roleTheme = {
    ADMIN: {
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
      pill: 'bg-purple-600',
      title: 'ADMIN COPILOT',
      glow: 'shadow-purple-500/20',
    },
    EMPLOYEE: {
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      pill: 'bg-emerald-600',
      title: 'EMPLOYEE COPILOT',
      glow: 'shadow-emerald-500/20',
    },
    INTERN: {
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      pill: 'bg-amber-600',
      title: 'INTERN COPILOT',
      glow: 'shadow-amber-500/20',
    },
  }[role] || {
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    pill: 'bg-indigo-600',
    title: 'HRM COPILOT',
    glow: 'shadow-indigo-500/20',
  };

  if (!currentUser) {
    return null;
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[999]">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            id="hrm-chatbot-trigger"
            aria-label="Open WorkPulse AI Assistant"
            className="relative flex items-center justify-center w-14 h-14 rounded-full bg-indigo-600 text-white shadow-xl hover:bg-indigo-700 active:scale-95 transition-all duration-200 hover:shadow-2xl hover:shadow-indigo-500/30 group"
          >
            <Bot className="w-7 h-7 transition-transform duration-200 group-hover:scale-110" />
            <Sparkles className="w-3.5 h-3.5 absolute top-2.5 right-2.5 text-amber-300 animate-pulse" />
            
            {/* Unread indicator badge */}
            {hasUnread && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
              </span>
            )}

            {/* Hover Tooltip */}
            <span className="absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-lg pointer-events-none">
              WorkPulse AI Assistant • {roleTheme.title}
            </span>
          </button>
        ) : null}

        {/* Expandable 380px x 520px Floating Card */}
        {isOpen && (
          <div 
            id="hrm-chatbot-card"
            className="w-[380px] h-[520px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 fade-in-0 duration-200"
          >
            {/* Header */}
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 select-none">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md relative flex-shrink-0">
                  <Bot className="w-4 h-4" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900"></span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold tracking-tight text-white truncate">WorkPulse AI</h3>
                    <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-indigo-500/30 text-indigo-200 rounded border border-indigo-500/40">
                      Gemini
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide border ${roleTheme.badge}`}>
                      {roleTheme.title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearChat}
                  title="Reset conversation"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close Assistant"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conversation Messages Stream */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/50 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3 shadow-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-xs font-medium'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-bl-xs'
                    }`}
                  >
                    {/* Assistant Message Rendering */}
                    <div className="whitespace-pre-wrap space-y-1.5">
                      {msg.content.split('\n').map((line, idx) => {
                        if (line.startsWith('### ')) {
                          return <p key={idx} className="font-bold text-slate-900 dark:text-white text-[13px] border-b border-slate-100 dark:border-slate-700 pb-1 mb-1">{line.replace('### ', '')}</p>;
                        }
                        if (line.startsWith('• ') || line.startsWith('- ')) {
                          const cleanText = line.replace(/^[•\-]\s*/, '');
                          const codeMatch = cleanText.match(/`([^`]+)`/);
                          return (
                            <p key={idx} className="pl-2 flex items-start gap-1.5">
                              <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                              <span>
                                {codeMatch ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleSendMessage(codeMatch[1])}
                                      className="font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 text-[11px] font-semibold cursor-pointer transition-colors"
                                      title={`Locate ${codeMatch[1]}`}
                                    >
                                      {codeMatch[1]}
                                    </button>
                                    {' ' + cleanText.replace(codeMatch[0], '').trim()}
                                  </>
                                ) : (
                                  cleanText
                                )}
                              </span>
                            </p>
                          );
                        }
                        return <p key={idx}>{line}</p>;
                      })}
                    </div>

                    {/* Interactive Action Dispatch Buttons */}
                    {msg.actionPayload && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-1.5">
                        {msg.actionPayload.type === 'EXECUTE_CLOCK_IN' && (
                          <button
                            onClick={() => handleExecuteAction(msg.actionPayload!)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-xs transition-colors"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            Confirm & Clock In Now
                          </button>
                        )}

                        {msg.actionPayload.type === 'TRIGGER_SEED' && (
                          <button
                            onClick={() => handleExecuteAction(msg.actionPayload!)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg shadow-xs transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Dispatch 10 Staff Seeder
                          </button>
                        )}

                        {msg.actionPayload.type === 'FIND_LOCATION' && msg.actionPayload.payload?.user && (
                          <button
                            onClick={() => handleExecuteAction(msg.actionPayload!)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-[11px] font-bold rounded-lg shadow-xs transition-colors"
                          >
                            <MapPin className="w-3.5 h-3.5 text-amber-400" />
                            Highlight on Radar Map
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {/* Typing Indicator */}
              {loading && (
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 max-w-[140px]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                  <span className="text-[11px] font-medium animate-pulse">Thinking...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Role-Aware Quick Prompt Chips */}
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {getPromptChips().map((chip, i) => {
                const Icon = chip.icon;
                return (
                  <button
                    key={i}
                    type="button"
                    id={`prompt-chip-${chip.intent.toLowerCase().replace(/_/g, '-')}`}
                    onClick={() => handleSendMessage(chip.label, chip.intent)}
                    disabled={loading}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 whitespace-nowrap shadow-2xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer select-none"
                  >
                    <Icon className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                    <span>{chip.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Ask ${role.toLowerCase()} assistant...`}
                disabled={loading}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-700/60 focus:bg-white dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:hover:bg-indigo-600"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
