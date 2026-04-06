import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, colorClass, trend }) => {
  return (
    <div className="premium-card p-5 group flex flex-col justify-between h-full hover:shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-lg bg-slate-50 border border-slate-100 transition-colors group-hover:border-accent/20`}>
          <div className={colorClass.split(' ')[1] || 'text-accent'}>
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 20 }) : icon}
          </div>
        </div>
        <div className="flex flex-col items-end">
           <div className="flex items-center space-x-1.5">
             <div className={`w-1.5 h-1.5 rounded-full ${colorClass.split(' ')[0]} animate-pulse-fast`} />
             <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Live</span>
           </div>
        </div>
      </div>
      
      <div>
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</h4>
        <div className="flex items-baseline space-x-2">
           <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
          {trend && <span className="text-[10px] font-medium text-emerald-400">↑ {trend}</span>}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
