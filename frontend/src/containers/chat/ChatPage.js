import React, { useState, useEffect, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import '../../styles/global.css';
import '../../styles/layout/chat/ChatPage.css';
import 'react-toastify/dist/ReactToastify.css';

import ChatContent from '../../components/chat/ChatContent';
import ChatHistory from '../../components/chat/ChatHistory';
import ChatInput from '../../components/chat/ChatInput';


const ChatPage = () => {
  const textareaRef = useRef(null);
  const containerRef = useRef(null);
  const chatlistcontainerRef = useRef(null);

  const [isWaiting, setIsWaiting] = useState(false);
  const [canEdit, setCanEdit] = useState(true);
  const [chatText, setChatText] = useState('');
  const [chatLists, setChatLists] = useState([]);
  const [chatContents, setChatContents] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isLoading, setIsLoading] = useState('loading-circle');

  useEffect(() => {
    const postData = { username: "user" };
    getChatListFromSever(postData);
  }, []);

  const getChatListFromSever = (postData) => {
    axios.post('http://localhost:5000/api/get-chat-list', postData)
      .then(response => {
        setCanEdit(true);
        let active_id = response.data.active_id;
        setSelectedChat(active_id);
        
        setChatLists([
          <>
          {
            response.data.message.map(item => (
              <React.Fragment>
                {
                  item.datetime ? <div className='chat-history-date'>{item.datetime}</div> : <></>
                }
                <div className='chat-history-body'>
                  <Link onClick={() => chatSelected(item.id)} style={{color:'black', textDecoration: 'none', height:'100%'}}>
                    new chat {item.id}
                  </Link>
                  <button className='button-del' onClick={() => delClicked(item.id)}  disabled={isWaiting}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </React.Fragment>
            ))
          }
          </>,
        ]);

        textareaRef.current.focus();
      })
      .catch(error => toast.error('Error fetching data:' + error));
  }


  useEffect(() => {
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [chatContents]);

  useEffect(() => {
    chatlistcontainerRef.current.scrollTop = chatlistcontainerRef.current.scrollHeight;
  }, [chatLists]);

  useEffect(() => {
    if (selectedChat == 0)
      toast.warning("Chat selection removed.");
    if (selectedChat == 0 || selectedChat == null) {
      return;
    }

    const postData = { username: "user", chat_id: selectedChat };
    axios.post('http://localhost:5000/api/get-all-chat', postData)
      .then(response => {

        let messageString = response.data.message;
        setCanEdit(false);
        setChatContents([
          <>
          {
            messageString.map(item => (
              <React.Fragment>
                <div className='chat-content-user'>
                  {item.question}
                </div>
                <br/>
                <div className='chat-content-server-status'>
                  <div className='loading-text'>Generating answers for you...</div>
                </div>
                <div className='chat-content-ai'>
                  {item.answer}
                </div>
                <br/>
                <br/>
              </React.Fragment>
            ))
          }
          </>
        ]
        );

        toast.success("Chat (" + selectedChat + ") selected.");
        textareaRef.current.focus();
      })
      .catch(error => toast.error('Error fetching data:' + error));
  }, [selectedChat]);

  const handleChatInputKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendClicked();
    }
  }

  const handleChatTextChange = (event) => {
    setChatText(event.target.value);
  }

  const sendClicked = () => {
    if (chatText === "") {
      toast.error("Type your message.");
      return;
    }

    if (chatLists.length == 0 || selectedChat == 0) {
      toast.warning("To start, create or select a chat please.");
      return;
    }

    if (chatLists.length == 1 && chatLists[0].props.children.length == 0) {
      toast.warning("To start, create or select a chat please.");
      return;
    }

    // Api Call
    setIsLoading('loading-circle');
    setChatContents(prevComponents => [
      ...prevComponents,
      <>
      <div className='chat-content-user'>
      {
        chatText.split('\n').map((line, index) => (
          <React.Fragment>
            {line}
            <br />
          </React.Fragment>
        ))
      }
      </div>

      <div className='chat-content-server-status'>
        <div className='loading-text'>Generating answers for you...</div>
      </div>
      </>
    ]);

    setChatText("");
    askAQuestion();
  };

  const askAQuestion = () => {
    const postData = { username: "user", prompt: chatText };
    //setIsWaiting(true);
    axios.post('http://localhost:5000/api/ask-a-question', postData)
      .then(response => {
        //setIsWaiting(false);
        setTimeout(() => {
          setIsLoading('loading-done');
        }, 1000); // 1 second delay (adjust as needed)
        
        setChatContents(prevComponents => [
          ...prevComponents,
          <>
          <div className='chat-content-ai'>
          {
            response.data.message.split('\n').map((line, index) => (
              <React.Fragment>
                {line}
                <br />
              </React.Fragment>
            ))
          }
          </div>
          </>
        ]);
      })
      .catch(error => toast.error('Error fetching data:' + error))
      .finally(() => {
        setIsLoading('loading-done');
        textareaRef.current.focus();
      });      
  }

  const chatSelected = chat_id => {
    setSelectedChat(chat_id);
  }

  const delClicked = chat_id => {
    const postData = { username: "user", chat_id: chat_id };
    axios.post('http://localhost:5000/api/delete-chat', postData)
      .then(response => {
        setChatContents([]);
        getChatListFromSever(postData);

        toast.success("Chat Deleted Successfully.");
      })
      .catch(error => toast.error('Error fetching data:' + error));
  }

  const learnClicked = () => {
    toast.info('Learn button clicked.');
  };

  const newChatClicked = () => {
    setChatContents([]);
    const postData = { username: "user" };
    axios.post('http://localhost:5000/api/create-new-chat', postData)
      .then(response => {
        getChatListFromSever(postData);
        toast.success("New chat created.");
      })
      .catch(error => toast.error('Error fetching data:' + error));
  };

  return (
    <div>
      <div className='chat-container'>
        <div className='chat-header'>
          <p className='header-title'>Tax Genii</p>
        </div>

        <ChatHistory chatlistcontainerRef={chatlistcontainerRef} chatLists={chatLists} />

        <ChatContent containerRef={containerRef} chatContents={chatContents} key={0}/>

        <ChatInput textareaRef={textareaRef} chatText={chatText} canEdit={canEdit} handleChatInputKeyDown={handleChatInputKeyDown} handleChatTextChange={handleChatTextChange} sendClicked={sendClicked} learnClicked={learnClicked} newChatClicked={newChatClicked} isWaiting={isWaiting} />

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          />
      </div>
    </div>
  );
};

export default ChatPage;