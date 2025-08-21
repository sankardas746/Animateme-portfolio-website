import React, { useState, useEffect, memo } from 'react';

const MemoizedTextInput = memo(({ value, onChange, ...props }) => {
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
    <input
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      {...props}
    />
  );
});

export default MemoizedTextInput;