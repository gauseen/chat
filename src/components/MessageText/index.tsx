import MessageWrapper, { MessageWrapperProps } from '../MessageWrapper';

interface MessageTextProps extends MessageWrapperProps {
  content: string;
}

const MessageText: React.FC<MessageTextProps> = (props) => {
  const { content, ...restWrapper } = props;

  return (
    <MessageWrapper {...restWrapper}>
      <div style={{ padding: '8px 10px' }}>{content}</div>
    </MessageWrapper>
  );
};

export default MessageText;
