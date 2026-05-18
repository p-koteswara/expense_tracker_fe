'use client';

import { useState, useEffect } from 'react';
import axiosInstance from '@/api/axios';
import StatCard from '@/components/StatCard';
import BudgetCard from '@/components/BudgetCard';
import ExpenseRow from '@/components/ExpenseRow';
import AddExpenseModal from '@/components/AddExpenseModal';
import { 
  Plus, 
  TrendingDown, 
  Wallet, 
  History,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
  category_name: string;
  category_emoji: string;
}

interface Budget {
  id: number;
  category_id: number;
  category_name: string;
  category_emoji: string;
  limit_amount: number;
  amount_spent: number;
}

interface ExpenseSummary {
  total_spent: number;
  transaction_count: number;
}

export default function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [stats, setStats] = useState({
    totalSpent: 0,
    remainingBudget: 0,
    transactionCount: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesRes, budgetsRes, summaryRes] = await Promise.all([
        axiosInstance.get('/expenses?size=5'),
        axiosInstance.get<Budget[]>('/budgets'),
        axiosInstance.get<ExpenseSummary>('/expenses/summary'),
      ]);

      setExpenses(expensesRes.data.items);
      setBudgets(budgetsRes.data);

      // Calculate stats
      const totalBudget = budgetsRes.data.reduce((acc, curr) => acc + (curr.limit_amount || 0), 0);
      const spentAcrossAll = summaryRes.data.total_spent || 0;
      
      setStats({
        totalSpent: spentAcrossAll,
        remainingBudget: Math.max(0, totalBudget - spentAcrossAll),
        transactionCount: summaryRes.data.transaction_count || 0,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-10 w-48 bg-border rounded-lg"></div>
          <div className="h-12 w-36 bg-border rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-border rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-64 bg-border rounded-2xl"></div>
          <div className="h-64 bg-border rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your spending and stay on budget.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center justify-center space-x-2 py-3 px-6 shadow-lg shadow-accent-green/20"
        >
          <Plus size={20} />
          <span className="font-bold">Add Expense</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Spent"
          value={`$${stats.totalSpent.toFixed(2)}`}
          icon={TrendingDown}
          trend="+12%"
        />
        <StatCard
          title="Remaining Budget"
          value={`$${stats.remainingBudget.toFixed(2)}`}
          icon={Wallet}
        />
        <StatCard
          title="Recent Transactions"
          value={expenses.length}
          icon={History}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold">Budget Progress</h2>
            <Link href="/budgets" className="text-accent-green text-sm font-bold flex items-center hover:underline">
              View All <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {budgets.length > 0 ? (
              budgets.slice(0, 4).map((budget) => (
                <BudgetCard
                  key={budget.id}
                  category={budget.category_name}
                  emoji={budget.category_emoji}
                  limit={budget.limit_amount}
                  spent={budget.amount_spent || 0}
                />
              ))
            ) : (
              <div className="col-span-2 card p-10 text-center flex flex-col items-center">
                <p className="text-muted-foreground mb-4">No budgets set yet.</p>
                <Link href="/budgets" className="btn-primary inline-flex items-center">
                  <Plus size={18} className="mr-2" /> Set Your First Budget
                </Link>
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold">Recent Expenses</h2>
            <Link href="/expenses" className="text-accent-green text-sm font-bold flex items-center hover:underline">
              View All <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <tbody>
                  {expenses.length > 0 ? (
                    expenses.map((expense) => (
                      <ExpenseRow
                        key={expense.id}
                        id={expense.id}
                        description={expense.description}
                        category={expense.category_name}
                        categoryEmoji={expense.category_emoji}
                        amount={expense.amount}
                        date={expense.date}
                      />
                    ))
                  ) : (
                    <tr>
                      <td className="p-10 text-center text-muted-foreground">
                        No expenses yet. Start tracking today!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchData}
      />
    </div>
  );
}
