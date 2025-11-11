import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList } from 'recharts';

interface FollowersChartProps {
  topPostData?: any;
}

const FollowersChart: React.FC<FollowersChartProps> = ({ topPostData }) => {

  const getPerformanceData = () => {
    if (!topPostData || !topPostData.insights || !Array.isArray(topPostData.insights)) {
      return [
        { metric: 'Reach', value: 0 },
        { metric: 'Likes', value: 0 },
        { metric: 'Interactions', value: 0 },
        { metric: 'Shares', value: 0 }
      ];
    }

    const getInsightValue = (type: string) => {
      const insight = topPostData.insights.find((i: any) => i.type === type);
      return insight?.value || 0;
    };

    return [
      { metric: 'Reach', value: getInsightValue('reach') },
      { metric: 'Likes', value: getInsightValue('likes') },
      { metric: 'Interactions', value: getInsightValue('total_interactions') },
      { metric: 'Shares', value: getInsightValue('shares') }
    ];
  };

  const performanceData = getPerformanceData();
  
  const maxValue = Math.max(...performanceData.map(d => d.value), 10);

  return (
    <div className="w-full flex-col border border-[#F1F1F4] items-center bg-white justify-center py-4 pl-4 pr-4 rounded-[10px]" style={{ boxShadow: "0px 5px 20px 0px #0000000D" }}>
        <div className="w-full flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#282828]">
            Performance
          </h2>
        </div>
        
        <div className="w-full h-[278px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={performanceData}
              layout="vertical"
              margin={{ top: 20, right: 80, left: 0, bottom: 20 }}
            >
              {/* Grid Lines - Both vertical and horizontal to create box pattern */}
              <CartesianGrid 
                strokeDasharray="0" 
                vertical={true}
                horizontal={true}
                stroke="#E5E7EB" 
                strokeWidth={1}
              />
              
              {/* Y-Axis (Metric names) */}
              <YAxis 
                type="category"
                dataKey="metric"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#282828', fontSize: 14, fontWeight: 500 }}
                width={100}
              />
              
              {/* X-Axis (Values) */}
              <XAxis 
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'transparent', fontSize: 0 }}
                domain={[0, maxValue]}
                ticks={Array.from({ length: 6 }, (_, i) => Math.floor((maxValue / 5) * i))}
              />
              
              {/* Bar */}
              <Bar 
                dataKey="value" 
                radius={[0, 4, 4, 0]}
                isAnimationActive={true}
                animationDuration={1500}
              >
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#918BF0" />
                ))}
                <LabelList 
                  dataKey="value" 
                  position="right"
                  formatter={(value: any) => `(${Number(value).toLocaleString()})`}
                  style={{ fill: '#282828', fontSize: 14, fontWeight: 500 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
    </div>
  );
};

export default FollowersChart;