import React from 'react';

import '../../styles/components/chat/ChatContent.css';

const ChatContent = ({ containerRef, chatContents}) => {
  return (
    <div ref={containerRef} className='chat-content'>
      {chatContents}
    </div>
  );
};

export default ChatContent;