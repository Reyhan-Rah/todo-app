'use client'

import { Provider } from 'react-redux'
import { store } from '@/store/store'
import TodoList from '@/components/TodoList'
import ToastContainer from '@/components/ToastContainer'
import { useToast } from '@/hooks/useToast'

function HomeContent() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="min-h-screen bg-gray-50">
      <TodoList />
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  )
}

export default function Home() {
  return (
    <Provider store={store}>
      <HomeContent />
    </Provider>
  )
}
