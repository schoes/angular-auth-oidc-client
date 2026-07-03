import { inject, Injectable } from '@angular/core';
import { defer, firstValueFrom, Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AuthStateService } from '../auth-state/auth-state.service';
import { OpenIdConfiguration } from '../config/openid-configuration';
import { CallbackContext } from '../flows/callback-context';
import { FlowsService } from '../flows/flows.service';
import { ResetAuthDataService } from '../flows/reset-auth-data.service';
import { LoggerService } from '../logging/logger.service';
import { IntervalService } from './interval.service';

@Injectable({ providedIn: 'root' })
export class RefreshSessionRefreshTokenService {
  private readonly loggerService = inject(LoggerService);
  private readonly resetAuthDataService = inject(ResetAuthDataService);
  private readonly flowsService = inject(FlowsService);
  private readonly intervalService = inject(IntervalService);
  private readonly authStateService = inject(AuthStateService);

  refreshSessionWithRefreshTokens(
    config: OpenIdConfiguration,
    allConfigs: OpenIdConfiguration[],
    customParamsRefresh?: { [key: string]: string | number | boolean }
  ): Observable<CallbackContext> {
    this.loggerService.logDebug(config, 'BEGIN refresh session Authorize');
    let refreshTokenFailed = false;
    const useLock =
      !!config.useRefreshTokenLock &&
      typeof navigator !== 'undefined' &&
      !!navigator.locks;
    const refresh$ = useLock
      ? this.refreshWithLock(config, allConfigs, customParamsRefresh)
      : this.flowsService.processRefreshToken(
          config,
          allConfigs,
          customParamsRefresh
        );

    return refresh$.pipe(
      catchError((error) => {
        this.resetAuthDataService.resetAuthorizationData(config, allConfigs);
        refreshTokenFailed = true;

        return throwError(() => new Error(error));
      }),
      finalize(
        () =>
          refreshTokenFailed && this.intervalService.stopPeriodicTokenCheck()
      )
    );
  }

  private refreshWithLock(
    config: OpenIdConfiguration,
    allConfigs: OpenIdConfiguration[],
    customParamsRefresh?: { [key: string]: string | number | boolean }
  ): Observable<CallbackContext> {
    const lockName = `angular-auth-oidc-client-refresh-token-${config.configId}`;

    return defer(async (): Promise<CallbackContext> => {
      const accessTokenBeforeLock =
        this.authStateService.getAccessToken(config);

      return navigator.locks.request(
        lockName,
        async (): Promise<CallbackContext> => {
          const currentAccessToken =
            this.authStateService.getAccessToken(config);
          const wasRefreshedInAnotherTab =
            !!currentAccessToken &&
            currentAccessToken !== accessTokenBeforeLock &&
            this.authStateService.areAuthStorageTokensValid(config);

          if (wasRefreshedInAnotherTab) {
            this.loggerService.logDebug(
              config,
              'access token was already refreshed in another tab, reusing the stored tokens'
            );

            return {
              code: '',
              refreshToken: this.authStateService.getRefreshToken(config),
              state: '',
              sessionState: null,
              authResult: this.authStateService.getAuthenticationResult(config),
              isRenewProcess: true,
              jwtKeys: null,
              validationResult: null,
              existingIdToken: this.authStateService.getIdToken(config),
            };
          }

          return firstValueFrom(
            this.flowsService.processRefreshToken(
              config,
              allConfigs,
              customParamsRefresh
            )
          );
        }
      );
    });
  }
}
