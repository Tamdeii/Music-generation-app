import { useState } from 'react';
import { Music, Send, Loader2, LogOut, User } from 'lucide-react';

export default function Generate() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [user, setUser] = useState(null); 

  const handleGenerate = async () => {
    // If the input is empty or contains only whitespace, do nothing and exit.
    // trim: remove whitespace from both ends of a string
    if (!input.trim()) return;

    // Add user's message to chat history before sending request
    const userMessage = { sender: 'user', text: input };
    setChatHistory((prev) => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    // Send POST request to /api/generate-music endpoint
    try {
      const response = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });

      // Check if the response status is not OK (200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Parse response JSON for success flag and melody URL
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error('Generation failed');

      // Add bot's response to chat history after receiving successful response
      const botMessage = { sender: 'bot', text: data.melody || 'Melody generated successfully!' };
      setChatHistory((prev) => [...prev, botMessage]);

    } catch (error) {
      const errorMessage = { sender: 'bot', text: 'Error generating music.' };
      setChatHistory((prev) => [...prev, errorMessage]);
      console.error('Error generating music:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Enter key press for submission
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Prevent newline character insertion when pressing Enter
      e.preventDefault();
      handleGenerate();
    }
  };

  // Need to fix this function
  const handleAuth = () => {
    if (user) {
      setUser(null);
    } else {
      setUser({ name: 'Hong TTN', email: 'hong@example.com' });
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      
      {/* Sidebar - Chat History */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center gap-2">
          <Music className="text-white w-6 h-6" />
          <h2 className="font-semibold text-lg">MusiChat</h2>
        </div>
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {chatHistory.length === 0 ? (
            <p className="text-gray-500 text-sm"> No message yet. </p>
          ) : (
            chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg ${
                  msg.sender === 'user'
                    ? 'bg-darkblue-600/30 text-blue-200'
                    : 'bg-gray-800 text-gray-200'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleAuth}
            className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 py-2 rounded-lg transition"
          >
            {user ? (
              <>
                <LogOut className="w-4 h-4" /> Log out
              </>
            ) : (
              <>
                <User className="w-4 h-4" /> Log in
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Chat Interface */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-14 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900">
          <h1 className="text-lg font-semibold">Music Generation with LSTM</h1>
          {user && <p className="text-sm text-gray-400">Signed in as {user.name}</p>}
        </header>

        {/* Chat Section */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatHistory.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <p className="text-xl">Ask anything ...👋</p>
              <p className="text-sm">Describe the type of music you want to generate.</p>
            </div>
          ) : (
            chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xl p-3 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-gray-600 text-white rounded-br-none'
                      : 'bg-gray-800 text-gray-200 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Section */}
        <div className="border-t border-gray-800 p-4 bg-gray-900">
          <div className="flex items-center gap-2">
            <textarea
              className="flex-1 resize-none bg-gray-800 text-gray-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 h-14"
              placeholder="Describe your desired melody..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isGenerating}
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="p-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isGenerating ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
