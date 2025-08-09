import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../backend/src/routers/index.js';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/trpc',
      headers() {
        const token = localStorage.getItem('auth-token');
        return {
          authorization: token ? `Bearer ${token}` : '',
        };
      },
    }),
  ],
});