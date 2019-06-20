const axios = require('axios');
const socket = io('ws://localhost:8080', { transports: ['websocket'] });
let id;

window.onload = () => {
  document.getElementById('addBtn').addEventListener('click', () => {
    let roomName = prompt('방 제목을 입력해주세요');
    chrome.storage.sync.set({ room_name: roomName });
    socket.emit('createRoom', roomName);
  });
};

socket.on('redirectRoom', url => {
  location.href = url;
});

socket.on('rooms', rooms => {
  console.log('rooms', rooms);
  let friendNav = document.getElementById('friend-nav');
  while (friendNav.firstChild) {
    friendNav.removeChild(friendNav.firstChild);
  }
  rooms.forEach(f => {
    console.log(f.id);
    let li = document.createElement('li');
    li.classList.add('room-item');
    let childLi = document.createElement('li');
    childLi.innerHTML = f.name;
    childLi.dataset.idx = f.id;
    childLi.addEventListener('click', joinRoom);
    li.appendChild(childLi);
    friendNav.appendChild(li);
  });
  console.log(rooms);
});

joinRoom = e => {
  console.log(e.target.dataset.idx);
  socket.emit('joinRoom', e.target.dataset.idx);
};
