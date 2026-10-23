import { ConfigService } from '@nestjs/config';
import { MailerService } from './mailer.service';

describe('MailerService', () => {
  let service: MailerService;
  let configMock: Partial<ConfigService>;

  beforeEach(() => {
    configMock = {
      get: jest.fn((key: string, defaultVal?: any) => defaultVal),
    };
    service = new MailerService(configMock as ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should dispatch an email successfully', async () => {
    const sent = await service.sendMail({
      to: 'student@medhavi.local',
      subject: 'Exam Schedule Published',
      text: 'Your exam schedule has been published.',
    });
    expect(sent).toBe(true);
  });

  it('should dispatch password reset email', async () => {
    const sent = await service.sendPasswordResetEmail('admin@medhavi.local', 'sample-token-123');
    expect(sent).toBe(true);
  });
});
