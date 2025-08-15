'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { useTripay } from '@/hooks/useTripay'
import { Plus, Calendar, DollarSign, Building2, Trash2 } from 'lucide-react'

// Tripay interface removed as it's not being used
interface TripayPayable {
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

export default function TripayDemo({ userId }: { userId: string }) {
  const { tripay, loading, mutate } = useTripay(userId)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingField, setEditingField] = useState<string>('')
  const [editingValue, setEditingValue] = useState<string>('')
  const [notification, setNotification] = useState<string>('')
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    // Set up real-time subscription
    const subscription = supabase
      .channel('Tripay')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'Tripay',
        filter: `user_id=eq.${userId}`
      }, () => mutate())
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [userId, mutate])

  const handleSave = async (id: number, field: string, value: any) => {
    const { error } = await supabase
      .from('Tripay')
      .update({ [field]: value })
      .eq('id', id)

    if (!error) {
      showTemporaryNotification('Changes saved')
      mutate()
    }
    setEditingId(null)
    setEditingField('')
    setEditingValue('')
  }

  const handleAdd = async () => {
    const { error } = await supabase
      .from('Tripay')
      .insert({
        user_id: userId,
        vendor: 'New Vendor',
        amount: 0,
        due_date: new Date().toISOString().split('T')[0],
        status: 'pending',
        category: 'General',
        invoice_number: `INV-${Date.now()}`
      })

    if (!error) {
      showTemporaryNotification('New payable added')
      mutate()
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this payable?')) {
      const { error } = await supabase
        .from('Tripay')
        .delete()
        .eq('id', id)

      if (!error) {
        showTemporaryNotification('Payable deleted')
        mutate()
      }
    }
  }

  const showTemporaryNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(''), 3000)
  }

  const filteredTripay = tripay.filter(payable => {
    const matchesSearch = payable.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payable.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || payable.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const totalAmount = filteredTripay.reduce((sum, p) => sum + p.amount, 0)
  const pendingAmount = filteredTripay.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
      )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tripay Dashboard</h1>
            <p className="text-gray-600">Manage your accounts payable</p>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Payables</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(pendingAmount)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vendors</p>
                <p className="text-2xl font-bold text-gray-900">{new Set(filteredTripay.map(p => p.vendor)).size}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4">
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  view === 'list' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  view === 'calendar' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Calendar View
              </button>
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Payable
            </button>
          </div>
          
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search vendors or invoice numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {view === 'list' ? (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTripay.map((payable) => (
                    <tr key={payable.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === payable.id && editingField === 'vendor' ? (
                          <input
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => handleSave(payable.id, 'vendor', editingValue)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSave(payable.id, 'vendor', editingValue)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                            autoFocus
                          />
                        ) : (
                          <div 
                            className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                            onClick={() => {
                              setEditingId(payable.id)
                              setEditingField('vendor')
                              setEditingValue(payable.vendor)
                            }}
                          >
                            {payable.vendor}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === payable.id && editingField === 'amount' ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => handleSave(payable.id, 'amount', parseFloat(editingValue))}
                            onKeyPress={(e) => e.key === 'Enter' && handleSave(payable.id, 'amount', parseFloat(editingValue))}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                            autoFocus
                          />
                        ) : (
                          <div 
                            className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded font-medium"
                            onClick={() => {
                              setEditingId(payable.id)
                              setEditingField('amount')
                              setEditingValue(payable.amount.toString())
                            }}
                          >
                            {formatCurrency(payable.amount)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === payable.id && editingField === 'due_date' ? (
                          <input
                            type="date"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => handleSave(payable.id, 'due_date', editingValue)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSave(payable.id, 'due_date', editingValue)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                            autoFocus
                          />
                        ) : (
                          <div 
                            className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                            onClick={() => {
                              setEditingId(payable.id)
                              setEditingField('due_date')
                              setEditingValue(payable.due_date)
                            }}
                          >
                            {formatDate(payable.due_date)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={payable.status}
                          onChange={(e) => handleSave(payable.id, 'status', e.target.value)}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payable.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="paid">Paid</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payable.invoice_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDelete(payable.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Calendar View</h3>
            <p className="text-gray-600">Calendar view coming soon...</p>
          </div>
        )}
      </div>

      {/* Notification */}
      {notification && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg">
          {notification}
        </div>
      )}
    </div>
  )
}
