import React from 'react';
import './style.css';

interface MessageListProps {
  children?: React.ReactNode;
  width?: string;
  height?: string;
  className?: string;
}

const prefix = 'message-list';

const MessageList = React.forwardRef<any, MessageListProps>((props, ref) => {
  const { width, height, className = '' } = props;

  const style = {
    width,
    height,
  };

  return (
    <ul className={`${prefix} ${className}`} ref={ref} style={style}>
      {props.children}
    </ul>
  );
});

MessageList.displayName = 'MessageList';

export default MessageList;
