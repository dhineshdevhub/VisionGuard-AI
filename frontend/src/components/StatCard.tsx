import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, colorClass }) => {
  return (
    <div className="glass-card p-6 flex items-center space-x-5 transition hover:scale-[1.02]">
      <div className={`p-3 rounded-xl bg-opacity-20 ${colorClass}`}>
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-medium text-slate-400">{label}</h4>
        <p className="text-2xl font-bold text-slate-100">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
