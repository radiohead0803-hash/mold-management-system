import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: any;
  options?: any;
}

const BarChart: React.FC<BarChartProps> = ({ data, options }) => {
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
          padding: 15,
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
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
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
        beginAtZero: true,
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
          stepSize: 1,
        },
      },
    },
    barThickness: 'flex' as const,
    maxBarThickness: 40,
    ...options,
  };

  return (
    <div className="chart-container">
      <Bar data={data} options={defaultOptions} />
    </div>
  );
};

export default BarChart;
