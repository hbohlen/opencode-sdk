import { useState } from "react";
import { useOpenCode } from "../contexts/OpenCodeContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatInterface() {
  const { isConnected, selectedProvider, selectedModel, availableModels } =
    useOpenCode();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Check if we have a selected provider and model for custom providers
    if (!selectedProvider || !selectedModel) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Please select a provider and model in the Settings panel first.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Use custom provider API call instead of OpenCode SDK
      const chatPayload = {
        model: selectedModel.id,
        messages: [{ role: "user", content: inputValue }],
        max_tokens: selectedModel.maxTokens || 1000,
        temperature: 0.7,
      };

      // Try different chat completion endpoint formats
      const endpoints = [
        `${selectedProvider.baseUrl}/v1/chat/completions`, // OpenAI-style
        `${selectedProvider.baseUrl}/chat/completions`, // Z.ai and others
      ];

      let response: Response | null = null;
      let lastError: Error | null = null;

      for (const endpoint of endpoints) {
        try {
          response = await fetch(endpoint, {
            method: "POST",
            headers: {
              Authorization:
                selectedProvider.authType === "bearer"
                  ? `Bearer ${selectedProvider.apiKey}`
                  : `Bearer ${selectedProvider.apiKey}`,
              "Content-Type": "application/json",
              ...selectedProvider.customHeaders,
            },
            body: JSON.stringify(chatPayload),
          });

          if (response.ok) break;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
        }
      }

      if (!response || !response.ok) {
        const errorMsg = response
          ? `HTTP ${response.status}: ${response.statusText}`
          : lastError?.message || "Failed to reach chat completions endpoint";
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const assistantContent =
        data.choices?.[0]?.message?.content || "No response received";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-[600px] flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                OpenCode Assistant
              </h2>
              {selectedModel && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Model:
                  </span>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                    {selectedModel.name}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {availableModels.length > 0 && (
                <div className="flex items-center space-x-2">
                  <label
                    htmlFor="model-select"
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    Model:
                  </label>
                  <select
                    id="model-select"
                    value={selectedModel?.id || ""}
                    onChange={(e) => {
                      // This will be handled by the context
                      const model = availableModels.find(
                        (m) => m.id === e.target.value,
                      );
                      if (model) {
                        // For now, we'll just log - the context method will be called from settings
                        console.log("Selected model:", model);
                      }
                    }}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select a model</option>
                    {availableModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div
                className={`px-2 py-1 text-xs rounded-full ${
                  isConnected
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }`}
              >
                {isConnected ? "Connected" : "Disconnected"}
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
              <p className="text-lg">Welcome to OpenCode Web UI!</p>
              <p className="text-sm mt-2">
                {isConnected
                  ? "Start a conversation with the OpenCode assistant."
                  : "Please check your connection settings to start chatting."}
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse">...</div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    OpenCode is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                isConnected
                  ? "Type your message... (Press Enter to send)"
                  : "Connect to OpenCode to start chatting..."
              }
              disabled={!isConnected || isLoading}
              className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800"
              rows={2}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || !isConnected || isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
