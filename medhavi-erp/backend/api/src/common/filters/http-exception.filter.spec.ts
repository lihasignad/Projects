import { HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  it('should format HttpException into standard error response body', () => {
    const statusMock = jest.fn().mockReturnThis();
    const jsonMock = jest.fn();

    const hostMock: any = {
      switchToHttp: () => ({
        getResponse: () => ({
          status: statusMock,
          json: jsonMock,
        }),
        getRequest: () => ({
          url: '/api/v1/test',
          method: 'GET',
        }),
      }),
    };

    const exception = new HttpException('Resource not found', HttpStatus.NOT_FOUND);
    filter.catch(exception, hostMock);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        path: '/api/v1/test',
        method: 'GET',
        message: 'Resource not found',
      }),
    );
  });
});
