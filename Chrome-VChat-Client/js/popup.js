const axios = require('axios');

window.onload = () => {
  let id = document.getElementById('id');
  let password = document.getElementById('password');
  let loginBtn = document.getElementById('loginBtn');

  loginBtn.addEventListener('click', e => {
    let req = {
      id: id.value,
      password: password.value
    };

    axios
      .post('http://localhost:8080/login', req)
      .then(function(res) {
        console.log(res);
        // handle success
        if (res.status === 200) {
          alert('로그인 성공!');
          chrome.storage.sync.set({ id: res.data.id }, function() {
            console.log(`ID : ${res.data.id}`);
          });
          location.href = 'main.html';
        } else if (res.status === 400) {
          alert('로그인 실패!');
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  });
};
