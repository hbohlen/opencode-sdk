import { OpenCodeProvider } from './lib/OpenCodeContext';
import ChatInterface from './components/ChatInterface';
import './App.css';

function App() {
  return (
    <OpenCodeProvider>
      <div className="h-screen flex flex-col">
        <header className="bg-gray-800 text-white p-4">
          <h1 className="text-xl font-bold">OpenCode Web UI</h1>
        </header>
        <main className="flex-1 overflow-hidden">
          <ChatInterface />
        </main>
        <footer className="bg-gray-100 p-2 text-center text-sm text-gray-500">
          OpenCode Web Interface
        </footer>
      </div>
    </OpenCodeProvider>
  );
}

export default App
