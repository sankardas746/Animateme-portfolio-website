import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import MemoizedTextInput from './MemoizedTextInput';

const StatsSection = ({ title, pageKey, content, onStatChange, onAddStat, onRemoveStat }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      <Button size="sm" onClick={() => onAddStat(pageKey)}><Plus className="w-4 h-4 mr-2" />Add Stat</Button>
    </div>
    <div className="space-y-4">
      {(content?.[pageKey]?.stats || []).map((stat, index) => (
        <div key={`${pageKey}-stat-${index}`} className="flex items-center space-x-2">
          <MemoizedTextInput
            placeholder="Value (e.g., 500+)"
            value={stat.value || ''}
            onChange={(e) => onStatChange(pageKey, index, 'value', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
          <MemoizedTextInput
            placeholder="Label (e.g., Projects Completed)"
            value={stat.label || ''}
            onChange={(e) => onStatChange(pageKey, index, 'label', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
          <Button variant="destructive" size="icon" onClick={() => onRemoveStat(pageKey, index)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  </div>
);

export default StatsSection;