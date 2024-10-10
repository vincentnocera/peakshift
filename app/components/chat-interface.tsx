import React, { useState } from 'react';

const ChatInterface = ({ onSendMessage, errorMessage }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setMessages([...messages, { text: inputMessage, sender: 'user' }]);
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col flex-grow">
      {errorMessage && <div className="text-red-500 mb-4 text-center">{errorMessage}</div>}
      <div className="bg-white rounded-lg shadow-md p-6 mb-4 flex-grow overflow-y-auto">
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
              {message.text}
            </span>
          </div>
        ))}
      </div>
      <div className="flex mb-4">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-grow border border-gray-300 rounded-l-md rounded-r-md mr-2 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message here..."
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white py-2 px-6 rounded-r-md rounded-l-md hover:bg-blue-600 transition duration-300"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
