const axios = require('axios');
const socket = io('http://localhost:8080');
let id;

window.onload = () => {
  socket.emit('getRooms');

  socket.on('rooms', rooms => {
    let friendNav = document.getElementById('friend-nav');
    while (friendNav.firstChild) {
      friendNav.removeChild(friendNav.firstChild);
    }
    rooms.forEach(f => {
      let li = document.createElement('li');
      li.classList.add('friend-item');
      let childLi = document.createElement('li');
      let img = document.createElement('img');
      img.src = './../icons/phone-call.png';
      img.onclick = call();
      childLi.innerHTML = f.room_name;
      li.appendChild(childLi);
      li.appendChild(img);
      friendNav.appendChild(li);
    });
    console.log(rooms);
  });

  socket.on('createRoom', url => {
    location.href = url;
  });

  // chrome.storage.sync.get('id', data => {
  //   id = data.id;
  //   getFriends();
  // });

  document.getElementById('addBtn').addEventListener('click', () => {
    let roomName = prompt('방 제목을 입력해주세요');
    socket.emit('createRoom', roomName);
  });
};

getFriends = () => {
  axios
    .get(`http://localhost:8080/friends/${id}`)
    .then(res => {
      let data = res.data;
      let friendNav = document.getElementById('friend-nav');
      while (friendNav.firstChild) {
        friendNav.removeChild(friendNav.firstChild);
      }
      data.forEach(f => {
        let li = document.createElement('li');
        li.classList.add('friend-item');
        let childLi = document.createElement('li');
        let img = document.createElement('img');
        img.src = './../icons/phone-call.png';
        img.onclick = call();
        childLi.innerHTML = f.user_name;
        li.appendChild(childLi);
        li.appendChild(img);
        friendNav.appendChild(li);
      });
      console.log(res);
    })
    .catch(err => {
      console.error(err);
    });
};

call = () => {
  // location.href = './../call.html';
};
