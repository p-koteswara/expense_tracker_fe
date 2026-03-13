'use client';

import { useState, useEffect } from 'react';
import axiosInstance from '@/api/axios';
import ExpenseRow from '@/components/ExpenseRow';
import AddExpenseModal from '@/components/AddExpenseModal';
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Download
} from 'lucide-react';

interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
  category_name: string;
  category_emoji: string;
  category_id: number;
  note?: string;
}

interface Category {
  id: number;
  name: string;
  emoji: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesRes, categoriesRes] = await Promise.all([
        axiosInstance.get('/expenses'),
        axiosInstance.get('/categories'),
      ]);
      setExpenses(expensesRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Failed to fetch expenses', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axiosInstance.delete(`/expenses/${id}`);
        // Optimistic UI update
        setExpenses(expenses.filter(e => e.id !== id));
      } catch (error) {
        console.error('Failed to delete expense', error);
      }
    }
  };

  const handleEdit = (id: number) => {
    const expense = expenses.find(e => e.id === id);
    setEditingExpense(expense || null);
    setIsModalOpen(true);
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || expense.category_id.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground mt-1">Detailed history of your transactions.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="p-3 border border-border rounded-xl hover:bg-white transition-colors text-muted-foreground">
            <Download size={20} />
          </button>
          <button
            onClick={() => {
              setEditingExpense(null);
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center justify-center space-x-2 py-3 px-6 shadow-lg shadow-accent-green/20"
          >
            <Plus size={20} />
            <span className="font-bold">Add Expense</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-48">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground pointer-events-none">
              <Filter size={18} />
            </span>
            <select
              className="w-full pl-10 pr-8 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-green/20 transition-all appearance-none text-sm font-medium"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-background/50 border-b border-border">
              <tr>
                <th className="py-4 px-4 text-sm font-bold text-muted-foreground uppercase tracking-wider">Description</th>
                <th className="py-4 px-4 text-sm font-bold text-muted-foreground uppercase tracking-wider">Category</th>
                <th className="py-4 px-4 text-sm font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="py-4 px-4 text-sm font-bold text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="py-4 px-4 text-sm font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="py-8 px-4"><div className="h-8 bg-background rounded-lg w-full"></div></td>
                  </tr>
                ))
              ) : filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <ExpenseRow
                    key={expense.id}
                    id={expense.id}
                    description={expense.description}
                    category={expense.category_name}
                    categoryEmoji={expense.category_emoji}
                    amount={expense.amount}
                    date={expense.date}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center text-muted-foreground mb-4">
                        <Search size={32} />
                      </div>
                      <p className="text-xl font-serif font-bold text-foreground mb-1">No transactions found</p>
                      <p className="text-muted-foreground">Try adjusting your filters or add a new expense.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && filteredExpenses.length > 0 && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredExpenses.length}</span> transactions
            </p>
            <div className="flex items-center space-x-2">
              <button className="p-2 border border-border rounded-lg hover:bg-background disabled:opacity-50 transition-colors" disabled>
                <ChevronLeft size={18} />
              </button>
              <button className="p-2 border border-border rounded-lg hover:bg-background disabled:opacity-50 transition-colors" disabled>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={fetchData}
        initialData={editingExpense}
      />
    </div>
  );
}
