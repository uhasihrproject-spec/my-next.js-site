"use client";

import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { motion } from "framer-motion";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    alert(`Message sent to owner: ${message}`);
    setMessage("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <MessageCircle size={28} />
        </motion.button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-80 rounded-2xl border border-white/10 bg-gray-900/95 p-4 shadow-2xl backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h4 className="text-lg font-semibold text-white">Live Chat</h4>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Messages Placeholder */}
          <div className="mt-3 h-40 overflow-y-auto rounded-lg bg-gray-800/50 p-3 text-sm text-gray-300">
            <p className="italic text-gray-500">You’re chatting with the site owner...</p>
          </div>

          {/* Input */}
          <div className="mt-3 flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-lg bg-gray-800/70 px-3 py-2 text-white placeholder-gray-400 focus:outline-none"
            />
            <button
              onClick={handleSend}
              className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-2 text-white hover:opacity-90"
            >
              <Send size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
