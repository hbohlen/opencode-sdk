import { useState } from "react";
import { useOpenCode } from "../contexts/OpenCodeContext";

export default function SettingsPanel() {
  const { client, isConnected } = useOpenCode();
  const [apiKey, setApiKey] = useState("");
  const [endpoint, setEndpoint] = useState("https://api.opencode-ai.com");
  const [selectedProvider, setSelectedProvider] = useState("openai");

  const handleSaveSettings = () => {
    // TODO: Implement settings persistence
    console.log("Settings saved:", { apiKey, endpoint, selectedProvider });
    alert(
      "Settings saved! (Note: Persistence will be implemented in future tasks)",
    );
  };

  const handleTestConnection = async () => {
    // TODO: Implement connection test
    console.log("Testing connection...");
    alert(
      "Connection test will be implemented when OpenCode SDK integration is complete.",
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Settings
          </h2>

          {/* Connection Status */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Connection Status
              </span>
              <div
                className={`px-3 py-1 text-xs rounded-full ${
                  isConnected
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }`}
              >
                {isConnected ? "Connected" : "Disconnected"}
              </div>
            </div>
          </div>

          {/* API Settings */}
          <div className="space-y-6">
            <div>
              <label
                htmlFor="provider"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Provider
              </label>
              <select
                id="provider"
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="google">Google</option>
                <option value="opencode">OpenCode</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="apiKey"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                API Key
              </label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Your API key is stored locally and never sent to our servers.
              </p>
            </div>

            <div>
              <label
                htmlFor="endpoint"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                API Endpoint
              </label>
              <input
                type="url"
                id="endpoint"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="https://api.opencode-ai.com"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button onClick={handleSaveSettings} className="btn-primary">
              Save Settings
            </button>
            <button onClick={handleTestConnection} className="btn-secondary">
              Test Connection
            </button>
          </div>

          {/* Info Section */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              About OpenCode Web UI
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              This interface allows you to interact with OpenCode AI models
              through a web interface. Settings are stored locally in your
              browser for privacy and security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
