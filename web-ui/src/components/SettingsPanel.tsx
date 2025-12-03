import React, { useState, useEffect } from 'react';
import { useOpenCode } from '../lib/OpenCodeContext';
import type { EnhancedProvider } from '../types/EnhancedProvider';
import ProviderModelCard from './ProviderModelCard';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { addProvider, updateProvider, removeProvider, providers } = useOpenCode();

  const [activeTab, setActiveTab] = useState<'providers' | 'models'>('providers');
  const [providerForm, setProviderForm] = useState<Partial<EnhancedProvider>>({
    id: '',
    name: '',
    baseUrl: '',
    apiKey: '',
    routingMethod: 'auto',
    gatewayEndpoint: '',
    routingPreferences: {
      preferDirect: true,
      fallbackEnabled: true,
      healthCheckInterval: 30000,
    },
    healthStatus: 'unknown',
    consecutiveFailures: 0,
    customHeaders: {},
  });
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (selectedProviderId) {
      const provider = providers.find((p) => p.id === selectedProviderId);
      if (provider) {
        setProviderForm(provider);
        setIsEditing(true);
      }
    } else {
      resetForm();
      setIsEditing(false);
    }
  }, [selectedProviderId, providers]);

  const resetForm = () => {
    setProviderForm({
      id: '',
      name: '',
      baseUrl: '',
      apiKey: '',
      routingMethod: 'auto',
      gatewayEndpoint: '',
      routingPreferences: {
        preferDirect: true,
        fallbackEnabled: true,
        healthCheckInterval: 30000,
      },
      healthStatus: 'unknown',
      consecutiveFailures: 0,
      customHeaders: {},
    });
  };

  if (!isOpen) return null;

  const handleSaveProvider = async () => {
    try {
      if (isEditing && selectedProviderId) {
        // Update existing provider
        updateProvider(selectedProviderId, providerForm as EnhancedProvider);
      } else {
        // Add new provider
        const newProvider: EnhancedProvider = {
          id: providerForm.id || `provider-${Date.now()}`,
          name: providerForm.name || 'New Provider',
          baseUrl: providerForm.baseUrl || '',
          apiKey: providerForm.apiKey || '',
          routingMethod: providerForm.routingMethod || 'auto',
          gatewayEndpoint: providerForm.gatewayEndpoint,
          routingPreferences: providerForm.routingPreferences || {
            preferDirect: true,
            fallbackEnabled: true,
            healthCheckInterval: 30000,
          },
          healthStatus: 'unknown',
          consecutiveFailures: 0,
          customHeaders: providerForm.customHeaders || {},
        };
        addProvider(newProvider);
      }

      resetForm();
      setSelectedProviderId(null);
      alert('Provider configuration saved successfully!');
    } catch (error) {
      console.error('Failed to save provider configuration:', error);
      alert('Failed to save provider configuration');
    }
  };

  const handleDeleteProvider = (providerId: string) => {
    if (window.confirm('Are you sure you want to delete this provider?')) {
      removeProvider(providerId);
      if (selectedProviderId === providerId) {
        resetForm();
        setSelectedProviderId(null);
        setIsEditing(false);
      }
    }
  };

  const handleSelectProvider = (providerId: string) => {
    setSelectedProviderId(providerId === selectedProviderId ? null : providerId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl max-h-5/6 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 px-4 ${activeTab === 'providers' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            onClick={() => setActiveTab('providers')}
          >
            Providers
          </button>
          <button
            className={`flex-1 py-3 px-4 ${activeTab === 'models' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            onClick={() => setActiveTab('models')}
          >
            Models
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          {activeTab === 'providers' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Provider List */}
                <div className="md:w-1/3">
                  <h3 className="text-lg font-medium mb-4">Configured Providers</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {providers.map((provider) => (
                      <div
                        key={provider.id}
                        className={`p-3 rounded border cursor-pointer transition-colors ${
                          selectedProviderId === provider.id
                            ? 'bg-blue-100 border-blue-500'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                        onClick={() => handleSelectProvider(provider.id)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{provider.name}</span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              provider.healthStatus === 'healthy'
                                ? 'bg-green-100 text-green-800'
                                : provider.healthStatus === 'degraded'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : provider.healthStatus === 'failing'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {provider.healthStatus}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{provider.baseUrl}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Routing: {provider.routingMethod}{' '}
                          {provider.gatewayEndpoint ? `(via ${provider.gatewayEndpoint})` : ''}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProvider(provider.id);
                          }}
                          className="mt-2 text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                    {providers.length === 0 && (
                      <p className="text-gray-500 italic">No providers configured yet</p>
                    )}
                  </div>
                </div>

                {/* Provider Configuration Form */}
                <div className="md:w-2/3">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">
                      {isEditing ? 'Edit Provider' : 'Add New Provider'}
                    </h3>
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          // Add Z.ai template provider
                          const zaiTemplate: Partial<EnhancedProvider> = {
                            id: `zai-${Date.now()}`,
                            name: 'Z.ai Coding Plan API (Template)',
                            baseUrl: 'https://api.z.ai/api/coding/paas/v4',
                            apiKey: '',
                            routingMethod: 'gateway',
                            gatewayEndpoint: '',
                            routingPreferences: {
                              preferDirect: false,
                              fallbackEnabled: true,
                              healthCheckInterval: 30000,
                            },
                            healthStatus: 'unknown',
                            consecutiveFailures: 0,
                            customHeaders: {
                              'Content-Type': 'application/json',
                              'User-Agent': 'OpenCode-LiteLLM-Gateway/1.0',
                            },
                          };
                          setProviderForm(zaiTemplate);
                        }}
                        className="px-3 py-1 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        Use Z.ai Template
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Provider Name
                      </label>
                      <input
                        type="text"
                        value={providerForm.name || ''}
                        onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., OpenAI, Z.ai, Custom API"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Base URL
                      </label>
                      <input
                        type="text"
                        value={providerForm.baseUrl || ''}
                        onChange={(e) =>
                          setProviderForm({ ...providerForm, baseUrl: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://api.example.com/v1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API Key
                      </label>
                      <input
                        type="password"
                        value={providerForm.apiKey || ''}
                        onChange={(e) =>
                          setProviderForm({ ...providerForm, apiKey: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your API key"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Routing Method
                      </label>
                      <select
                        value={providerForm.routingMethod || 'auto'}
                        onChange={(e) =>
                          setProviderForm({ ...providerForm, routingMethod: e.target.value as any })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="auto">Auto (Test and decide)</option>
                        <option value="direct">Direct API</option>
                        <option value="gateway">Via LiteLLM Gateway</option>
                      </select>
                      <p className="mt-1 text-sm text-gray-500">
                        Choose how requests to this provider should be routed
                      </p>
                    </div>

                    {(providerForm.routingMethod === 'gateway' ||
                      providerForm.routingMethod === 'auto') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Gateway Endpoint (Required for Gateway routing)
                        </label>
                        <input
                          type="text"
                          value={providerForm.gatewayEndpoint || ''}
                          onChange={(e) =>
                            setProviderForm({ ...providerForm, gatewayEndpoint: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="https://your-gateway.example.com"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          The endpoint for your LiteLLM gateway service
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Custom Headers (JSON format)
                      </label>
                      <textarea
                        value={JSON.stringify(providerForm.customHeaders || {}, null, 2)}
                        onChange={(e) => {
                          try {
                            const headers = JSON.parse(e.target.value);
                            setProviderForm({ ...providerForm, customHeaders: headers });
                          } catch (error) {
                            // Ignore invalid JSON
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder='{\n  "X-Custom-Header": "value"\n}'
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="preferDirect"
                        checked={providerForm.routingPreferences?.preferDirect}
                        onChange={(e) =>
                          setProviderForm({
                            ...providerForm,
                            routingPreferences: {
                              ...providerForm.routingPreferences,
                              preferDirect: e.target.checked,
                            } as any,
                          })
                        }
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="preferDirect" className="ml-2 block text-sm text-gray-700">
                        Prefer direct API calls when possible
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="fallbackEnabled"
                        checked={providerForm.routingPreferences?.fallbackEnabled}
                        onChange={(e) =>
                          setProviderForm({
                            ...providerForm,
                            routingPreferences: {
                              ...providerForm.routingPreferences,
                              fallbackEnabled: e.target.checked,
                            } as any,
                          })
                        }
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="fallbackEnabled" className="ml-2 block text-sm text-gray-700">
                        Enable fallback to gateway if direct API fails
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gateway Configuration Section */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-medium mb-4">Gateway Configuration</h3>
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="text-sm text-gray-700 mb-2">
                    LiteLLM Gateway helps with providers that have CORS restrictions, like Z.ai.
                  </p>
                  <p className="text-sm text-gray-700">
                    To use the LiteLLM Gateway, you need to set up a backend service. For
                    development, you might use a local proxy or a cloud service.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'models' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Model Selection</h3>
              <p className="text-gray-600">
                Available models from your configured providers. Select your preferred model for
                interactions.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providers.length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    No providers configured yet. Please add a provider in the Providers tab first.
                  </div>
                ) : (
                  providers.map((provider) => (
                    <ProviderModelCard key={provider.id} provider={provider} />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
          {activeTab === 'providers' && (
            <>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProviderId(null);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel Edit
                </button>
              )}
              <button
                type="button"
                onClick={handleSaveProvider}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isEditing ? 'Update Provider' : 'Add Provider'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
