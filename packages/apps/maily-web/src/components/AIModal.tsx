import React from 'react';
import { useAIResponse } from '../lib/hooks/useAIResponse'; // Corrected import path

interface AIModalProps {
  mode: 'draft' | 'summarize';
  onClose: () => void;
}

const AIModal: React.FC<AIModalProps> = ({ mode, onClose }) => {
  const { response, isGenerating } = useAIResponse(mode);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg w-1/2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">
            {mode === 'draft' ? 'Email Drafting Assistance' : 'Thread Summarization'}
          </h3>
          <button onClick={onClose} className="text-gray-500">X</button>
        </div>
        <div className="border p-2 h-48 overflow-y-auto whitespace-pre-wrap">
          {isGenerating ? response + '\n[Generating response...]' : response}
        </div>
      </div>
    </div>
  );
};

export default AIModal;