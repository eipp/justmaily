import { QueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/atoms/use-toast'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.message ?? 'An error occurred while fetching data.',
          variant: 'destructive',
        })
      },
    },
    mutations: {
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.message ?? 'An error occurred while saving data.',
          variant: 'destructive',
        })
      },
    },
  },
}) 