import { useState, useEffect } from "react";
import { useOpenCode } from "../contexts/OpenCodeContext";

export default function SettingsPanel() {
  const {
    isConnected,
    connect,
    disconnect,
    isLoading,
    error,
    providers,
    selectedProvider,
    selectedModel,
    availableModels,
    addProvider,
    removeProvider,
    selectProvider,
    selectModel,
    discoverModels,
    testConnection,
  } = useOpenCode();

  const [activeTab, setActiveTab] = useState<
    "providers" | "models" | "settings"
  >("providers");

  // Provider form state
  const [providerForm, setProviderForm] = useState({
    name: "",
    baseUrl: "",
    apiKey: "",
    authType: "bearer" as const,
    customHeaders: "",
    isActive: false,
  });

  // Legacy state for backward compatibility
  const [apiKey, setApiKey] = useState("");
  const [endpoint, setEndpoint] = useState("https://api.opencode-ai.com");
  const [selectedProviderType, setSelectedProviderType] = useState("opencode");

  // Model discovery state
  const [isDiscoveringModels, setIsDiscoveringModels] = useState(false);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    error?: string;
  } | null>(null);

  // Provider management handlers
  const handleAddProvider = () => {
    if (
      !providerForm.name.trim() ||
      !providerForm.baseUrl.trim() ||
      !providerForm.apiKey.trim()
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Parse custom headers from string to Record
    let customHeaders: Record<string, string> = {};
    if (providerForm.customHeaders.trim()) {
      try {
        customHeaders = JSON.parse(providerForm.customHeaders);
      } catch {
        alert("Invalid JSON format for custom headers");
        return;
      }
    }

    addProvider({
      ...providerForm,
      customHeaders,
    });
    setProviderForm({
      name: "",
      baseUrl: "",
      apiKey: "",
      authType: "bearer",
      customHeaders: "",
      isActive: false,
    });
  };

  const handleRemoveProvider = (providerId: string) => {
    if (confirm("Are you sure you want to remove this provider?")) {
      removeProvider(providerId);
    }
  };

  const handleSelectProvider = (providerId: string) => {
    selectProvider(providerId);
  };

  const handleDiscoverModels = async () => {
    if (!selectedProvider) return;

    setIsDiscoveringModels(true);
    setDiscoveryError(null);

    const result = await discoverModels(selectedProvider.id);
    if (result.error) {
      setDiscoveryError(result.error);
    }

    setIsDiscoveringModels(false);
  };

  const handleTestConnection = async () => {
    if (!selectedProvider) return;

    setIsTestingConnection(true);
    setTestResult(null);

    const result = await testConnection(selectedProvider.id, selectedModel?.id);
    setTestResult(result);

    setIsTestingConnection(false);
  };

  const handleSelectModel = (modelId: string) => {
    selectModel(modelId);
  };

  // Legacy handlers for backward compatibility
  const handleSaveSettings = async () => {
    if (!apiKey.trim()) {
      alert("Please enter an API key");
      return;
    }

    try {
      await connect(apiKey, endpoint);
      localStorage.setItem("opencode-api-key", apiKey);
      localStorage.setItem("opencode-endpoint", endpoint);
      localStorage.setItem("opencode-provider", selectedProviderType);
      alert("Settings saved and connected successfully!");
    } catch (err) {
      alert(
        `Failed to connect: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  const handleTestLegacyConnection = async () => {
    if (!apiKey.trim()) {
      alert("Please enter an API key first");
      return;
    }

    try {
      await connect(apiKey, endpoint);
      alert("Connection successful!");
    } catch (err) {
      alert(
        `Connection failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  const handleDisconnect = () => {
    disconnect();
    localStorage.removeItem("opencode-api-key");
    localStorage.removeItem("opencode-endpoint");
    localStorage.removeItem("opencode-provider");
    setApiKey("");
    setEndpoint("https://api.opencode-ai.com");
    setSelectedProviderType("opencode");
  };

  // Load saved settings on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("opencode-api-key");
    const savedEndpoint = localStorage.getItem("opencode-endpoint");
    const savedProvider = localStorage.getItem("opencode-provider");

    if (savedApiKey) setApiKey(savedApiKey);
    if (savedEndpoint) setEndpoint(savedEndpoint);
    if (savedProvider) setSelectedProviderType(savedProvider);
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Settings
          </h2>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            {[
              { id: "providers", label: "Providers" },
              { id: "models", label: "Models" },
              { id: "settings", label: "Legacy Settings" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={
                  `flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }` as const
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Providers Tab */}
          {activeTab === "providers" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Custom Providers
                </h3>

                {/* Add Provider Form */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Add New Provider
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={providerForm.name}
                        onChange={(e) =>
                          setProviderForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="My Provider"
                        className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Base URL
                      </label>
                      <input
                        type="url"
                        value={providerForm.baseUrl}
                        onChange={(e) =>
                          setProviderForm((prev) => ({
                            ...prev,
                            baseUrl: e.target.value,
                          }))
                        }
                        placeholder="https://api.example.com"
                        className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        API Key
                      </label>
                      <input
                        type="password"
                        value={providerForm.apiKey}
                        onChange={(e) =>
                          setProviderForm((prev) => ({
                            ...prev,
                            apiKey: e.target.value,
                          }))
                        }
                        placeholder="sk-..."
                        className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Auth Type
                      </label>
                      <select
                        value={providerForm.authType}
                        onChange={(e) =>
                          setProviderForm((prev) => ({
                            ...prev,
                            authType: e.target.value as any,
                          }))
                        }
                        className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-600"
                      >
                        <option value="bearer">Bearer Token</option>
                        <option value="api-key">API Key Header</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Custom Headers (JSON)
                    </label>
                    <textarea
                      value={providerForm.customHeaders}
                      onChange={(e) =>
                        setProviderForm((prev) => ({
                          ...prev,
                          customHeaders: e.target.value,
                        }))
                      }
                      placeholder='{"X-Custom-Header": "value"}'
                      rows={2}
                      className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-600"
                    />
                  </div>
                  <div className="mt-4 flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={providerForm.isActive}
                        onChange={(e) =>
                          setProviderForm((prev) => ({
                            ...prev,
                            isActive: e.target.checked,
                          }))
                        }
                        className="rounded border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Set as active
                      </span>
                    </label>
                    <button
                      onClick={handleAddProvider}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded"
                    >
                      Add Provider
                    </button>
                  </div>
                </div>

                {/* Provider List */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Configured Providers
                  </h4>
                  {providers.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No providers configured yet.
                    </p>
                  ) : (
                    providers.map((provider) => (
                      <div
                        key={provider.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {provider.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {provider.baseUrl}
                            </p>
                          </div>
                          {provider.isActive && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleSelectProvider(provider.id)}
                            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
                          >
                            Select
                          </button>
                          <button
                            onClick={() => handleRemoveProvider(provider.id)}
                            className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Models Tab */}
          {activeTab === "models" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Model Management
                </h3>

                {selectedProvider ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Selected Provider:{" "}
                        <span className="font-medium">
                          {selectedProvider.name}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <button
                        onClick={handleDiscoverModels}
                        disabled={isDiscoveringModels}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded"
                      >
                        {isDiscoveringModels
                          ? "Discovering..."
                          : "Discover Models"}
                      </button>
                      <button
                        onClick={handleTestConnection}
                        disabled={isTestingConnection}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-medium rounded"
                      >
                        {isTestingConnection ? "Testing..." : "Test Connection"}
                      </button>
                    </div>

                    {discoveryError && (
                      <div className="p-3 bg-red-100 dark:bg-red-900 rounded text-red-700 dark:text-red-300 text-sm">
                        {discoveryError}
                      </div>
                    )}

                    {testResult && (
                      <div
                        className={`p-3 rounded text-sm ${testResult.success ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"}`}
                      >
                        {testResult.success
                          ? "Connection successful!"
                          : `Connection failed: ${testResult.error}`}
                      </div>
                    )}

                    {availableModels.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Available Models
                        </h4>
                        <div className="space-y-2">
                          {availableModels.map((model) => (
                            <div
                              key={model.id}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {model.name}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                  {model.capabilities.map((cap) => (
                                    <span
                                      key={cap}
                                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                                    >
                                      {cap}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <button
                                onClick={() => handleSelectModel(model.id)}
                                className={`px-3 py-1 text-xs rounded ${
                                  selectedModel?.id === model.id
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                }`}
                              >
                                {selectedModel?.id === model.id
                                  ? "Selected"
                                  : "Select"}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Please select a provider first in the Providers tab.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Legacy Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Connection Status */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Connection Status
                  </span>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`px-3 py-1 text-xs rounded-full ${
                        isConnected
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {isConnected ? "Connected" : "Disconnected"}
                    </div>
                    {isConnected && (
                      <button
                        onClick={handleDisconnect}
                        className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                </div>
                {error && (
                  <div className="mt-2 p-2 bg-red-100 dark:bg-red-900 rounded text-red-700 dark:text-red-300 text-sm">
                    {error}
                  </div>
                )}
                {isLoading && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Connecting...
                  </div>
                )}
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
                    value={selectedProviderType}
                    onChange={(e) => setSelectedProviderType(e.target.value)}
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
                    Your API key is stored locally and never sent to our
                    servers.
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
              <div className="flex items-center space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button onClick={handleSaveSettings} className="btn-primary">
                  Save Settings
                </button>
                <button
                  onClick={handleTestLegacyConnection}
                  className="btn-secondary"
                >
                  Test Connection
                </button>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              About Custom Model Management
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Configure custom OpenAI-compatible providers and discover
              available models. All settings are stored locally in your browser
              for privacy and security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
