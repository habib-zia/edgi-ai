"use client";
import React from "react";
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot } from 'recharts';

interface MiniPerformanceChartProps {
  data: Array<{
    day: string;
    value: number;
  }>;
  selectedDay: string;
  onDaySelect: (day: string) => void;
}

const MiniPerformanceChart: React.FC<MiniPerformanceChartProps> = ({ data, selectedDay, onDaySelect }) => {
  const handleChartClick = (chartData: any) => {
    if (chartData && chartData.activeLabel) {
      onDaySelect(chartData.activeLabel);
    }
  };

  return (
    <div className="w-full h-[150px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
          onClick={handleChartClick}
        >
          <defs>
            <linearGradient id="miniGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(79, 70, 229, 0.0)" />
              <stop offset="100%" stopColor="rgba(79, 70, 229, 0.15)" />
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="0" vertical={true} stroke="#E5E7EB" strokeWidth={1} />
          
          <XAxis 
            dataKey="day" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#849AA9', fontSize: 10 }}
            dy={5}
          />
          
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#849AA9', fontSize: 10 }}
            domain={[0, 250000]}
            ticks={[50000, 100000, 150000, 200000, 250000]}
            tickFormatter={(value) => `${value / 1000}K`}
            dx={-5}
          />
          
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              fontSize: '12px',
              color: '#282828'
            }}
            formatter={(value: number) => [`${(value / 1000).toFixed(0)}K`, 'Performance']}
          />
          
          <ReferenceLine 
            x={selectedDay} 
            stroke="#5046E5" 
            strokeDasharray="2 2"
            strokeWidth={1}
          />
          
          <Area
            type="monotone"
            dataKey="value"
            stroke="none"
            fill="url(#miniGradient)"
          />
          
          <Line
            type="monotone"
            dataKey="value"
            stroke="#5046E5"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#5046E5', stroke: 'white', strokeWidth: 1 }}
          />
          
          <ReferenceDot
            x={selectedDay}
            y={data.find(d => d.day === selectedDay)?.value || 0}
            r={4}
            fill="#5046E5"
            stroke="white"
            strokeWidth={1}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MiniPerformanceChart;
