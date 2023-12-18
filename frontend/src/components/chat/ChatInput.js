import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faLink, faPlus } from '@fortawesome/free-solid-svg-icons';
import { faComment } from '@fortawesome/free-regular-svg-icons';

import '../../styles/components/chat/ChatInput.css';

const ChatInput = ({textareaRef, chatText, canEdit, handleChatInputKeyDown, handleChatTextChange, sendClicked, learnClicked, newChatClicked, isWaiting}) => {
    return (
        <div className='chat-input'>
            <div className={!isWaiting ? 'chat-input-rounded-rect' : 'chat-input-rounded-rect disabled'}>
                <textarea className="chat-input-textarea-field" placeholder="Type your message here..." ref={textareaRef} value={chatText} onKeyDown={handleChatInputKeyDown} onChange={handleChatTextChange} hidden ={isWaiting} />

                <div className='chat-input-button-send-group'>
                    <button className='chat-input-button-send' onClick={sendClicked} hidden={isWaiting}>
                    <FontAwesomeIcon icon={faPaperPlane} style={{color: "#000000"}} size='xl'/>
                    </button>
                    <button className='chat-input-button-learn' onClick={learnClicked} hidden={isWaiting}>
                    <FontAwesomeIcon icon={faLink} />
                    </button>
                </div>
            </div>
            
            <button className='chat-input-new-chat-button' onClick={newChatClicked} disabled={isWaiting}>
                <FontAwesomeIcon icon={faPlus} className="circle-plus" size='xs'/>
                <FontAwesomeIcon icon={faComment} className="comment" size='2xl'/>
            </button>
        </div>
    );
};

export default ChatInput;