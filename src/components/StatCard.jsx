export default function StatCard({ title, value, icon: Icon, trend, color = 'emerald' }) {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
  };

  return (
    <div className="card-admin flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${colorMap[color] || colorMap.emerald}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <div className="text-2xl sm:text-3xl font-bold font-sans text-slate-900 tracking-tight">{value}</div>
        {trend && (
          <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">{trend}</span>
            <span>vs previous period</span>
          </p>
        )}
      </div>
    </div>
  );
}
