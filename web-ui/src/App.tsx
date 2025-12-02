import { Routes, Route } from "react-router-dom";
import { OpenCodeProvider } from "./contexts/OpenCodeContext";
import ChatInterface from "./components/ChatInterface";
import SettingsPanel from "./components/SettingsPanel";
import Header from "./components/Header";
import "./App.css";

function App() {
  return (
    <OpenCodeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<ChatInterface />} />
            <Route path="/settings" element={<SettingsPanel />} />
          </Routes>
        </main>
      </div>
    </OpenCodeProvider>
  );
}

export default App;
