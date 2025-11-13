import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineChartProps {
  data: any; // 유연한 타입으로 변경
  options?: any;
}

const LineChart: React.FC<LineChartProps> = ({ data, options }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: '-apple-system, BlinkMacSystemFont, SF Pro Text, sans-serif',
            size: 12,
          },
          color: '#525252',
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#e5e5e5',
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: {
          family: '-apple-system, BlinkMacSystemFont, SF Pro Text, sans-serif',
          size: 13,
          weight: '600',
        },
        bodyFont: {
          family: '-apple-system, BlinkMacSystemFont, SF Pro Text, sans-serif',
          size: 12,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: '#f5f5f5',
          borderColor: '#e5e5e5',
        },
        ticks: {
          font: {
            family: '-apple-system, BlinkMacSystemFont, SF Pro Text, sans-serif',
            size: 11,
          },
          color: '#737373',
        },
      },
      y: {
        grid: {
          color: '#f5f5f5',
          borderColor: '#e5e5e5',
        },
        ticks: {
          font: {
            family: '-apple-system, BlinkMacSystemFont, SF Pro Text, sans-serif',
            size: 11,
          },
          color: '#737373',
        },
      },
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2,
      },
      line: {
        borderWidth: 2,
        tension: 0.3,
      },
    },
    ...options,
  };

  return (
    <div className="chart-container">
      <Line data={data} options={defaultOptions} />
    </div>
  );
};

export default LineChart;
