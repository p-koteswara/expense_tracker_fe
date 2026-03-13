'use client';

import { useState, useEffect } from 'react';
import axiosInstance from '@/api/axios';
import { Plus, Trash2, X, Check, Smile } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  emoji: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('💰');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/categories', { name, emoji });
      setIsAdding(false);
      setName('');
      setEmoji('💰');
      fetchCategories();
    } catch (error) {
      console.error('Failed to add category', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure? Categories can only be deleted if no expenses are linked to them.')) {
      try {
        await axiosInstance.delete(`/categories/${id}`);
        setCategories(categories.filter(c => c.id !== id));
      } catch (error: any) {
        alert(error.response?.data?.detail || 'Failed to delete category. It might be in use.');
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground mt-1">Organize your expenses with custom categories.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="btn-primary flex items-center justify-center space-x-2 py-3 px-6 shadow-lg shadow-accent-green/20"
        >
          {isAdding ? <X size={20} /> : <Plus size={20} />}
          <span className="font-bold">{isAdding ? 'Cancel' : 'Add Category'}</span>
        </button>
      </div>

      {isAdding && (
        <div className="card p-6 border-2 border-accent-green/20 bg-accent-green/5 animate-in slide-in-from-top duration-300">
          <form onSubmit={handleAddCategory} className="flex flex-col md:flex-row items-end gap-6">
            <div className="w-full md:w-24">
              <label className="block text-sm font-bold mb-2 text-foreground uppercase tracking-wider text-center">Icon</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green transition-all text-center text-2xl"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={2}
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold mb-2 text-foreground uppercase tracking-wider">Category Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Travel"
                className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary py-3 px-8 flex items-center space-x-2 shadow-md">
              <Check size={20} />
              <span className="font-bold">Save Category</span>
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          [1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-border rounded-2xl animate-pulse"></div>)
        ) : categories.length > 0 ? (
          categories.map((category) => (
            <div key={category.id} className="card p-4 flex items-center justify-between group hover:border-accent-green/30 transition-all hover:shadow-md">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center text-2xl border border-border group-hover:bg-accent-green/5 transition-colors">
                  {category.emoji}
                </div>
                <h4 className="font-bold text-lg">{category.name}</h4>
              </div>
              <button
                onClick={() => handleDelete(category.id)}
                className="p-2 text-muted-foreground hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full card p-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center text-accent-green mb-6 border border-border">
              <Smile size={40} />
            </div>
            <h3 className="text-2xl font-serif font-bold text-foreground mb-2">No categories yet</h3>
            <p className="text-muted-foreground mb-8 max-w-sm">
              Create categories to start organizing your expenses and setting budgets.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
