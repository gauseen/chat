import React from 'react';
import './style.css';

export interface MessageWrapperProps {
  children?: React.ReactNode;
  position?: 'left' | 'right' | 'center';
  sendTime?: string;
  /** 未读状态 */
  unreadText?: React.ReactNode;
  style?: React.CSSProperties;
}

const prefix = 'message-wrapper';

const MessageWrapper: React.FC<MessageWrapperProps> = (props) => {
  const { sendTime, children, unreadText, position = 'left', style } = props;

  return (
    <li className={`${prefix} ${prefix}__position-${position}`} style={style}>
      <div className={`${prefix}__container`}>
        <p className={`${prefix}__title`}>{sendTime}</p>
        <div className={`${prefix}__body`}>
          <div className={`${prefix}__body-content`}>{children}</div>
        </div>
        <div className={`${prefix}__footer`}>
          {unreadText && (
            <span className={`${prefix}__footer__unread-text`}>
              {unreadText}
            </span>
          )}
        </div>
      </div>
    </li>
  );
};

export default MessageWrapper;
