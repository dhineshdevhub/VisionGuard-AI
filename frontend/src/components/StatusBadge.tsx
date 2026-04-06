import React from 'react';

interface StatusBadgeProps {
  status: 'High' | 'Critical' | 'Medium' | 'Low' | string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalizedStatus = status?.toLowerCase() || 'unknown';
  
  const config = {
    critical: 'bg-emergency/10 text-emergency border-emergency/20 pulse-emergency',
    high: 'bg-emergency/10 text-emergency border-emergency/20',
    medium: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    unknown: 'bg-slate-800 text-slate-400 border-slate-700'
  };

  const style = config[normalizedStatus as keyof typeof config] || config.unknown;

  return (
    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-tighter ${style}`}>
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
