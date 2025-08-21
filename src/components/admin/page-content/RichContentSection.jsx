import React from 'react';
import RichTextEditor from '@/components/admin/RichTextEditor';

const RichContentSection = ({ title, pageKey, contentField = 'content', content, onContentChange }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
    <RichTextEditor
      value={content?.[pageKey]?.[contentField] || ''}
      onChange={(value) => onContentChange(pageKey, contentField, value)}
    />
  </div>
);

export default RichContentSection;