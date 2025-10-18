import React from 'react';
import { Chart } from './utils/types';

interface ChartListProps {
  charts: Chart[];
  selectedChart: Chart | null;
  onSelectChart: (chart: Chart) => void;
}

const ChartList: React.FC<ChartListProps> = ({ charts, selectedChart, onSelectChart }) => {
  return (
    <div className="w-48 bg-white shadow-lg p-3 border-l border-gray-200">
      <h2 className="text-lg font-bold mb-4 text-black border-b pb-2 text-right">
        لیست چارت‌ها
      </h2>

      <div className="space-y-2">
        {charts.map((chart) => (
          <button
            key={chart.id}
            onClick={() => onSelectChart(chart)}
            className={`w-40 p-2 rounded-lg text-right text-md transition-all ${
              selectedChart?.id === chart.id
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            {chart.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChartList;