"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import toast from "react-hot-toast"; 

export default function ExperimentalPage() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string; predictions?: string[] }[]
  >([]);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: query }]);

    try {
      const apiResponse = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error(`API error (${apiResponse.status}):`, errorText);
        throw new Error(`API error: ${apiResponse.status}`);
      }

      const data = await apiResponse.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Add assistant message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          predictions: data.predictions,
        },
      ]);
      
      // Only show success toast for non-prediction clicks to reduce notification noise
      if (e) {
        toast.success("Response received", { duration: 2000 });
      }
      
      setQuery("");
    } catch (error) {
      console.error("Error fetching response:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while fetching the response.";

      toast.error(`Error: ${errorMessage}`, { duration: 5000 });
      
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${errorMessage}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePredictionClick = (prediction: string) => {
  try {
    setQuery(prediction); // This is still useful for showing in the input field
    
    // Create a modified version of handleSubmit that uses the prediction directly
    setMessages((prev) => [...prev, { role: "user", content: prediction }]);
    setIsLoading(true);
    
    // Process the prediction
    fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: prediction }), // Use prediction directly
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Add assistant message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          predictions: data.predictions,
        },
      ]);
      
      setQuery(""); // Clear input after successful response
    })
    .catch(error => {
      console.error("Error fetching response:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : "An error occurred while fetching the response.";
        
      toast.error(`Error: ${errorMessage}`, { duration: 5000 });
      
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${errorMessage}` },
      ]);
    })
    .finally(() => {
      setIsLoading(false);
    });
    
  } catch (error) {
    toast.error("Failed to process suggested response");
    console.error("Prediction click error:", error);
      }
    };

  return (
    <div className="flex flex-col h-screen bg-white rounded-lg">
      {/* Header */}
      <header className="border-b border-gray-200 py-2 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center relative">
          <h1 className="text-lg sm:text-xl text-blue-500 font-bold flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 sm:h-6 sm:w-6 mr-1.5 sm:mr-2 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Aidmate AI
          </h1>
        </div>
      </header>

      {/* Main chat area remains the same */}
      <main className="flex-grow overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-xl font-medium mb-2">
              Ask anything about first aid or medical procedures
            </p>
            <p className="mt-2 max-w-lg text-base">
              For example: "How do I perform CPR?" or "What should I do for a
              snake bite?"
            </p>
          </div>
        ) : (
          <div>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${
                  msg.role === "assistant" ? "bg-gray-50" : "bg-white"
                }`}
              >
                <div className="max-w-3xl mx-auto py-6 px-4 md:px-6">
                  {msg.role === "user" ? (
                    <div className="flex justify-end mb-2">
                      <div className="bg-primary text-white px-4 py-2 rounded-lg max-w-[80%]">
                        <p className="text-base">{msg.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <div className="prose prose-base max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeSanitize]}
                          components={{
                            p: ({ children }) => (
                              <p className="mb-4 text-gray-800">{children}</p>
                            ),
                            li: ({ children }) => (
                              <li className="my-1 text-gray-800">
                                {children}
                              </li>
                            ),
                            h1: ({ children }) => (
                              <h1 className="text-xl font-bold text-gray-900 mt-6 mb-3">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-lg font-bold text-gray-900 mt-5 mb-3">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-base font-bold text-gray-900 mt-4 mb-2">
                                {children}
                              </h3>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-bold">{children}</strong>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-gray-200 pl-4 py-1 my-3 text-gray-700">
                                {children}
                              </blockquote>
                            ),
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                className="text-primary underline"
                              >
                                {children}
                              </a>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc pl-6 my-3">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal pl-6 my-3">
                                {children}
                              </ol>
                            ),
                            code: ({ children }) => (
                              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm text-gray-800">
                                {children}
                              </code>
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                  {msg.predictions && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Choose a response:</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.predictions.map((prediction, i) => (
                          <button
                            key={i}
                            onClick={() => handlePredictionClick(prediction)}
                            className="px-3 py-2 bg-blue-100 rounded-lg text-black text-sm hover:bg-blue-200 border border-blue-200"
                          >
                            {prediction}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="bg-gray-50">
                <div className="max-w-3xl mx-auto py-6 px-4 md:px-6">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3 flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div className="flex items-center h-8">
                      <div className="flex space-x-2 items-center">
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse"></div>
                        <div
                          className="h-2 w-2 bg-gray-400 rounded-full animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="h-2 w-2 bg-gray-400 rounded-full animate-pulse"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={endOfMessagesRef} />
          </div>
        )}
      </main>

      {/* Input area */}
      <footer className="border-t border-gray-200 bg-white py-4 rounded-lg">
        <div className="max-w-3xl mx-auto px-4">
          <div className="mb-3">
            <div className="flex items-center text-accent-dark text-xs">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              For emergencies, call the Ethiopian national emergency number 907
              immediately. This AI is not a substitute for professional medical
              advice.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="relative">
            <div className="relative shadow-sm rounded-3xl border border-gray-300">
              <textarea
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type your question here..."
                className="w-full p-3 pr-24 bg-white outline-none resize-none text-gray-800 rounded-3xl"
                disabled={isLoading}
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height =
                    Math.min(target.scrollHeight, 150) + "px"; // Reduced max height
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && query.trim()) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <div className="absolute right-3 bottom-2 flex gap-2">
                {query && !isLoading && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-white rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || !query.trim()}
                  onClick={() => {
                    if (!query.trim()) {
                      toast.error("Please enter a question");
                    }
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </form>
          <div className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send, Shift+Enter for a new line
          </div>
        </div>
      </footer>
    </div>
  );
}