import { useUIStore } from '@/src/store/uiStore';

const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';

export function getErrorMessage(error: any): string {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    DEFAULT_ERROR_MESSAGE
  );
}

export function handleMutationError(error: any, title = 'Error'): void {
  const message = getErrorMessage(error);
  useUIStore.getState().addToast({
    title,
    description: message,
    variant: 'destructive',
  });
}
