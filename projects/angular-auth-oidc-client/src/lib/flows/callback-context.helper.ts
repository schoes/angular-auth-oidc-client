import { AuthResult, CallbackContext } from './callback-context';

export function createRenewCallbackContext(
  refreshToken: string,
  existingIdToken: string | null,
  overrides: { state?: string; authResult?: AuthResult | null } = {}
): CallbackContext {
  return {
    code: '',
    refreshToken,
    state: overrides.state ?? '',
    sessionState: null,
    authResult: overrides.authResult ?? null,
    isRenewProcess: true,
    jwtKeys: null,
    validationResult: null,
    existingIdToken,
  };
}
