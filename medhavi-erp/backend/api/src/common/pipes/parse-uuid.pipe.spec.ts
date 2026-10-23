import { BadRequestException } from '@nestjs/common';
import { ParseUUIDPipe } from './parse-uuid.pipe';

describe('ParseUUIDPipe', () => {
  let pipe: ParseUUIDPipe;

  beforeEach(() => {
    pipe = new ParseUUIDPipe();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should pass for a valid v4 UUID', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';
    expect(pipe.transform(validUuid, { type: 'param', data: 'id' })).toBe(validUuid);
  });

  it('should throw BadRequestException for invalid UUID format', () => {
    expect(() => pipe.transform('invalid-uuid-string', { type: 'param', data: 'id' })).toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException for empty string', () => {
    expect(() => pipe.transform('', { type: 'param', data: 'id' })).toThrow(BadRequestException);
  });
});
