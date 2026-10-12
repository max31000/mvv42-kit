/**
 * `@mvv42/kit/platform` — auth client and shell bridge. Depends on React only for `useMe`; no Mantine.
 */
export {
  AUTH_API,
  AUTH_CHANGED_EVENT,
  apiJson,
  getMe,
  logout,
  mvv42Fetch,
  refreshSession,
  requestLogin,
  safeReturnPath,
} from './platform/client';
export { isInsideShell, onShellMessage, parseShellMessage, postToShell, shellWindow } from './platform/shell';
export { reloadMe, useMe } from './platform/useMe';
export type { MeStatus, UseMeResult } from './platform/useMe';
export { ApiError, isApiError } from './platform/types';
export type { AppAccess, AppAccessMode, Me, Mvv42User, ShellMessage } from './platform/types';
