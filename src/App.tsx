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
import useScrollToView from './hooks/useScrollToView';
import { defaultChatGPTConfig } from './utils/const';
import { checkApiKey } from './utils/check';

interface MessageItem {
  content: string;
  role: 'user' | 'assistant';
}

function App() {
  const [updateValue, forceUpdate] = useState<any>({});
  const messageMapRef = useRef<Record<string, MessageItem>>({});
  const activeMessageId = useRef('');

  const messageIdList = useMemo(() => {
    return Object.keys(messageMapRef.current);
  }, [updateValue]);

  const messageIdListRef = useRef<any[]>([]);
  messageIdListRef.current = messageIdList;

  useEffect(() => {
    checkApiKey();
  }, []);

  const [loading, setLoading] = useState(false);
  const { inspection, scrollBottom, scrollContainerRef } = useScrollToView();

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
    setLoading(() => true);
    scrollBottom();

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
          setLoading(() => false);
          // 回答完毕
          if (!res || res === '[DONE]') {
            activeMessageId.current = '';
            forceUpdate({});
            return;
          }

          const data = JSON.parse(res);
          const { id, choices } = data;

          activeMessageId.current = id;

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
        setLoading(() => false);
        activeMessageId.current = '';
        window.alert(error?.message || JSON.stringify(error));
        console.log('onError: ', error);
      },
    });
  }, []);

  return (
    <main className="chat-app">
      <MessageList ref={scrollContainerRef} className="chat-message-list">
        <MessageText
          content={'你好，我是 ChatGPT，请输入内容开始和我聊天吧'}
          position={'left'}
        />

        {messageIdList?.map((msgId) => {
          const { content, role } = messageMapRef.current[msgId];
          const position: MessageWrapperProps['position'] =
            role === 'user' ? 'right' : 'left';

          return (
            <MessageText
              flicker={msgId === activeMessageId.current}
              content={content.trimStart()}
              position={position}
              key={msgId}
            />
          );
        })}

        {loading && (
          <MessageText flicker={true} content={''} position={'left'} />
        )}

        {inspection}
      </MessageList>

      <Textarea onSubmit={handleSend} />
    </main>
  );
}

export default App;
