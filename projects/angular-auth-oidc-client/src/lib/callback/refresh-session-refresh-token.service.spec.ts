import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { mockProvider } from '../../test/auto-mock';
import { AuthStateService } from '../auth-state/auth-state.service';
import { CallbackContext } from '../flows/callback-context';
import { FlowsService } from '../flows/flows.service';
import { ResetAuthDataService } from '../flows/reset-auth-data.service';
import { LoggerService } from '../logging/logger.service';
import { IntervalService } from './interval.service';
import { RefreshSessionRefreshTokenService } from './refresh-session-refresh-token.service';

describe('RefreshSessionRefreshTokenService', () => {
  let refreshSessionRefreshTokenService: RefreshSessionRefreshTokenService;
  let intervalService: IntervalService;
  let resetAuthDataService: ResetAuthDataService;
  let flowsService: FlowsService;
  let authStateService: AuthStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        RefreshSessionRefreshTokenService,
        mockProvider(LoggerService),
        mockProvider(FlowsService),
        mockProvider(ResetAuthDataService),
        mockProvider(IntervalService),
        mockProvider(AuthStateService),
      ],
    });
  });

  beforeEach(() => {
    flowsService = TestBed.inject(FlowsService);
    refreshSessionRefreshTokenService = TestBed.inject(
      RefreshSessionRefreshTokenService
    );
    intervalService = TestBed.inject(IntervalService);
    resetAuthDataService = TestBed.inject(ResetAuthDataService);
    authStateService = TestBed.inject(AuthStateService);
  });

  afterEach(() => {
    // cleanup the navigator.locks shadow defined by the lock tests
    delete (navigator as any).locks;
  });

  it('should create', () => {
    expect(refreshSessionRefreshTokenService).toBeTruthy();
  });

  describe('refreshSessionWithRefreshTokens', () => {
    it('calls flowsService.processRefreshToken()', waitForAsync(() => {
      const spy = spyOn(flowsService, 'processRefreshToken').and.returnValue(
        of({} as CallbackContext)
      );

      refreshSessionRefreshTokenService
        .refreshSessionWithRefreshTokens({ configId: 'configId1' }, [
          { configId: 'configId1' },
        ])
        .subscribe(() => {
          expect(spy).toHaveBeenCalled();
        });
    }));

    it('resetAuthorizationData in case of error', waitForAsync(() => {
      spyOn(flowsService, 'processRefreshToken').and.returnValue(
        throwError(() => new Error('error'))
      );
      const resetSilentRenewRunningSpy = spyOn(
        resetAuthDataService,
        'resetAuthorizationData'
      );

      refreshSessionRefreshTokenService
        .refreshSessionWithRefreshTokens({ configId: 'configId1' }, [
          { configId: 'configId1' },
        ])
        .subscribe({
          error: (err) => {
            expect(resetSilentRenewRunningSpy).toHaveBeenCalled();
            expect(err).toBeTruthy();
          },
        });
    }));

    it('finalize with stopPeriodicTokenCheck in case of error', fakeAsync(() => {
      spyOn(flowsService, 'processRefreshToken').and.returnValue(
        throwError(() => new Error('error'))
      );
      const stopPeriodicallyTokenCheckSpy = spyOn(
        intervalService,
        'stopPeriodicTokenCheck'
      );

      refreshSessionRefreshTokenService
        .refreshSessionWithRefreshTokens({ configId: 'configId1' }, [
          { configId: 'configId1' },
        ])
        .subscribe({
          error: (err) => {
            expect(err).toBeTruthy();
          },
        });
      tick();
      expect(stopPeriodicallyTokenCheckSpy).toHaveBeenCalled();
    }));

    describe('cross-tab refresh token lock', () => {
      it('reuses the stored tokens and skips processRefreshToken when another tab already refreshed', async () => {
        Object.defineProperty(navigator, 'locks', {
          value: {
            request: (_name: string, cb: () => Promise<unknown>) => cb(),
          },
          configurable: true,
        });
        spyOn(authStateService, 'getAccessToken').and.returnValues(
          'old-access-token',
          'new-access-token'
        );
        spyOn(authStateService, 'areAuthStorageTokensValid').and.returnValue(
          true
        );
        spyOn(authStateService, 'getRefreshToken').and.returnValue(
          'new-refresh-token'
        );
        spyOn(authStateService, 'getIdToken').and.returnValue('new-id-token');
        spyOn(authStateService, 'getAuthenticationResult').and.returnValue({
          access_token: 'new-access-token',
        });
        const processSpy = spyOn(flowsService, 'processRefreshToken');
        const callbackContext = await firstValueFrom(
          refreshSessionRefreshTokenService.refreshSessionWithRefreshTokens(
            { configId: 'configId1', useRefreshTokenLock: true },
            [{ configId: 'configId1' }]
          )
        );

        expect(processSpy).not.toHaveBeenCalled();
        expect(callbackContext.refreshToken).toBe('new-refresh-token');
        expect(callbackContext.existingIdToken).toBe('new-id-token');
        expect(callbackContext.authResult).toEqual({
          access_token: 'new-access-token',
        });
      });

      it('still refreshes inside the lock when no other tab refreshed while waiting', async () => {
        Object.defineProperty(navigator, 'locks', {
          value: {
            request: (_name: string, cb: () => Promise<unknown>) => cb(),
          },
          configurable: true,
        });
        spyOn(authStateService, 'getAccessToken').and.returnValue(
          'same-access-token'
        );
        const processSpy = spyOn(
          flowsService,
          'processRefreshToken'
        ).and.returnValue(of({} as CallbackContext));

        await firstValueFrom(
          refreshSessionRefreshTokenService.refreshSessionWithRefreshTokens(
            { configId: 'configId1', useRefreshTokenLock: true },
            [{ configId: 'configId1' }]
          )
        );

        expect(processSpy).toHaveBeenCalled();
      });

      it('still refreshes inside the lock when another tab refreshed but the stored tokens are no longer valid', async () => {
        Object.defineProperty(navigator, 'locks', {
          value: {
            request: (_name: string, cb: () => Promise<unknown>) => cb(),
          },
          configurable: true,
        });
        spyOn(authStateService, 'getAccessToken').and.returnValues(
          'old-access-token',
          'new-access-token'
        );
        spyOn(authStateService, 'areAuthStorageTokensValid').and.returnValue(
          false
        );
        const processSpy = spyOn(
          flowsService,
          'processRefreshToken'
        ).and.returnValue(of({} as CallbackContext));

        await firstValueFrom(
          refreshSessionRefreshTokenService.refreshSessionWithRefreshTokens(
            { configId: 'configId1', useRefreshTokenLock: true },
            [{ configId: 'configId1' }]
          )
        );

        expect(processSpy).toHaveBeenCalled();
      });

      it('requests the lock with a per-config name when useRefreshTokenLock is enabled', async () => {
        const requestSpy = jasmine
          .createSpy('request')
          .and.callFake((_name: string, cb: () => Promise<unknown>) => cb());

        Object.defineProperty(navigator, 'locks', {
          value: { request: requestSpy },
          configurable: true,
        });
        const processSpy = spyOn(
          flowsService,
          'processRefreshToken'
        ).and.returnValue(of({} as CallbackContext));

        await firstValueFrom(
          refreshSessionRefreshTokenService.refreshSessionWithRefreshTokens(
            { configId: 'configId1', useRefreshTokenLock: true },
            [{ configId: 'configId1' }]
          )
        );

        expect(requestSpy).toHaveBeenCalledOnceWith(
          'angular-auth-oidc-client-refresh-token-configId1',
          jasmine.any(Function)
        );
        expect(processSpy).toHaveBeenCalled();
      });

      it('still refreshes when useRefreshTokenLock is enabled but the Web Locks API is unavailable', async () => {
        Object.defineProperty(navigator, 'locks', {
          value: undefined,
          configurable: true,
        });
        const processSpy = spyOn(
          flowsService,
          'processRefreshToken'
        ).and.returnValue(of({} as CallbackContext));

        await firstValueFrom(
          refreshSessionRefreshTokenService.refreshSessionWithRefreshTokens(
            { configId: 'configId1', useRefreshTokenLock: true },
            [{ configId: 'configId1' }]
          )
        );

        expect(processSpy).toHaveBeenCalled();
      });

      it('resetAuthorizationData in case of error inside the lock', async () => {
        Object.defineProperty(navigator, 'locks', {
          value: {
            request: (_name: string, cb: () => Promise<unknown>) => cb(),
          },
          configurable: true,
        });
        spyOn(flowsService, 'processRefreshToken').and.returnValue(
          throwError(() => new Error('error'))
        );
        const resetAuthorizationDataSpy = spyOn(
          resetAuthDataService,
          'resetAuthorizationData'
        );

        await expectAsync(
          firstValueFrom(
            refreshSessionRefreshTokenService.refreshSessionWithRefreshTokens(
              { configId: 'configId1', useRefreshTokenLock: true },
              [{ configId: 'configId1' }]
            )
          )
        ).toBeRejected();

        expect(resetAuthorizationDataSpy).toHaveBeenCalled();
      });
    });
  });
});
