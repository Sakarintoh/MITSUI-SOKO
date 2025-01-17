import React, { useState, useEffect } from 'react';
import logo from './Logo White MST.png';
import './App.css';

function App() {
  const serverURL = 'http://192.168.105.119:5000'; // URL เซิร์ฟเวอร์
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [information, setInformation] = useState('');
  const [username, setUsername] = useState('User'); // ค่าเริ่มต้นเป็น 'User'
  const [announcement, setAnnouncement] = useState({
    IT: 'IT Announcement text...',
    GA: 'GA Announcement text...',
    HR: 'HR Announcement text...',
  });
  const [selectedAnnouncement, setSelectedAnnouncement] = useState('all');

  // ฟังก์ชันเพื่อเปลี่ยนแสดงข้อความตามหัวข้อที่เลือก
  const handleShowAnnouncement = (section) => {
    setSelectedAnnouncement(section);
  };

  useEffect(() => {
    // ดึงข้อมูล Host Name หรือ IP Address ของผู้ใช้
    fetch(`${serverURL}/get-hostname`)
      .then((response) => response.json())
      .then((data) => {
        setUsername(data.hostName || data.userIP || 'Unknown User'); // ใช้ Host Name หรือ IP
      })
      .catch((error) => console.error('Error fetching host name:', error));

    // ดึงข้อความแชท
    fetch(`${serverURL}/messages`)
      .then((response) => response.json())
      .then((data) => setMessages(data))
      .catch((error) => console.error('Error fetching messages:', error));

    // ดึงประกาศ
    fetch(`${serverURL}/announcement`)
      .then((response) => response.json())
      .then((data) => {
        setAnnouncement({
          IT: data.IT || 'No IT announcements available.',
          GA: data.GA || 'No GA announcements available.',
          HR: data.HR || 'No HR announcements available.',
        });
      })
      .catch((error) => console.error('Error fetching announcement:', error));

    // ดึงข้อมูล
    fetch(`${serverURL}/information`)
      .then((response) => response.json())
      .then((data) => {
        setInformation(data.text || 'No information available.');
      })
      .catch((error) => console.error('Error fetching information:', error));
  }, [serverURL]);

  const sendMessage = () => {
    if (message.trim() !== '') {
      fetch(`${serverURL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, message }),
      })
        .then(() => {
          setMessages([...messages, { username, message }]);
          setMessage('');
        })
        .catch((error) => console.error('Error sending message:', error));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="App">
      <header className="App-header" id="App-header">
        <div className="top-bar">
          <div className="logo-container">
            <img src={logo} className="App-logo" alt="logo" />
            <span className="logo-text">Information MSTG (Intranet)</span>
          </div>
          <div className="navbar-buttons">
            <button className="navbar-btn" onClick={() => navigateToSection('App-header')}>Home</button>
            <button className="navbar-btn" onClick={() => navigateToSection('section-2')}>Announcement</button>
            <button className="navbar-btn" onClick={() => navigateToSection('section-3')}>Information</button>
            <button className="navbar-btn" onClick={() => navigateToSection('section-4')}>Chat</button>
            <a href="/admin.html" target="_blank" rel="noopener noreferrer">
              <button className="navbar-btn">Admin</button>
            </a>
          </div>
        </div>
      </header>

      <main>
        <section id="section-2" className="section">
          <h1>Announcement</h1>
          <div className="buttons-section2">
            <button className="btn-section2" onClick={() => handleShowAnnouncement('all')}>All</button>
            <button className="btn-section2" onClick={() => handleShowAnnouncement('IT')}>IT</button>
            <button className="btn-section2" onClick={() => handleShowAnnouncement('GA')}>GA</button>
            <button className="btn-section2" onClick={() => handleShowAnnouncement('HR')}>HR</button>
          </div>
          <div className="announcement-content">
            {selectedAnnouncement === 'all' && (
              <div>
                <h2>IT</h2>
                <p>{announcement.IT}</p>
                <h2>GA</h2>
                <p>{announcement.GA}</p>
                <h2>HR</h2>
                <p>{announcement.HR}</p>
              </div>
            )}
            {selectedAnnouncement === 'IT' && (
              <div>
                <h2>IT</h2>
                <p>{announcement.IT}</p>
              </div>
            )}
            {selectedAnnouncement === 'GA' && (
              <div>
                <h2>GA</h2>
                <p>{announcement.GA}</p>
              </div>
            )}
            {selectedAnnouncement === 'HR' && (
              <div>
                <h2>HR</h2>
                <p>{announcement.HR}</p>
              </div>
            )}
          </div>
        </section>

        <section id="section-3" className="section">
          <h1>Information</h1>
          <div className="information-box">
            <p>{information || 'No information available.'}</p>
          </div>
        </section>

        <section id="section-4" className="section">
          <h1>Chat</h1>
          <div className="chat-container">
            <div className="chat-box">
              {messages.map((msg, index) => (
                <div key={index} className="chat-message">
                  <p><strong>{msg.username}</strong>: {msg.message}</p>
                </div>
              ))}
            </div>
            <div className="chat-input-container">
              <input
                type="text"
                className="chat-input"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button className="send-btn" onClick={sendMessage}>Send</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function navigateToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

export default App;
