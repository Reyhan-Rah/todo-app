'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TodoList from '@/components/TodoList';
import ToastContainer from '@/components/ToastContainer';
import { useToast } from '@/hooks/useToast';
import { setToastContext } from '@/hooks/useTodos';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function HomeContent() {
  const { toasts, removeToast, showSuccess, showError, showInfo } = useToast();

  // Provide toast context to the hooks
  setToastContext({ showSuccess, showError, showInfo });

  return (
    <div className="min-h-screen bg-gray-50">
      <TodoList />
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <HomeContent />
    </QueryClientProvider>
  );
}
