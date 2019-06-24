navigator.webkitGetUserMedia(
  { audio: true },
  s => {
    console.log('s');
  },
  err => {
    console.log('error');
  }
);
