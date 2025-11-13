import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList } from 'recharts';

interface FollowersChartProps {
  topPostData?: any;
}

const FollowersChart: React.FC<FollowersChartProps> = ({ topPostData }) => {

  const getPerformanceData = () => {
    if (!topPostData || !topPostData.insights || !Array.isArray(topPostData.insights)) {
      return [];
    }

    const getInsightValue = (type: string) => {
      const insight = topPostData.insights.find((i: any) => i.type === type);
      return insight?.value || 0;
    };

    const getPlatformFromAccountType = (accountType: string): string => {
      if (!accountType) return '';
      if (accountType.includes('Instagram')) return 'Instagram';
      if (accountType.includes('Facebook')) return 'Facebook';
      if (accountType.includes('LinkedIn')) return 'LinkedIn';
      if (accountType.includes('YouTube')) return 'YouTube';
      if (accountType.includes('Twitter') || accountType.includes('X')) return 'X';
      if (accountType.includes('TikTok')) return 'TikTok';
      return '';
    };

    const platform = getPlatformFromAccountType(topPostData.account_type || '');
    
    const getPlatformMetrics = (platformName: string): Array<{ key: string; label: string; getValue: () => number }> => {
      switch (platformName) {
        case 'Facebook':
          return [
            { key: 'impressions', label: 'Impressions', getValue: () => getInsightValue('impressions') || getInsightValue('reach') || 0 },
            { key: 'likes', label: 'Likes', getValue: () => getInsightValue('reactions') || getInsightValue('like_count') || getInsightValue('likes') || 0 },
            { key: 'clicks', label: 'Clicks', getValue: () => getInsightValue('clicks') || 0 },
            { key: 'comments', label: 'Comments', getValue: () => getInsightValue('comments_count') || getInsightValue('comments') || 0 },
            { key: 'shares', label: 'Shares', getValue: () => getInsightValue('shares') || 0 }
          ];
        case 'Instagram':
          return [
            { key: 'reach', label: 'Reach', getValue: () => getInsightValue('reach') || 0 },
            { key: 'likes', label: 'Likes', getValue: () => getInsightValue('like_count') || getInsightValue('likes') || 0 },
            { key: 'total_interactions', label: 'Interactions', getValue: () => getInsightValue('total_interactions') || 0 },
            { key: 'comments', label: 'Comments', getValue: () => getInsightValue('comments_count') || getInsightValue('comments') || 0 },
            { key: 'shares', label: 'Shares', getValue: () => getInsightValue('shares') || 0 }
          ];
        case 'LinkedIn':
          return [
            { key: 'clicks', label: 'Clicks', getValue: () => getInsightValue('clicks') || getInsightValue('reach') || 0 },
            { key: 'likes', label: 'Likes', getValue: () => getInsightValue('like_count') || getInsightValue('likes') || 0 },
            { key: 'total_interactions', label: 'Interactions', getValue: () => getInsightValue('total_interactions') || 0 },
            { key: 'comments', label: 'Comments', getValue: () => getInsightValue('comments_count') || getInsightValue('comments') || 0 },
            { key: 'shares', label: 'Shares', getValue: () => getInsightValue('shares') || 0 },
            { key: 'video_views', label: 'Video Views', getValue: () => getInsightValue('video_views') || 0 },
            { key: 'unique_impressions', label: 'Unique Impressions', getValue: () => getInsightValue('unique_impressions') || 0 }
          ];
        case 'TikTok':
          return [
            { key: 'reach', label: 'Reach', getValue: () => getInsightValue('reach') || 0 },
            { key: 'likes', label: 'Likes', getValue: () => getInsightValue('like_count') || getInsightValue('likes') || 0 },
            { key: 'total_interactions', label: 'Interactions', getValue: () => getInsightValue('total_interactions') || 0 },
            { key: 'comments', label: 'Comments', getValue: () => getInsightValue('comments_count') || getInsightValue('comments') || 0 },
            { key: 'shares', label: 'Shares', getValue: () => getInsightValue('shares') || 0 }
          ];
        case 'X':
        case 'Twitter':
          return [
            { key: 'likes', label: 'Likes', getValue: () => getInsightValue('like_count') || getInsightValue('likes') || 0 },
            { 
              key: 'retweets', 
              label: 'Retweets', 
              getValue: () => getInsightValue('retweets') || 0
            }
          ];
        case 'YouTube':
          return [
            { key: 'views', label: 'Views', getValue: () => getInsightValue('views') || getInsightValue('reach') || 0 },
            { key: 'likes', label: 'Likes', getValue: () => getInsightValue('like_count') || getInsightValue('likes') || 0 },
            { key: 'comments', label: 'Comments', getValue: () => getInsightValue('comments_count') || getInsightValue('comments') || 0 },
            { key: 'dislikes', label: 'Dislikes', getValue: () => getInsightValue('dislikes') || 0 }
          ];
        default:
          return [
            { key: 'reach', label: 'Reach', getValue: () => getInsightValue('reach') || 0 },
            { key: 'likes', label: 'Likes', getValue: () => getInsightValue('like_count') || getInsightValue('likes') || 0 },
            { key: 'total_interactions', label: 'Interactions', getValue: () => getInsightValue('total_interactions') || 0 },
            { key: 'comments', label: 'Comments', getValue: () => getInsightValue('comments_count') || getInsightValue('comments') || 0 },
            { key: 'shares', label: 'Shares', getValue: () => getInsightValue('shares') || 0 }
          ];
      }
    };

    const platformMetrics = getPlatformMetrics(platform);
    
    return platformMetrics.map(m => ({
      metric: m.label,
      value: m.getValue()
    }));
  };

  const performanceData = getPerformanceData();
  
  const maxValue = performanceData.length > 0 
    ? Math.max(...performanceData.map(d => d.value), 10)
    : 10;

  return (
    <div className="w-full flex-col border border-[#F1F1F4] items-center bg-white justify-center py-4 pl-4 pr-4 rounded-[10px]" style={{ boxShadow: "0px 5px 20px 0px #0000000D" }}>
        <div className="w-full flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#282828]">
            Top Post Performance
          </h2>
        </div>
        
        <div className="w-full h-[278px] relative">
          {performanceData.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <p>No performance data available</p>
            </div>
          ) : (
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
          )}
        </div>
    </div>
  );
};

export default FollowersChart;