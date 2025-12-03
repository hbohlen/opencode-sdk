import React, { useState, useEffect } from 'react';
import { useOpenCode } from '../lib/OpenCodeContext';
import type { EnhancedProvider } from '../types/EnhancedProvider';
import type { ModelInfo } from '../services/ModelDiscoveryService';

interface ProviderModelCardProps {
  provider: EnhancedProvider;
}

const ProviderModelCard: React.FC<ProviderModelCardProps> = ({ provider }) => {
  const { discoverModels, modelDiscoveryService } = useOpenCode();
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Test provider connection when component mounts or provider changes
  useEffect(() => {
    const testConnection = async () => {
      try {
        setLoading(true);
        setError(null);
        const testResult = await modelDiscoveryService.testProviderConnection(provider);
        if (!testResult.success) {
          setError(testResult.message);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, [provider.id]);

  const handleDiscoverModels = async () => {
    try {
      setLoading(true);
      setError(null);
      const discoveredModels = await discoverModels(provider.id);
      setModels(discoveredModels);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md border">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium">{provider.name}</h4>
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
      <p className="text-sm text-gray-600 mb-3">Base URL: {provider.baseUrl}</p>

      <button
        className="px-3 py-1 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
        onClick={handleDiscoverModels}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Discover Models'}
      </button>

      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}

      <div className="mt-3">
        {models.length > 0 ? (
          <ul className="space-y-1">
            {models.map((model: any) => (
              <li key={model.id} className="bg-white p-2 rounded border flex justify-between">
                <span>{model.name}</span>
                <button className="text-blue-600 hover:text-blue-800 text-sm">Select</button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Click "Discover Models" to load available models</p>
        )}
      </div>
    </div>
  );
};

export default ProviderModelCard;
