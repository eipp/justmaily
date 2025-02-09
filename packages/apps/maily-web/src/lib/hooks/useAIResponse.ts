import { useState, useEffect } from 'react';

const streamAIResponse = async function* (mode: 'draft' | 'summarize') {
    const messages = mode === 'draft'
      ? ['Initializing email draft... ', 'Generating content ... ', 'Finalizing draft... ']
      : ['Collecting thread info... ', 'Analyzing conversation... ', 'Summary ready: The thread outlines key points. '];
    for (const msg of messages) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      yield msg;
    }
  };

export const useAIResponse = (mode: 'draft' | 'summarize') => {
  const [response, setResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    const generateResponse = async () => {
      setIsGenerating(true);
      const stream = streamAIResponse(mode);
      let accumulated = '';
      for await (const chunk of stream) {
        if (isCancelled) break;
        accumulated += chunk;
        setResponse(accumulated);
      }
      setIsGenerating(false);
    };
    generateResponse();
    return () => { isCancelled = true; };
  }, [mode]);

  return { response, isGenerating };
};