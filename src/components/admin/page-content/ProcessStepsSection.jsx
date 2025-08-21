import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import MemoizedTextInput from './MemoizedTextInput';
import MemoizedTextarea from './MemoizedTextarea';

const ProcessStepsSection = ({ title, pageKey, content, onStepChange, onAddStep, onRemoveStep }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      <Button size="sm" onClick={() => onAddStep(pageKey)}><Plus className="w-4 h-4 mr-2" />Add Step</Button>
    </div>
    <div className="space-y-4">
      {(content?.[pageKey]?.process_steps || []).map((step, index) => (
        <div key={`${pageKey}-step-${index}`} className="space-y-2 p-4 border rounded-md bg-gray-50">
          <div className="flex justify-between items-center">
              <p className="font-semibold text-gray-600">Step {index + 1}</p>
              <Button variant="destructive" size="icon" onClick={() => onRemoveStep(pageKey, index)}>
                  <Trash2 className="w-4 h-4" />
              </Button>
          </div>
          <MemoizedTextInput
            placeholder="Step Title"
            value={step.title || ''}
            onChange={(e) => onStepChange(pageKey, index, 'title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
          <MemoizedTextarea
            placeholder="Step Description"
            value={step.description || ''}
            onChange={(e) => onStepChange(pageKey, index, 'description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            rows={2}
          />
        </div>
      ))}
    </div>
  </div>
);

export default ProcessStepsSection;