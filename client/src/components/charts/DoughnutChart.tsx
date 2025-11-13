import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DoughnutChartProps {
  data: any; // 유연한 타입으로 변경
  options?: any;
}

const DoughnutChart: React.FC<DoughnutChartProps> = ({ data, options }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            family: '-apple-system, BlinkMacSystemFont, SF Pro Text, sans-serif',
            size: 12,
          },
          color: '#525252',
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
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
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
    cutout: '60%',
    elements: {
      arc: {
        borderWidth: 2,
      },
    },
    ...options,
  };

  return (
    <div className="chart-container">
      <Doughnut data={data} options={defaultOptions} />
    </div>
  );
};

export default DoughnutChart;
