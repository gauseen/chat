import React, { useState } from 'react';

import './style.css';

interface TextareaProps {
  onSubmit?: (value?: string) => void;
}

const Textarea: React.FC<TextareaProps> = (props) => {
  const { onSubmit } = props;
  const [value, setValue] = useState('');

  return (
    <div className="chat-textarea">
      <input
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
        }}
        className="chat-textarea-input"
      />

      <button
        className={`chat-textarea-button-send ${
          value?.trim() ? 'chat-textarea-button-send-active' : ''
        }`}
        onClick={() => {
          if (!value?.trim()) return;

          onSubmit?.(value);
          setValue('');
        }}
      >
        发送
      </button>
    </div>
  );
};

export default Textarea;
