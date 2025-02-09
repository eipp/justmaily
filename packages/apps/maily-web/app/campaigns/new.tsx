import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// Define campaign type
interface Campaign {
  title: string;
  subject: string;
  content: string;
}

const NewCampaignPage: React.FC = () => {
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign>({ title: '', subject: '', content: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCampaign(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateContent = async () => {
    if (!campaign.title) {
      setError('Please enter a campaign title to generate content.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: campaign.title })
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      setCampaign(prev => ({ ...prev, content: data.generatedContent || 'No content returned' }));
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating content.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaign)
      });
      if (!response.ok) {
        throw new Error('Failed to create campaign.');
      }
      router.push('/campaigns');
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the campaign.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Campaign</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block font-medium">Campaign Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={campaign.title}
            onChange={handleInputChange}
            className="w-full border border-gray-300 px-3 py-2 rounded mt-1"
            required
          />
        </div>
        <div>
          <label htmlFor="subject" className="block font-medium">Subject</label>
          <input
            id="subject"
            name="subject"
            type="text"
            value={campaign.subject}
            onChange={handleInputChange}
            className="w-full border border-gray-300 px-3 py-2 rounded mt-1"
            required
          />
        </div>
        <div>
          <label htmlFor="content" className="block font-medium">Content</label>
          <textarea
            id="content"
            name="content"
            value={campaign.content}
            onChange={handleInputChange}
            rows={6}
            className="w-full border border-gray-300 px-3 py-2 rounded mt-1"
            required
          />
        </div>
        <div className="flex space-x-4">
          <button 
            type="button"
            onClick={handleGenerateContent}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {loading ? 'Generating...' : 'Generate AI Content'}
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            {loading ? 'Saving...' : 'Save Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewCampaignPage; 