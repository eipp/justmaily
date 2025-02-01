import { SESProvider } from './ses';
import { mockClient } from 'aws-sdk-client-mock';

describe('SESProvider', () => {
  const mockConfig = {
    accessKeyId: 'test-key',
    secretAccessKey: 'test-secret',
    region: 'us-east-1'
  };

  it('should initialize correctly', () => {
    const provider = new SESProvider(mockConfig);
    expect(provider).toBeInstanceOf(SESProvider);
  });
}); 