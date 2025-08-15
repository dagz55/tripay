import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Trash2, Download, Printer, Check, X, Calendar, DollarSign, Building2, FileText, ChevronLeft, ChevronRight, List, Clock, MapPin, Tag, Receipt, Edit2 } from 'lucide-react';

interface Payable {
  id: number;
  vendor: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'approved' | 'paid';
  category: string;
  invoiceNumber: string;
  notes: string;
  contact: string;
}

// Shadcn/ui inspired components
const Button = ({ children, variant = 'default', size = 'default', className = '', ...props }: {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  [key: string]: any;
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  const variants = {
    default: 'bg-gray-900 text-white hover:bg-gray-800',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    ghost: 'hover:bg-gray-100 text-gray-700',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
  };
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3 text-sm',
    lg: 'h-11 px-8',
    icon: 'h-10 w-10',
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ className = '', ...props }: { className?: string; [key: string]: any }) => {
  return (
    <input
      className={`flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};

const Select = ({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => {
  return (
    <select
      className={`flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto animate-in zoom-in-95 slide-in-from-bottom-4">
        {children}
      </div>
    </div>
  );
};

// Calendar Component
const CalendarView = ({ payables, onItemClick }: { payables: Payable[]; onItemClick: (payable: Payable) => void }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  const getPayablesForDate = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    
    return payables.filter((p: Payable) => p.dueDate === dateStr);
  };
  
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const today = new Date();
    const isCurrentMonth = today.getMonth() === currentDate.getMonth() && 
                          today.getFullYear() === currentDate.getFullYear();
    const todayDate = today.getDate();
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 border border-gray-100"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayPayables = getPayablesForDate(day);
      const isToday = isCurrentMonth && day === todayDate;
      const hasPayables = dayPayables.length > 0;
      
      days.push(
        <div 
          key={day} 
          className={`h-32 border border-gray-100 p-2 hover:bg-gray-50 transition-colors overflow-hidden ${
            isToday ? 'bg-blue-50 ring-2 ring-blue-500' : ''
          }`}
        >
          <div className="flex justify-between items-start mb-1">
            <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
              {day}
            </span>
            {hasPayables && (
              <span className="text-xs bg-gray-900 text-white px-1.5 py-0.5 rounded-full">
                {dayPayables.length}
              </span>
            )}
          </div>
          <div className="space-y-1">
            {dayPayables.slice(0, 3).map((payable: Payable) => (
              <div
                key={payable.id}
                onClick={() => onItemClick(payable)}
                className="cursor-pointer group"
              >
                <div className={`text-xs p-1 rounded transition-all hover:shadow-sm ${
                  payable.status === 'paid' ? 'bg-green-100 hover:bg-green-200' :
                  payable.status === 'approved' ? 'bg-blue-100 hover:bg-blue-200' :
                  'bg-yellow-100 hover:bg-yellow-200'
                }`}>
                  <div className="font-medium truncate">{payable.vendor}</div>
                  <div className="text-gray-600">${payable.amount.toLocaleString()}</div>
                </div>
              </div>
            ))}
            {dayPayables.length > 3 && (
              <div className="text-xs text-gray-500 pl-1">
                +{dayPayables.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Calendar Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="ghost" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0">
        {renderCalendarDays()}
      </div>
    </div>
  );
};

export default function PayablesDemo() {
  const [payables, setPayables] = useState<Payable[]>([
    { id: 1, vendor: 'Apple Inc.', amount: 15000.00, dueDate: '2025-02-01', status: 'pending', category: 'Technology', invoiceNumber: 'INV-001', notes: 'Quarterly software licensing', contact: 'billing@apple.com' },
    { id: 2, vendor: 'Google Cloud', amount: 8500.50, dueDate: '2025-01-28', status: 'approved', category: 'Cloud Services', invoiceNumber: 'INV-002', notes: 'Monthly cloud infrastructure', contact: 'cloud-billing@google.com' },
    { id: 3, vendor: 'Slack Technologies', amount: 450.00, dueDate: '2025-02-15', status: 'paid', category: 'Software', invoiceNumber: 'INV-003', notes: 'Team collaboration tools', contact: 'ar@slack.com' },
    { id: 4, vendor: 'WeWork', amount: 12000.00, dueDate: '2025-01-31', status: 'pending', category: 'Office Space', invoiceNumber: 'INV-004', notes: 'Monthly office rental - NYC', contact: 'payments@wework.com' },
    { id: 5, vendor: 'Adobe Creative Cloud', amount: 2500.00, dueDate: '2025-02-05', status: 'pending', category: 'Software', invoiceNumber: 'INV-005', notes: 'Design team licenses', contact: 'billing@adobe.com' },
    { id: 6, vendor: 'Amazon Web Services', amount: 5200.00, dueDate: '2025-02-10', status: 'approved', category: 'Cloud Services', invoiceNumber: 'INV-006', notes: 'S3 storage and EC2 instances', contact: 'aws-ar@amazon.com' },
    { id: 7, vendor: 'Microsoft 365', amount: 1800.00, dueDate: '2025-02-20', status: 'pending', category: 'Software', invoiceNumber: 'INV-007', notes: 'Enterprise licenses', contact: 'billing@microsoft.com' },
    { id: 8, vendor: 'Zoom', amount: 300.00, dueDate: '2025-02-08', status: 'paid', category: 'Software', invoiceNumber: 'INV-008', notes: 'Video conferencing', contact: 'billing@zoom.us' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showNotification, setShowNotification] = useState<string | false>(false);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [selectedPayable, setSelectedPayable] = useState<Payable | null>(null);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        setPayables(prev => {
          const updated = [...prev];
          const randomIndex = Math.floor(Math.random() * updated.length);
          if (updated[randomIndex] && updated[randomIndex].status === 'pending') {
            updated[randomIndex] = { ...updated[randomIndex], status: 'approved' };
            showTemporaryNotification('Payment status updated');
          }
          return updated;
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const showTemporaryNotification = (message: string) => {
    setShowNotification(message);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleEdit = (id: number, field: string, value: string | number) => {
    setEditingCell(`${id}-${field}`);
    setEditValue(String(value));
  };

  const handleSave = (id: number, field: string) => {
    setPayables(prev => prev.map(p => 
      p.id === id ? { ...p, [field]: field === 'amount' ? parseFloat(editValue) || 0 : editValue } : p
    ));
    setEditingCell(null);
    showTemporaryNotification('Changes saved');
  };

  const handleCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleDelete = (id: number) => {
    setPayables(prev => prev.filter(p => p.id !== id));
    setShowModal(false);
    showTemporaryNotification('Payable deleted');
  };

  const handleAdd = () => {
    const newPayable: Payable = {
      id: Date.now(),
      vendor: 'New Vendor',
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      status: 'pending' as const,
      category: 'General',
      invoiceNumber: `INV-${String(payables.length + 1).padStart(3, '0')}`,
      notes: '',
      contact: ''
    };
    setPayables(prev => [...prev, newPayable]);
    showTemporaryNotification('New payable added');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      showTemporaryNotification(`Processing ${file.name}...`);
      setTimeout(() => {
        const extractedData: Payable = {
          id: Date.now(),
          vendor: 'Extracted Vendor Co.',
          amount: Math.floor(Math.random() * 10000),
          dueDate: '2025-02-28',
          status: 'pending' as const,
          category: 'Extracted',
          invoiceNumber: `PDF-${String(payables.length + 1).padStart(3, '0')}`,
          notes: 'Extracted from PDF',
          contact: 'contact@vendor.com'
        };
        setPayables(prev => [...prev, extractedData]);
        showTemporaryNotification('Receipt data extracted successfully');
      }, 2000);
    }
  };

  const handlePrint = () => {
    window.print();
    showTemporaryNotification('Preparing for print...');
  };

  const generatePDF = () => {
    const content = filteredPayables.map(p => 
      `${p.invoiceNumber} | ${p.vendor} | ${p.amount.toFixed(2)} | Due: ${p.dueDate} | Status: ${p.status}`
    ).join('\n');
    
    const blob = new Blob([`PAYABLES REPORT\n${'='.repeat(50)}\n\n${content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payables-report.txt';
    a.click();
    showTemporaryNotification('Report downloaded');
  };

  const openPayableModal = (payable: Payable) => {
    setSelectedPayable(payable);
    setShowModal(true);
  };

  const updatePayableInModal = (field: string, value: string) => {
    if (selectedPayable) {
      setSelectedPayable(prev => prev ? { ...prev, [field]: value } : null);
      setPayables(prev => prev.map(p => 
        p.id === selectedPayable.id ? { ...p, [field]: value } : p
      ));
      showTemporaryNotification('Updated successfully');
    }
  };

  const filteredPayables = payables.filter(p => {
    const matchesSearch = p.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalAmount = filteredPayables.reduce((sum, p) => sum + p.amount, 0);
  const pendingCount = filteredPayables.filter(p => p.status === 'pending').length;

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800'
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <Check className="h-4 w-4" />
            {showNotification}
          </div>
        </div>
      )}

      {/* Payable Details Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        {selectedPayable && (
          <div className="p-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {selectedPayable.vendor}
                </h2>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedPayable.status]}`}>
                    {selectedPayable.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    {selectedPayable.invoiceNumber}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="space-y-6">
              {/* Amount and Due Date */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm font-medium">Amount Due</span>
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">
                    ${selectedPayable.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Due Date</span>
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {new Date(selectedPayable.dueDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-600 mb-1">Category</div>
                    <div className="text-gray-900">{selectedPayable.category}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Receipt className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-600 mb-1">Invoice Number</div>
                    <div className="text-gray-900">{selectedPayable.invoiceNumber}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-600 mb-1">Contact</div>
                    <div className="text-gray-900">{selectedPayable.contact || 'No contact info'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-600 mb-1">Notes</div>
                    <div className="text-gray-900">{selectedPayable.notes || 'No notes added'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-600 mb-1">Days Until Due</div>
                    <div className="text-gray-900">
                      {Math.ceil((new Date(selectedPayable.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button 
                  className="flex-1"
                  onClick={() => {
                    updatePayableInModal('status', 'approved');
                  }}
                  disabled={selectedPayable.status !== 'pending'}
                >
                  Approve Payment
                </Button>
                <Button 
                  variant="secondary" 
                  className="flex-1"
                  onClick={() => {
                    updatePayableInModal('status', 'paid');
                  }}
                  disabled={selectedPayable.status === 'paid'}
                >
                  Mark as Paid
                </Button>
                <Button 
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(selectedPayable.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Payables</h1>
          <p className="text-gray-500">Manage your accounts payable with real-time updates</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Total Outstanding</span>
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Pending Approval</span>
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-2xl font-semibold text-gray-900">{pendingCount}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Total Payables</span>
              <Building2 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-2xl font-semibold text-gray-900">{filteredPayables.length}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search vendors, invoices, categories..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
              </Select>
              <div className="flex gap-2">
                {/* View Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className={viewMode === 'table' ? '' : 'bg-transparent'}
                  >
                    <List className="h-4 w-4 mr-2" />
                    Table
                  </Button>
                  <Button
                    variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('calendar')}
                    className={viewMode === 'calendar' ? '' : 'bg-transparent'}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Calendar
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                  <Download className="h-4 w-4 mr-2" />
                  Extract PDF
                </Button>
                <Button onClick={handleAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payable
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area - Table or Calendar */}
        {viewMode === 'table' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Invoice</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Vendor</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Category</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Amount</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Due Date</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-center px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayables.map((payable) => (
                    <tr key={payable.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <button
                          onClick={() => openPayableModal(payable)}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {payable.invoiceNumber}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        {editingCell === `${payable.id}-vendor` ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editValue}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value)}
                              className="h-8"
                              autoFocus
                            />
                            <Button size="icon" variant="ghost" onClick={() => handleSave(payable.id, 'vendor')}>
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={handleCancel}>
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <div 
                            className="text-sm text-gray-900 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                            onClick={() => handleEdit(payable.id, 'vendor', payable.vendor)}
                          >
                            {payable.vendor}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{payable.category}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {editingCell === `${payable.id}-amount` ? (
                          <div className="flex items-center justify-end gap-2">
                            <Input
                              type="number"
                              value={editValue}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value)}
                              className="h-8 w-24 text-right"
                              autoFocus
                            />
                            <Button size="icon" variant="ghost" onClick={() => handleSave(payable.id, 'amount')}>
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={handleCancel}>
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <div 
                            className="text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded inline-block"
                            onClick={() => handleEdit(payable.id, 'amount', payable.amount)}
                          >
                            ${payable.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingCell === `${payable.id}-dueDate` ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="date"
                              value={editValue}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value)}
                              className="h-8"
                              autoFocus
                            />
                            <Button size="icon" variant="ghost" onClick={() => handleSave(payable.id, 'dueDate')}>
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={handleCancel}>
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <div 
                            className="text-sm text-gray-600 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded inline-flex items-center gap-1"
                            onClick={() => handleEdit(payable.id, 'dueDate', payable.dueDate)}
                          >
                            <Calendar className="h-3 w-3" />
                            {new Date(payable.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[payable.status]}`}>
                          {payable.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openPayableModal(payable)}
                            className="text-gray-400 hover:text-blue-600"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(payable.id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Showing {filteredPayables.length} payables
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button variant="secondary" onClick={generatePDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <CalendarView payables={filteredPayables} onItemClick={openPayableModal} />
        )}

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-400 mt-8">
          Real-time sync enabled • Last updated: just now
        </div>
      </div>
    </div>
  );
}