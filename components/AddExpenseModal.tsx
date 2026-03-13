'use client';

import { useState, useEffect } from 'react';
import axiosInstance from '@/api/axios';
import { X, Calendar, DollarSign, Tag, FileText } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  emoji: string;
}

interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
  category_id: number;
  note?: string;
}

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: Expense | null;
}

export default function AddExpenseModal({ isOpen, onClose, onSave, initialData }: AddExpenseModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (initialData) {
        setDescription(initialData.description);
        setAmount(initialData.amount.toString());
        setDate(new Date(initialData.date).toISOString().split('T')[0]);
        setCategoryId(initialData.category_id.toString());
        setNote(initialData.note || '');
      } else {
        resetForm();
      }
    }
  }, [isOpen, initialData]);

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategoryId('');
    setNote('');
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      description,
      amount: parseFloat(amount),
      date,
      category_id: parseInt(categoryId),
      note,
    };

    try {
      if (initialData) {
        await axiosInstance.put(`/expenses/${initialData.id}`, payload);
      } else {
        await axiosInstance.post('/expenses', payload);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save expense', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm transition-opacity">
      <div className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-serif font-bold">
            {initialData ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-background rounded-full transition-colors text-muted-foreground">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="description">Description</label>
            <input
              id="description"
              type="text"
              required
              className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green transition-all"
              placeholder="e.g. Weekly Groceries"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="amount">Amount ($)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground pointer-events-none">
                  <DollarSign size={18} />
                </span>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green transition-all"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                </div>
                </div>
                <div>
                <label className="block text-sm font-medium mb-2" htmlFor="date">Date</label>
                <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground pointer-events-none">
                  <Calendar size={18} />
                </span>
                <input
                  id="date"
                  type="date"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green transition-all"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                </div>
                </div>
                </div>

                <div>
                <label className="block text-sm font-medium mb-2" htmlFor="category">Category</label>
                <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground pointer-events-none">
                <Tag size={18} />
                </span>
                <select
                id="category"
                required
                className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green transition-all appearance-none"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                >
                <option value="" disabled>Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.name}
                  </option>
                ))}
                </select>
                </div>
                </div>

                <div>
                <label className="block text-sm font-medium mb-2" htmlFor="note">Note (Optional)</label>
                <div className="relative">
                <span className="absolute top-3 left-3 text-muted-foreground pointer-events-none">
                <FileText size={18} />
                </span>
                <textarea
                id="note"
                rows={3}
                className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green transition-all"
                placeholder="Add some details..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                />            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-border rounded-xl font-semibold text-muted-foreground hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary py-3 font-semibold disabled:opacity-50"
            >
              {loading ? 'Saving...' : initialData ? 'Update Expense' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
