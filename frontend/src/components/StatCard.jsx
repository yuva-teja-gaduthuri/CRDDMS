// components/StatCard.jsx — Dashboard stat widget
export default function StatCard({ title, value, icon: Icon, color = 'primary', trend }) {
  const colorMap = {
    primary: 'gradient-primary',
    success: 'gradient-success',
    warning: 'gradient-warning',
    danger:  'gradient-danger',
    accent:  'gradient-accent',
  };

  return (
    <div className="stat-card animate-fade-in">
      {/* Background decorative circle */}
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-slate-50/80" />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-semibold text-slate/50 uppercase tracking-wide mb-1">{title}</p>
          <p className="text-3xl font-bold text-primary">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 font-medium ${trend > 0 ? 'text-success' : 'text-danger'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </div>
  );
}
