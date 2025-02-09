import { NextPage } from 'next';
import React from 'react';
import { Tabs } from '@/components/ui/tabs';

const NewCampaignPage: NextPage = () => {
  return (
    <div>
      <h1>New Campaign</h1>
      <Tabs tabs={['Overview', 'Settings']}>
        {/* Insert tabs content here if needed */}
      </Tabs>
    </div>
  );
};

export default NewCampaignPage; 