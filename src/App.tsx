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
import { defaultChatGPTConfig } from './utils/const';
import { checkApiKey } from './utils/check';

interface MessageItem {
  content: string;
  role: 'user' | 'assistant';
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
    checkApiKey();
  }, []);

  // 点击发送按钮回调
  const handleSend = useCallback((value?: string) => {
    if (!value) return;

    checkApiKey();

    const prevMessages = messageIdListRef.current?.map((msgId) => {
      const { role, content } = messageMapRef.current[msgId] || {};

      return {
        role,
        content,
      };
    });

    // 自己发送的消息直接上屏
    messageMapRef.current[`user_${Date.now()}`] = {
      role: 'user',
      content: value,
    };
    forceUpdate({});

    const chatgptApiKey = window.localStorage.getItem('chatgptApiKey');

    fetchSSE('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${chatgptApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...defaultChatGPTConfig,
        messages: [...prevMessages, { role: 'user', content: value }],
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
              role: 'assistant',
              content: (messageMapRef.current[id]?.content || '') + content,
            };

            forceUpdate({});
          }
        } catch (error: any) {
          window.alert(error?.message || JSON.stringify(error));
          console.log('onMessage error: ', error);
        }
      },

      onError: (error) => {
        window.alert(error?.message || JSON.stringify(error));
        console.log('onError: ', error);
      },
    });
  }, []);

  return (
    <main className="chat-app">
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
