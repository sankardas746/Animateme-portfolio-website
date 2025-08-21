import React from 'react';
import MemoizedTextInput from './MemoizedTextInput';

const PageSection = ({ title, pageKey, fields, content, onContentChange }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
    <div className="space-y-4">
      {fields.map(field => (
        <div key={`${pageKey}-${field.key}`}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
          <MemoizedTextInput
            value={content?.[pageKey]?.[field.key] || ''}
            onChange={(e) => onContentChange(pageKey, field.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      ))}
    </div>
  </div>
);

export default PageSection;