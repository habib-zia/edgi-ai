import React, { useState } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot } from 'recharts';
import { emptyData } from './PlatformIcon';

interface FollowersChartProps {
  selectedPlatform?: string;
  postsData?: any[];
  totalLikes?: number;
  topPostData?: any;
  insightsData?: any;
}

const FollowersChart: React.FC<FollowersChartProps> = ({ totalLikes = 0, topPostData, insightsData }) => {
  const [selectedPoint, setSelectedPoint] = useState({ day: 'Saturday', likes: 600 });

  const getCurrentData = () => {
    
    console.log('FollowersChart - getCurrentData called with:', {
      insightsData: insightsData ? { posts: insightsData.posts?.length, totalLikes: insightsData.totalLikes } : null,
      topPostData: topPostData ? { hasPlatforms: !!topPostData.platforms, platforms: Object.keys(topPostData.platforms || {}) } : null,
      totalLikes
    });
    
    if (insightsData && insightsData.posts && insightsData.posts.length > 0) {
      const hasEngagementData = insightsData.posts.some((post: any) => 
        post.insights && post.insights.length > 0
      );
      
      if (hasEngagementData) {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const baseValue = Math.floor(insightsData.totalLikes / 7);
        const remainder = insightsData.totalLikes % 7;
        
        return days.map((day, index) => {
          let dayLikes = baseValue;
          if (index < remainder) {
            dayLikes += 1;
          }
          const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
          dayLikes = Math.max(0, dayLikes + variation);
          
          return {
            day: day,
            likes: dayLikes
          };
        });
      } else {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return days.map((day) => ({
          day: day,
          likes: 0
        }));
      }
    }

    if (topPostData && topPostData.platforms) {
      let bestPlatformData: any[] | null = null;
      
      for (const [, platformData] of Object.entries(topPostData.platforms)) {
        const data = platformData as any;
        if (data && data.performanceData && Array.isArray(data.performanceData)) {
          bestPlatformData = data.performanceData;
          break;
        }
      }
      
      if (bestPlatformData) {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        return bestPlatformData.map((data: any, index: number) => ({
          day: days[index] || data.day,
          likes: data.value || 0
        }));
      }
    }

    return emptyData;
  };

  const currentData = getCurrentData(); 
  const getSelectedPointData = () => {
    const pointData = currentData.find((item: any) => item.day === selectedPoint.day);
    return pointData || { day: selectedPoint.day, likes: selectedPoint.likes };
  };

  const selectedPointData = getSelectedPointData();

  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedData = data.activePayload[0].payload;
      setSelectedPoint({ day: clickedData.day, likes: clickedData.likes });
    } else if (data && data.activeLabel) {
      const dayIndex = currentData.findIndex((item: any) => item.day === data.activeLabel);
      if (dayIndex !== -1) {
        setSelectedPoint({ day: data.activeLabel, likes: currentData[dayIndex].likes });
      }
    }
  };

  return (
    <div className="w-full flex-col border border-[#F1F1F4] items-center bg-white justify-center py-4 pl-4 pr-4 rounded-[10px]" style={{ boxShadow: "0px 5px 20px 0px #0000000D" }}>
        <div className="w-full flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#282828]">
            {insightsData ? 'Insights Performance' : (topPostData ? 'Top Post Performance' : 'Total Likes in this Week')}
          </h2>
          
          {(totalLikes > 0 || insightsData || topPostData) && (
            <div className="flex items-center gap-2 px-3 py-2 bg-[#EEEEEE] rounded-[7px]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="8" fill="#5046E5"/>
                <path d="M6 10L8.5 12.5L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-base font-medium text-[#282828]">All</span>
            </div>
          )}
        </div>
        
        <div className="w-full h-[278px]">
          {totalLikes === 0 && !insightsData && !topPostData ? (
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
                  dataKey="day" 
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
                   domain={[0, Math.max(totalLikes, 10)]}
                   tickFormatter={(value) => value.toString()}
                  dx={-10}
                />
                
                {/* Invisible line to force Y-axis rendering */}
                <Line
                  type="monotone"
                  dataKey="likes"
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
                data={currentData}
                margin={{ top: 6, right: 10, left: 0, bottom: 0 }}
                onClick={handleChartClick}
                onMouseDown={handleChartClick}
              >
                {/* Gradient Definition */}
                <defs>
                  <linearGradient id="likesGradient" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="day" 
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
                   domain={[0, Math.max(totalLikes, 10)]}
                   tickFormatter={(value) => value.toString()}
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
                  formatter={(value: number) => [value.toString(), 'Likes']}
                />
                
                {/* Vertical Dashed Line at Selected Point */}
                <ReferenceLine 
                  x={selectedPointData.day} 
                  stroke="#5046E5" 
                  strokeDasharray="4 4"
                  strokeWidth={2}
                />
                
                {/* Area with Gradient Fill */}
                <Area
                  type="monotone"
                  dataKey="likes"
                  stroke="none"
                  fill="url(#likesGradient)"
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationBegin={0}
                />
                
                {/* Smooth Curved Line */}
                <Line
                  type="monotone"
                  dataKey="likes"
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
                  x={selectedPointData.day}
                  y={selectedPointData.likes}
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