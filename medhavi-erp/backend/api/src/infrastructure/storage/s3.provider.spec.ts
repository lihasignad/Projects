import { S3Provider } from './s3.provider';

describe('S3Provider', () => {
  let provider: S3Provider;

  beforeEach(() => {
    provider = new S3Provider();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should upload a buffer and return metadata and URL', async () => {
    const testKey = 'test-file.txt';
    const buffer = Buffer.from('hello medhavi erp storage');
    const result = await provider.upload(testKey, buffer, 'text/plain');

    expect(result.key).toBe(testKey);
    expect(result.size).toBe(buffer.length);
    expect(result.mimeType).toBe('text/plain');
    expect(result.url).toContain(testKey);

    const exists = await provider.exists(testKey);
    expect(exists).toBe(true);

    const deleted = await provider.delete(testKey);
    expect(deleted).toBe(true);
  });
});
