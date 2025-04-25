"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

export default function ExperimentalPage() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<{query: string, response: string}[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    
    try {
      const apiResponse = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });
      
      // Check if response is OK before parsing JSON
      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error(`API error (${apiResponse.status}):`, errorText);
        throw new Error(`API error: ${apiResponse.status}`);
      }
      
      const data = await apiResponse.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setResponse(data.response);
      setHistory(prev => [...prev, {query, response: data.response}]);
      setQuery("");
    } catch (error) {
      console.error("Error fetching response:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred while fetching the response.";
      setResponse(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/"
          className="inline-flex items-center text-primary hover:text-primary-dark transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </Link>
      </div>
      
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-primary-dark to-primary text-white p-6">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Medical Assistant
          </h1>
          <p className="text-white/90 mt-2">
            Ask questions about first aid, medical procedures, or emergency response
          </p>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex flex-col space-y-4">
              <label htmlFor="query" className="text-charcoal font-medium">
                What do you need help with?
              </label>
                <div className="relative">
                <input
                  id="query"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., How do I perform CPR?"
                  className="w-full border border-gray-300 rounded-lg p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-charcoal"
                  disabled={isLoading}
                />
                {query && !isLoading && (
                  <button 
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-14 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  </button>
                )}
                <button 
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary-dark"
                  disabled={isLoading || !query.trim()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
                </div>
            </div>
          </form>

          {isLoading && (
            <div className="flex justify-center my-8">
              <div className="animate-pulse flex space-x-4 items-center">
                <div className="h-3 w-3 bg-primary rounded-full"></div>
                <div className="h-3 w-3 bg-primary rounded-full"></div>
                <div className="h-3 w-3 bg-primary rounded-full"></div>
                <span className="text-charcoal-light ml-2">Processing your request...</span>
              </div>
            </div>
          )}

          {response && !isLoading && (
            <div className="bg-surface border border-gray-200 rounded-lg p-6 my-6">
              <h3 className="font-semibold text-charcoal mb-3">AI Response:</h3>
              <div className="prose prose-blue max-w-none text-charcoal">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]} 
                  rehypePlugins={[rehypeSanitize]}
                  components={{
                    // Ensure all text is properly readable with darker color
                    p: ({children}) => <p className="text-charcoal mb-4">{children}</p>,
                    li: ({children}) => <li className="text-charcoal my-1">{children}</li>,
                    
                    // Make headings more prominent with primary color
                    h1: ({children}) => <h1 className="text-primary text-2xl font-bold mt-6 mb-4">{children}</h1>,
                    h2: ({children}) => <h2 className="text-primary text-xl font-bold mt-6 mb-3 border-b border-primary/20 pb-1">{children}</h2>,
                    h3: ({children}) => <h3 className="text-primary-dark text-lg font-bold mt-5 mb-2">{children}</h3>,
                    
                    // Make bold text stand out in accent color for warnings/key steps
                    strong: ({children}) => <strong className="font-bold text-accent-dark">{children}</strong>,
                    
                    // Enhanced blockquote styling
                    blockquote: ({children}) => (
                      <blockquote className="border-l-4 border-accent pl-4 py-2 my-4 bg-accent/5 text-charcoal">
                        {children}
                      </blockquote>
                    ),
                    
                    // Keep links in primary color
                    a: ({href, children}) => (
                      <a href={href} className="text-primary hover:text-primary-dark underline">
                        {children}
                      </a>
                    ),
                    
                    // Better list styling
                    ul: ({children}) => <ul className="list-disc pl-6 my-4 space-y-1">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal pl-6 my-4 space-y-1">{children}</ol>,
                    
                    // Add special styling for horizontal rules
                    hr: () => <hr className="my-6 border-t-2 border-primary/20" />,
                    
                    // Code blocks with better styling
                    code: ({ children}) => 
                      (
                        <pre className="bg-charcoal-dark text-white rounded-md p-4 overflow-auto my-4 font-mono text-sm">
                          <code>{children}</code>
                        </pre>
                      )
                  }}
                >
                  {response}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-charcoal mb-4">Previous Questions</h3>
              <div className="space-y-4">
                {history.map((item, index) => (
                  <div key={index} className="bg-surface p-4 rounded-lg border border-gray-200">
                    <p className="font-medium text-charcoal">{item.query}</p>
                    <div className="text-sm text-charcoal mt-2 line-clamp-2">
                      <ReactMarkdown>
                        {`${item.response.substring(0, 150)}...`}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-accent/10 border border-accent/20 rounded-lg p-6">
        <h3 className="font-semibold text-accent-dark mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Important Notice
        </h3>
        <p className="text-accent-dark text-sm">
          In case of a real medical emergency, please call your local emergency number immediately. 
          This AI assistant is not a substitute for professional medical advice or emergency services.
        </p>
      </div>
    </div>
  );
}