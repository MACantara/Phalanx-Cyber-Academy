import type { AxiosRequestConfig } from 'axios';
import { api } from './api';

// orval mutator: routes generated calls through the shared axios instance
// so the Clerk token interceptor in api.ts applies automatically.
export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  return api(config).then((res) => res.data);
};
