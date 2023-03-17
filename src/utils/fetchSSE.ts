import { createParser } from 'eventsource-parser';

interface FetchSSEOptions extends RequestInit {
  onMessage: (data?: string) => void;
  onError?: (error?: any) => void;
}

export const fetchSSE = (url: string, options: FetchSSEOptions) => {
  const { onMessage, onError, ...restOptions } = options;

  const parser = createParser((evt) => {
    // console.log('evt: ', evt);
    try {
      if (evt?.type === 'event') {
        onMessage(evt.data);
      }
    } catch (error) {
      onError?.(error);
      console.log('error: ', error);
    }
  });

  return fetch(url, restOptions).then(async (resp: any) => {
    if (resp.status !== 200) {
      onError?.(await resp.json());
      return;
    }

    const reader = resp.body.pipeThrough(new TextDecoderStream()).getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      parser.feed(value);
    }
  });
};
