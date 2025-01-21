import React, { useState, useEffect } from 'react';
import logo from './Logo White MST.png';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [information, setInformation] = useState(''); // ข้อมูลที่จะแสดง
  const [username, setUsername] = useState('User'); // ชื่อผู้ใช้ (IP Address)
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
    fetch('http://192.168.7.94:5000/get-hostname')
      .then((response) => response.json())
      .then((data) => {
        setUsername(data.userIP || 'Unknown User'); // หากไม่พบ IP ให้ใช้ 'Unknown User'
      })
      .catch((error) => console.error('Error fetching host name:', error));

    // ดึงข้อมูลแชทจาก API เริ่มต้น
    fetch('http://192.168.7.94:5000/messages')
      .then((response) => response.json())
      .then((data) => setMessages(data))
      .catch((error) => console.error('Error fetching messages:', error));

    // ดึงประกาศจาก API เริ่มต้น
    fetch('http://192.168.7.94:5000/announcement')
      .then((response) => response.json())
      .then((data) => {
        setAnnouncement({
          IT: data.IT || 'No IT announcements available.',
          GA: data.GA || 'No GA announcements available.',
          HR: data.HR || 'No HR announcements available.',
        });
      })
      .catch((error) => console.error('Error fetching announcement:', error));

    // ดึงข้อมูลจาก API เริ่มต้น
    fetch('http://192.168.7.94:5000/information')
      .then((response) => response.json())
      .then((data) => {
        setInformation(data.text || 'No information available.');
      })
      .catch((error) => console.error('Error fetching information:', error));

    // ตั้งค่าการเชื่อมต่อ WebSocket
    const socket = new WebSocket('ws://192.168.7.94:5000'); // เชื่อมต่อไปยัง WebSocket server

    socket.onopen = () => {
      console.log('Connected to WebSocket');
    };

    // รับข้อมูลใหม่จาก WebSocket (แชท, ประกาศ, หรือข้อมูลใหม่)
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'message') {
        // ถ้าเป็นข้อความใหม่, อัปเดตแชท
        setMessages((prevMessages) => [...prevMessages, { username: data.username, message: data.message }]);
      } else if (data.type === 'announcement') {
        // ถ้าเป็นประกาศใหม่, อัปเดตประกาศ
        setAnnouncement((prevAnnouncement) => ({
          ...prevAnnouncement,
          [data.section]: data.content,
        }));
      } else if (data.type === 'information') {
        // ถ้าเป็นข้อมูลใหม่, อัปเดตข้อมูล
        setInformation(data.text || 'No information available.');
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    // ทำความสะอาดเมื่อ component ถูก unmount
    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() !== '') {
      fetch('http://192.168.7.94:5000/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, message }),
      })
        .then(() => {
          setMessages([...messages, { username, message }]);
          setMessage(''); // รีเซ็ตค่า input
        })
        .catch((error) => console.error('Error sending message:', error));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };
  const navigateToAdmin = () => {
    const password = prompt("Please enter the admin password");
    const correctPassword = "admin123"; // ใส่รหัสผ่านที่ต้องการที่นี่
    if (password === correctPassword) {
      window.location.href = '/admin.html'; // พาผู้ใช้ไปยังหน้า admin
    } else {
      alert("Incorrect password. Please try again.");
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
            <button className="navbar-btn" onClick={navigateToAdmin}>Admin</button> {/* ปุ่มไปหน้า Admin */}
          </div>
        </div>
      </header>

      <main>
        <section id="section-2" className="section">
          <h1>Announcement</h1>
          <div className="buttons-section2">
            <button className="btn-section2" onClick={() => handleShowAnnouncement('all')}><img src="house.png" alt="logo" /></button>
            <button className="btn-section2" onClick={() => handleShowAnnouncement('IT')}><img src="it.png" alt="logo" /></button>
            <button className="btn-section2" onClick={() => handleShowAnnouncement('GA')}><img src="GA.png" alt="logo" /></button>
            <button className="btn-section2" onClick={() => handleShowAnnouncement('HR')}><img src="hr-manager.png" alt="logo" /></button>
          </div>
          <div className="announcement-content">
            <div className="announcement-box">
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
          </div>
        </section>

        <section id="section-3" className="section">
          <h1>Information
          <img src="idea.png" alt="Logo" className="info-logo" />
          </h1>
          <div className="information-content">
            <div className="information-box">
              <p>{information || 'No information available.'}</p>
            </div>
          </div>
        </section>

        <section id="section-4" className="section">
          <h1>Chat
          <img src="speak.png" alt="Logo" className="info-logo" />
          </h1>
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

