const axios = require('axios');
let id;

window.onload = () => {
  chrome.storage.sync.get('id', data => {
    id = data.id;
    getFriends();
  });

  document.getElementById('addBtn').addEventListener('click', () => {
    let friendId = prompt('아이디를 입력해주세요.');
    let req = {
      userId: id,
      friendId: friendId
    };
    axios.post('http://localhost:8080/friends', req).then(res => {
      if (res.status === 200) {
        alert('친구 추가 완료!');
        getFriends();
      }
    });
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
