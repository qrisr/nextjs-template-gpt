"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const sampleQuestions = [
  { text: "Erkläre mir React", icon: "💡" },
  { text: "Was ist Next.js?", icon: "🔍" },
  { text: "Wie funktioniert TypeScript?", icon: "📘" },
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

const UserIcon = () => (
  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
  </div>
);

const AssistantIcon = () => (
  <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M16.5 7.5h-9v9h9v-9z" />
      <path fillRule="evenodd" d="M8.25 2.25A.75.75 0 019 3v.75h2.25V3a.75.75 0 011.5 0v.75H15V3a.75.75 0 011.5 0v.75h.75a3 3 0 013 3v.75H21A.75.75 0 0121 9h-.75v2.25H21a.75.75 0 010 1.5h-.75V15H21a.75.75 0 010 1.5h-.75v.75a3 3 0 01-3 3h-.75V21a.75.75 0 01-1.5 0v-.75h-2.25V21a.75.75 0 01-1.5 0v-.75H9V21a.75.75 0 01-1.5 0v-.75h-.75a3 3 0 01-3-3v-.75H3A.75.75 0 013 15h.75v-2.25H3a.75.75 0 010-1.5h.75V9H3a.75.75 0 010-1.5h.75v-.75a3 3 0 013-3h.75V3a.75.75 0 01.75-.75zM6 6.75A.75.75 0 016.75 6h10.5a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V6.75z" clipRule="evenodd" />
    </svg>
  </div>
);

const SpeakerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
    <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
  </svg>
);

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: "Hallo! Ich bin Jimmy, dein persönlicher KI-Assistent. Wie kann ich dir heute helfen?"
        }
      ]);
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: input,
          history: messages
        }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const playAudioResponse = async (text: string, messageId: number) => {
    if (isPlaying === messageId.toString()) {
      setIsPlaying(null);
      return;
    }

    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Abrufen der Audiodaten');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      setIsPlaying(messageId.toString());
      
      audio.onended = () => {
        setIsPlaying(null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.play();
    } catch (error) {
      console.error('Fehler bei der Audiowiedergabe:', error);
      setIsPlaying(null);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex w-full flex-1 flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center">
              <h1 className="mb-8 text-4xl font-bold text-gray-800">Wie kann ich dir helfen?</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl w-full">
                {sampleQuestions.map((question, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(question.text)}
                    className="flex items-center justify-center space-x-2 rounded-lg border bg-white px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                  >
                    <span>{question.icon}</span>
                    <span>{question.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-3xl mx-auto">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-start space-x-3",
                    message.role === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"
                  )}
                >
                  {message.role === "user" ? <UserIcon /> : <AssistantIcon />}
                  <div
                    className={cn(
                      "flex flex-col rounded-lg px-4 py-2 max-w-[85%]",
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-white shadow-sm border"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">
                        {message.role === "user" ? "Du" : "Jimmy"}
                      </div>
                      {message.role === "assistant" && (
                        <button
                          onClick={() => playAudioResponse(message.content, i)}
                          className={cn(
                            "ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors",
                            isPlaying === i.toString() ? "text-blue-500" : "text-gray-400"
                          )}
                        >
                          <SpeakerIcon />
                        </button>
                      )}
                    </div>
                    <div className={cn(
                      "prose prose-sm max-w-none",
                      message.role === "user" 
                        ? "prose-invert prose-headings:text-white prose-p:text-white prose-strong:text-white prose-ul:text-white" 
                        : "prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-ul:text-gray-800"
                    )}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start space-x-3">
                  <AssistantIcon />
                  <div className="bg-white shadow-sm border rounded-lg px-4 py-2">
                    <div className="text-sm font-medium mb-1">Jimmy</div>
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "0.2s" }}></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="border-t bg-white p-4 shadow-sm">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Schreibe eine Nachricht..."
                className="flex-1 rounded-lg border-gray-200 bg-gray-50 p-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-black placeholder-gray-500"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading}
                className="rounded-lg bg-blue-500 p-3 text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
