interface BudgetCardProps {
  category: string;
  emoji: string;
  limit: number;
  spent: number;
}

export default function BudgetCard({ category, emoji, limit, spent }: BudgetCardProps) {
  const percentage = (spent / limit) * 100;
  
  let progressColor = 'bg-accent-green';
  if (percentage >= 100) {
    progressColor = 'bg-accent-red';
  } else if (percentage >= 75) {
    progressColor = 'bg-accent-yellow';
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl p-2 bg-background rounded-lg">{emoji}</span>
          <h4 className="font-semibold text-lg">{category}</h4>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${percentage >= 100 ? 'bg-accent-red/10 text-accent-red' : 'bg-accent-green/10 text-accent-green'}`}>
          {percentage.toFixed(0)}%
        </span>
      </div>
      
      <div className="flex items-end justify-between mb-2">
        <span className="text-xl font-bold font-serif">${spent.toFixed(2)}</span>
        <span className="text-muted-foreground text-sm">of ${limit.toFixed(2)}</span>
      </div>

      <div className="w-full bg-background rounded-full h-2 overflow-hidden border border-border">
        <div 
          className={`h-full transition-all duration-500 ${progressColor}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      {percentage >= 100 && (
        <p className="text-accent-red text-xs mt-3 font-medium flex items-center">
          Over budget by ${(spent - limit).toFixed(2)}
        </p>
      )}
    </div>
  );
}
