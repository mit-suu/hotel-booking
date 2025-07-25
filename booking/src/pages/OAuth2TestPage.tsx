import React, { useState } from 'react';

const OAuth2TestPage: React.FC = () => {
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testBackendConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/oauth2/test');
      const data = await response.json();
      setResponse(`Backend Test: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResponse(`Backend Connection Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testOAuth2Config = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/oauth2/config/debug');
      const data = await response.json();
      setResponse(`OAuth2 Config: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResponse(`OAuth2 Config Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testGoogleAuth = () => {
    console.log('Redirecting to Google OAuth2...');
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const testDirectGoogleAuth = () => {
    console.log('Testing direct Google OAuth2 URL...');
    window.open('http://localhost:8080/oauth2/authorization/google', '_blank');
  };

  const testScenarios = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/oauth2/scenarios');
      const data = await response.json();
      setResponse(`OAuth2 Test Scenarios: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResponse(`Scenarios Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testTopCities = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/admin/analytics/test-cities', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      setResponse(`Top Cities Test: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResponse(`Top Cities Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">OAuth2 Debug Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={testBackendConnection}
            disabled={loading}
            className="p-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Test Backend Connection
          </button>
          
          <button
            onClick={testOAuth2Config}
            disabled={loading}
            className="p-4 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Test OAuth2 Config
          </button>
          
          <button
            onClick={testScenarios}
            disabled={loading}
            className="p-4 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            View Test Scenarios
          </button>
          
          <button
            onClick={testTopCities}
            disabled={loading}
            className="p-4 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
          >
            Test Top Cities
          </button>
          
          <button
            onClick={testGoogleAuth}
            className="p-4 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Test Google OAuth2 (Same Tab)
          </button>
          
          <button
            onClick={testDirectGoogleAuth}
            className="p-4 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Test Google OAuth2 (New Tab)
          </button>
        </div>

        {response && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-2">Response:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {response}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-2">Debug Info:</h2>
          <ul className="text-sm">
            <li><strong>Frontend URL:</strong> {window.location.origin}</li>
            <li><strong>Expected Backend URL:</strong> http://localhost:8080</li>
            <li><strong>OAuth2 Auth URL:</strong> http://localhost:8080/oauth2/authorization/google</li>
            <li><strong>Success Callback:</strong> {window.location.origin}/auth/oauth2/success</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OAuth2TestPage; 