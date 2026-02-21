import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { ResponseTimeInterceptor } from '../src/common/response-time.interceptor';

describe('ResponseTimeInterceptor', () => {
  it('logs UNKNOWN when request is missing', (done) => {
    const interceptor = new ResponseTimeInterceptor();
    const logSpy = jest.spyOn((interceptor as any).logger, 'log').mockImplementation();

    const context = {
      switchToHttp: () => ({
        getRequest: () => undefined,
      }),
    } as ExecutionContext;

    const next: CallHandler = {
      handle: () => of(null),
    };

    interceptor.intercept(context, next).subscribe({
      complete: () => {
        expect(logSpy).toHaveBeenCalled();
        const msg = String(logSpy.mock.calls[0][0]);
        expect(msg).toContain('UNKNOWN');
        done();
      },
    });
  });
});
