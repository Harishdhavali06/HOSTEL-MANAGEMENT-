import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const RevenueChart = ({ data = [] }) => {
  const chartData = data.length > 0 
    ? data 
    : [
        { month: 'Jan', revenue: 4000 },
        { month: 'Feb', revenue: 4500 },
        { month: 'Mar', revenue: 6000 },
        { month: 'Apr', revenue: 5800 },
        { month: 'May', revenue: 7500 },
        { month: 'Jun', revenue: 9000 },
      ];

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.9)', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              borderRadius: '8px',
              color: '#f8fafc',
              fontFamily: 'Plus Jakarta Sans',
              fontSize: '12px'
            }}
          />
          <Bar 
            dataKey="revenue" 
            fill="url(#revenueGrad)" 
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          >
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.6} />
              </linearGradient>
            </defs>
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const OccupancyPieChart = ({ data = [] }) => {
  const chartData = data.length > 0
    ? data
    : [
        { name: 'Single', value: 10 },
        { name: 'Double', value: 24 },
        { name: 'Triple', value: 15 },
        { name: 'Dormitory', value: 8 },
      ];

  const COLORS = ['#06b6d4', '#6366f1', '#a855f7', '#f59e0b'];

  return (
    <div className="h-80 w-full flex flex-col justify-center items-center">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#f8fafc',
                fontFamily: 'Plus Jakarta Sans',
                fontSize: '12px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Legend list */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs -mt-4">
        {chartData.map((item, index) => (
          <div key={item.name} className="flex items-center space-x-1.5">
            <span 
              className="h-2.5 w-2.5 rounded-full" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }} 
            />
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {item.name}: {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
