import { Trash2, Edit2 } from 'lucide-react';

interface ExpenseRowProps {
  id: number;
  description: string;
  category: string;
  categoryEmoji: string;
  amount: number;
  date: string;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function ExpenseRow({
  id,
  description,
  category,
  categoryEmoji,
  amount,
  date,
  onEdit,
  onDelete,
}: ExpenseRowProps) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <tr className="border-b border-border hover:bg-background/50 transition-colors group">
      <td className="py-4 px-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-xl border border-border">
            {categoryEmoji}
          </div>
          <span className="font-semibold text-foreground truncate max-w-[150px]">{description}</span>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className="text-sm font-medium text-muted-foreground bg-background px-2 py-1 rounded-lg border border-border">
          {category}
        </span>
      </td>
      <td className="py-4 px-4 text-sm text-muted-foreground">
        {formattedDate}
      </td>
      <td className="py-4 px-4 font-bold text-foreground">
        ${amount.toFixed(2)}
      </td>
      <td className="py-4 px-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-end space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(id)}
              className="p-2 text-muted-foreground hover:text-accent-green hover:bg-accent-green/10 rounded-lg transition-all"
            >
              <Edit2 size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(id)}
              className="p-2 text-muted-foreground hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-all"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
