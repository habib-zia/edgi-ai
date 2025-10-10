import React, { useState } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot } from 'recharts';

// Mock data for follower growth
const followersData = [
  { month: 'January', followers: 50000 },
  { month: 'February', followers: 75000 },
  { month: 'March', followers: 65000 },
  { month: 'April', followers: 110000 },
  { month: 'May', followers: 150000 },
  { month: 'June', followers: 130000 },
  { month: 'July', followers: 220000 }
];

// Empty data for empty state - just to show the grid structure
const emptyData = [
  { month: 'January', followers: 0 },
  { month: 'February', followers: 0 },
  { month: 'March', followers: 0 },
  { month: 'April', followers: 0 },
  { month: 'May', followers: 0 },
  { month: 'June', followers: 0 },
  { month: 'July', followers: 0 }
];

interface FollowersChartProps {
  isEmptyState?: boolean;
}

const FollowersChart: React.FC<FollowersChartProps> = ({ isEmptyState = false }) => {
  const [selectedPoint, setSelectedPoint] = useState({ month: 'May', followers: 150000 });

  const handleChartClick = (data: any) => {
    console.log('Chart clicked:', data); // Debug log
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedData = data.activePayload[0].payload;
      setSelectedPoint({ month: clickedData.month, followers: clickedData.followers });
    } else if (data && data.activeLabel) {
      // Handle direct chart area clicks
      const monthIndex = followersData.findIndex(item => item.month === data.activeLabel);
      if (monthIndex !== -1) {
        setSelectedPoint({ month: data.activeLabel, followers: followersData[monthIndex].followers });
      }
    }
  };

  return (
    <div className="w-full flex-col border border-[#F1F1F4] items-center bg-white justify-center py-4 pl-4 pr-4 rounded-[10px]" style={{ boxShadow: "0px 5px 20px 0px #0000000D" }}>
        {/* Chart Title */}
        <h2 className="text-lg font-medium text-[#282828] mb-4">Followers</h2>
        
        {/* Chart Container */}
        <div className="w-full h-[278px]">
          {isEmptyState ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={emptyData}
                margin={{ top: 6, right: 10, left: 0, bottom: 0 }}
              >
                {/* Grid Lines - Horizontal and Vertical */}
                <CartesianGrid 
                  strokeDasharray="0" 
                  vertical={true}
                  horizontal={true}
                  stroke="#E5E7EB" 
                  strokeWidth={1}
                />
                
                {/* X-Axis */}
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#849AA9', fontSize: 11 }}
                  dy={10}
                />
                
                {/* Y-Axis */}
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#849AA9', fontSize: 11 }}
                  domain={[0, 250000]}
                  ticks={[50000, 100000, 150000, 200000, 250000]}
                  tickFormatter={(value) => `${value / 1000}K`}
                  dx={-10}
                />
                
                {/* Invisible line to force Y-axis rendering */}
                <Line
                  type="monotone"
                  dataKey="followers"
                  stroke="transparent"
                  strokeWidth={0}
                  dot={false}
                  activeDot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={followersData}
                margin={{ top: 6, right: 10, left: 0, bottom: 0 }}
                onClick={handleChartClick}
                onMouseDown={handleChartClick}
              >
                {/* Gradient Definition */}
                <defs>
                  <linearGradient id="followerGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(79, 70, 229, 0.0)" />
                    <stop offset="100%" stopColor="rgba(79, 70, 229, 0.15)" />
                  </linearGradient>
                </defs>
                
                {/* Grid Lines - Horizontal and Vertical */}
                <CartesianGrid 
                  strokeDasharray="0" 
                  vertical={true}
                  horizontal={true}
                  stroke="#E5E7EB" 
                  strokeWidth={1}
                />
                
                {/* X-Axis */}
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#849AA9', fontSize: 11 }}
                  dy={10}
                />
                
                {/* Y-Axis */}
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#849AA9', fontSize: 11 }}
                  domain={[0, 250000]}
                  ticks={[50000, 100000, 150000, 200000, 250000]}
                  tickFormatter={(value) => `${value / 1000}K`}
                  dx={-10}
                />
                
                {/* Tooltip */}
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    color: '#282828'
                  }}
                  formatter={(value: number) => [`${(value / 1000).toFixed(0)}K`, 'Followers']}
                />
                
                {/* Vertical Dashed Line at Selected Point */}
                <ReferenceLine 
                  x={selectedPoint.month} 
                  stroke="#5046E5" 
                  strokeDasharray="4 4"
                  strokeWidth={2}
                />
                
                {/* Area with Gradient Fill */}
                <Area
                  type="monotone"
                  dataKey="followers"
                  stroke="none"
                  fill="url(#followerGradient)"
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationBegin={0}
                />
                
                {/* Smooth Curved Line */}
                <Line
                  type="monotone"
                  dataKey="followers"
                  stroke="#5046E5"
                  strokeWidth={3}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationBegin={0}
                  activeDot={{ r: 6, fill: '#5046E5', stroke: 'white', strokeWidth: 2 }}
                />
                
                {/* Highlight Dot at Selected Point */}
                <ReferenceDot
                  x={selectedPoint.month}
                  y={selectedPoint.followers}
                  r={8}
                  fill="#5046E5"
                  stroke="white"
                  strokeWidth={3}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
    </div>
  );
};

export default FollowersChart;