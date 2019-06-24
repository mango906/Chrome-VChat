const axios = require('axios');

window.onload = () => {
  let id = document.getElementById('id');
  let password = document.getElementById('password');
  let name = document.getElementById('name');
  let desc = document.getElementById('desc');
  let registerBtn = document.getElementById('registerBtn');

  registerBtn.addEventListener('click', e => {
    let req = {
      id: id.value,
      password: password.value,
      name: name.value,
      desc: desc.value
    };
    axios
      .post('http://10.80.163.214:8080/member', req)
      .then(function(res) {
        if (res.status == 200) {
          alert('회원가입 성공!');
          location.href = 'popup.html';
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  });
};
