const axios = require('axios');
let userId;

window.onload = () => {
  chrome.storage.sync.get('userId', data => {
    userId = data.userId;
    let req = {
      uesrId: data.userId
    };
    axios
      .get(`http://localhost:8080/friends/${data.userId}`)
      .then(res => {
        console.log(res);
        console.log(req);
      })
      .catch(err => {
        console.error(err);
      });
    // axios.get('http://localhost:8080/friends', data.userId), () => {
    //   console.log(res);
    // });
  });

  document.getElementById('addBtn').addEventListener('click', () => {
    let id = prompt('아이디를 입력해주세요.');
    let req = {
      userId: userId,
      friend: id
    };
    axios.post('http://localhost:8080/friends', req).then(res => {
      console.log(res);
    });
    // axios.post('http://localhost:8080/friends', req, res => {
    //   console.log(res);
    // });
  });

  add = () => {
    // let id = prompt('아이디를 입력해주세요.');
  };
};
