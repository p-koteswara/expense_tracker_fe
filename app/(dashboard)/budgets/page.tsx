'use client';

import { useState, useEffect } from 'react';
import axiosInstance from '@/api/axios';
import BudgetCard from '@/components/BudgetCard';
import { Plus, Edit2, X, Check, Trash2 } from 'lucide-react';

interface Budget {
  id: number;
  category_id: number;
  month: number;
  year: number;
  limit_amount: number;
  amount_spent: number;
  category_name: string;
  category_emoji: string;
}

interface Category {
  id: number;
  name: string;
  emoji: string;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [editingLimit, setEditingLimit] = useState('');

  const getCurrentMonthYear = () => {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [budgetsRes, categoriesRes] = await Promise.all([
        axiosInstance.get('/budgets'),
        axiosInstance.get('/categories'),
      ]);
      setBudgets(budgetsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Failed to fetch budgets', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { month, year } = getCurrentMonthYear();
      await axiosInstance.post('/budgets', {
        category_id: parseInt(selectedCategory),
        month,
        year,
        limit_amount: parseFloat(limit),
      });
      setIsAdding(false);
      setSelectedCategory('');
      setLimit('');
      fetchData();
    } catch (error) {
      console.error('Failed to add budget', error);
    }
  };

  const handleUpdateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBudget) return;
    try {
      await axiosInstance.put(`/budgets/${editingBudget.id}`, {
        limit_amount: parseFloat(editingLimit),
      });
      setEditingBudget(null);
      setEditingLimit('');
      fetchData();
    } catch (error) {
      console.error('Failed to update budget', error);
    }
  };

  const handleDeleteBudget = async (id: number) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    try {
      await axiosInstance.delete(`/budgets/${id}`);
      fetchData();
    } catch (error) {
      console.error('Failed to delete budget', error);
    }
  };

  const handleEditClick = (budget: Budget) => {
    setEditingBudget(budget);
    setEditingLimit(budget.limit_amount.toString());
    setIsAdding(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-foreground">Budgets</h1>
          <p className="text-muted-foreground mt-1">Set monthly limits for your spending categories.</p>
        </div>
        <button
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingBudget(null);
          }}
          className="btn-primary flex items-center justify-center space-x-2 py-3 px-6 shadow-lg shadow-accent-green/20"
        >
          {isAdding ? <X size={20} /> : <Plus size={20} />}
          <span className="font-bold">{isAdding ? 'Cancel' : 'Set Budget'}</span>
        </button>
      </div>

      {isAdding && (
        <div className="card p-6 border-2 border-accent-green/20 bg-accent-green/5 animate-in slide-in-from-top duration-300">
          <form onSubmit={handleAddBudget} className="flex flex-col md:flex-row items-end gap-6">
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold mb-2 text-foreground uppercase tracking-wider">Category</label>
              <select
                required
                className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green transition-all appearance-none"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="" disabled>Select Category</option>
                {categories
                  .filter(cat => !budgets.some(b => b.category_id === cat.id))
                  .map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
                  ))
                }
              </select>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold mb-2 text-foreground uppercase tracking-wider">Monthly Limit ($)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green transition-all"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary py-3 px-8 flex items-center space-x-2 shadow-md">
              <Check size={20} />
              <span className="font-bold">Save Budget</span>
            </button>
          </form>
        </div>
      )}

      {editingBudget && (
        <div className="card p-6 border-2 border-accent-green/20 bg-accent-green/5 animate-in slide-in-from-top duration-300">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold font-serif flex items-center">
              Edit Budget: <span className="ml-2 text-accent-green">{editingBudget.category_emoji} {editingBudget.category_name}</span>
            </h3>
            <button onClick={() => setEditingBudget(null)} className="text-muted-foreground hover:text-foreground">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleUpdateBudget} className="flex flex-col md:flex-row items-end gap-6">
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold mb-2 text-foreground uppercase tracking-wider">Monthly Limit ($)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green transition-all"
                value={editingLimit}
                onChange={(e) => setEditingLimit(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary py-3 px-8 flex items-center space-x-2 shadow-md">
              <Check size={20} />
              <span className="font-bold">Update Budget</span>
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-48 bg-border rounded-2xl animate-pulse"></div>)
        ) : budgets.length > 0 ? (
          budgets.map((budget) => (
            <div key={budget.id} className="relative group">
              <BudgetCard
                category={budget.category_name}
                emoji={budget.category_emoji}
                limit={budget.limit_amount}
                spent={budget.amount_spent || 0}
              />
              <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEditClick(budget)}
                  className="p-2 bg-white/80 backdrop-blur-sm border border-border rounded-lg hover:text-accent-green shadow-sm"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDeleteBudget(budget.id)}
                  className="p-2 bg-white/80 backdrop-blur-sm border border-border rounded-lg hover:text-accent-red shadow-sm"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full card p-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center text-accent-green mb-6 border border-border shadow-inner">
              <Plus size={40} />
            </div>
            <h3 className="text-2xl font-serif font-bold text-foreground mb-2">No budgets set</h3>
            <p className="text-muted-foreground mb-8 max-w-sm">
              Setting budgets helps you control your spending. Start by adding a limit for a category.
            </p>
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="btn-primary py-3 px-8 font-bold flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Create Your First Budget</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
