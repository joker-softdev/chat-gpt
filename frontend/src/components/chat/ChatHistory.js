import React from 'react';

import '../../styles/components/chat/ChatHistory.css';

const ChatHistory = ({ chatlistcontainerRef, chatLists}) => {
  return (
    <div ref={chatlistcontainerRef} className='chat-history'>
      {chatLists}
    </div>
  );
};

export default ChatHistory;