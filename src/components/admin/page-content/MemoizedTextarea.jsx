import React, { useState, useEffect, memo } from 'react';

const MemoizedTextarea = memo(({ value, onChange, ...props }) => {
    const [localValue, setLocalValue] = useState(value);
  
    useEffect(() => {
      setLocalValue(value);
    }, [value]);
  
    const handleBlur = () => {
      if (localValue !== value) {
        onChange({ target: { value: localValue } });
      }
    };
  
    return (
      <textarea
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        {...props}
      />
    );
  });
  
  export default MemoizedTextarea;