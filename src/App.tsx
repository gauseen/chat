import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import './App.css';
import MessageList from './components/MessageList';
import MessageText from './components/MessageText';
import { fetchSSE } from './utils/fetchSSE';
import Textarea from './components/Textarea';
import { MessageWrapperProps } from './components/MessageWrapper';

interface MessageItem {
  content: string;
  role: 'user' | 'chatgpt';
}

function App() {
  const [updateValue, forceUpdate] = useState<any>({});
  const messageMapRef = useRef<Record<string, MessageItem>>({});

  const messageIdList = useMemo(() => {
    return Object.keys(messageMapRef.current);
  }, [updateValue]);

  const messageIdListRef = useRef<any[]>([]);
  messageIdListRef.current = messageIdList;

  useEffect(() => {
    const apiKey = window.localStorage.getItem('apiKey');

    if (!apiKey) {
      const value = window.prompt('请输入 Api Key');
      if (!value) return;

      window.localStorage.setItem('apiKey', value);
    }
  }, []);

  const handleSend = useCallback((value?: string) => {
    if (!value) return;

    const body = {
      model: 'gpt-3.5-turbo',
      temperature: 0,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 1,
      presence_penalty: 1,
      stream: true,
    };

    const parent_message_id =
      messageIdListRef.current?.[messageIdListRef.current.length - 1];

    // 自己发送的消息直接上屏
    messageMapRef.current[`user_${Date.now()}`] = {
      role: 'user',
      content: value,
    };
    forceUpdate({});

    const apiKey = window.localStorage.getItem('apiKey');

    fetchSSE('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...body,
        messages: [{ role: 'user', content: value }],
        parent_message_id,
      }),

      onMessage: (res) => {
        try {
          // 回答完毕
          if (!res || res === '[DONE]') return;

          const data = JSON.parse(res);
          const { id, choices } = data;
          const {
            delta: { content },
          } = choices?.[0] || {};

          if (content) {
            messageMapRef.current[id] = {
              role: 'chatgpt',
              content: (messageMapRef.current[id]?.content || '') + content,
            };

            forceUpdate({});
          }
        } catch (error) {
          console.log('onMessage error: ', error);
        }
      },

      onError: (error) => {
        console.log('onError: ', error);
      },
    });
  }, []);

  return (
    <main>
      <MessageList className="chat-message-list">
        {messageIdList?.map((msgId) => {
          const { content, role } = messageMapRef.current[msgId];
          const position: MessageWrapperProps['position'] =
            role === 'user' ? 'right' : 'left';

          return (
            <MessageText
              content={content.trimStart()}
              position={position}
              key={msgId}
            />
          );
        })}
      </MessageList>

      <Textarea onSubmit={handleSend} />
    </main>
  );
}

export default App;
