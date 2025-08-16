import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink, TRPCClientError, type TRPCLink } from '@trpc/client';
import { observable } from '@trpc/server/observable';
import type { AppRouter } from '../../../backend/src/routers/index.js';
import { useAuthStore } from '@/store/authStore.js';

export const trpc = createTRPCReact<AppRouter>();

function errorLink(): TRPCLink<AppRouter> {
  return () => {
    return ({ next, op }) => {
      return observable((observer) => {
        const unsubscribe = next(op).subscribe({
          next: (result) => {
            observer.next(result);
          },
          error: (err: any) => {
            console.error('TRPC Error:', err);
            if (err instanceof TRPCClientError && err.data?.code === 'UNAUTHORIZED') {
              console.warn('User is unauthorized, logging out...');
              const { logout } = useAuthStore.getState();
              logout();
              window.location.href = '/login';
            }
            observer.error(err);
          },
          complete: () => {
            observer.complete();
          },
        });

        return unsubscribe;
      });
    };
  };
}

export const trpcClient = trpc.createClient({
  links: [
    errorLink(), // Add this first so it catches errors
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
  // transformer: superjson,
});