interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
}

export default function StatCard({ title, value, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="card p-6 flex items-start justify-between">
      <div>
        <p className="text-muted-foreground text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
        {trend && (
          <p className={`text-xs mt-2 font-medium ${trend.startsWith('+') ? 'text-accent-red' : 'text-accent-green'}`}>
            {trend} from last month
          </p>
        )}
      </div>
      <div className="p-3 bg-background rounded-xl border border-border text-accent-green">
        <Icon size={24} />
      </div>
    </div>
  );
}
