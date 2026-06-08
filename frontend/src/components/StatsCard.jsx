import React from 'react';

const StatsCard = ({ title, value, icon: Icon, description, trend, color = 'blue' }) => {
  const colorSchemes = {
    blue: {
      glow: 'shadow-blue-500/10 dark:shadow-blue-500/5',
      iconBg: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      line: 'border-t-2 border-blue-500',
    },
    green: {
      glow: 'shadow-emerald-500/10 dark:shadow-emerald-500/5',
      iconBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      line: 'border-t-2 border-emerald-500',
    },
    purple: {
      glow: 'shadow-purple-500/10 dark:shadow-purple-500/5',
      iconBg: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      line: 'border-t-2 border-purple-500',
    },
    red: {
      glow: 'shadow-rose-500/10 dark:shadow-rose-500/5',
      iconBg: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      line: 'border-t-2 border-rose-500',
    },
    cyan: {
      glow: 'shadow-cyan-500/10 dark:shadow-cyan-500/5',
      iconBg: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
      line: 'border-t-2 border-cyan-500',
    },
    amber: {
      glow: 'shadow-amber-500/10 dark:shadow-amber-500/5',
      iconBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      line: 'border-t-2 border-amber-500',
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.blue;

  return (
    <div className={`glass-card p-6 rounded-2xl shadow-xl flex flex-col justify-between transition-all duration-300 hover:translate-y-[-4px] hover:shadow-2xl ${scheme.glow} ${scheme.line}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
            {title}
          </p>
          <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 tracking-tight">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl border flex items-center justify-center ${scheme.iconBg}`}>
          <Icon size={22} />
        </div>
      </div>
      {(description || trend) && (
        <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-xs">
          {trend && (
            <span className={`font-bold px-1.5 py-0.5 rounded ${
              trend.startsWith('+') 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }`}>
              {trend}
            </span>
          )}
          {description && (
            <span className="text-slate-400 dark:text-slate-500">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatsCard;
