import MessageWrapper, { MessageWrapperProps } from '../MessageWrapper';

import './style.css';

interface MessageTextProps extends MessageWrapperProps {
  content: string;
  flicker?: boolean;
}

const MessageText: React.FC<MessageTextProps> = (props) => {
  const { content, flicker, ...restWrapper } = props;

  return (
    <MessageWrapper {...restWrapper}>
      <div
        className={`chat-message-text${flicker ? '-flicker' : ''}`}
        style={{ padding: '8px 10px' }}
      >
        {content}
      </div>
    </MessageWrapper>
  );
};

export default MessageText;
