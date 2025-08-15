import useSWR from 'swr'
import { supabase } from '@/lib/supabase'

interface Payable {
  id: number
  user_id: string
  vendor: string
  amount: number
  due_date: string
  status: 'pending' | 'approved' | 'paid'
  category: string | null
  invoice_number: string
  notes: string | null
  contact: string | null
  created_at: string
  updated_at: string
}

const fetcher = async (userId: string): Promise<Payable[]> => {
  const { data, error } = await supabase
    .from('payables')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true })

  if (error) throw error
  return data || []
}

export function usePayables(userId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `payables-${userId}` : null,
    () => fetcher(userId),
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  )

  return {
    payables: data || [],
    loading: isLoading,
    error,
    mutate
  }
}