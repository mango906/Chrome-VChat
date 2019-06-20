/**************/
/*** CONFIG ***/
/**************/
var PORT = 8080;

/*************/
/*** SETUP ***/
/*************/
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var main = express();
var server = http.createServer(main);
var io = require('socket.io').listen(server);
var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  port: 3306,
  database: 'azar'
});
var clients = [];
var rooms = [];
var room_idx = 0;
let socketRooms = [];
//io.set('log level', 2);

server.listen(PORT, null, function() {
  console.log('Listening on port ' + PORT);
});
//main.use(express.bodyParser());

connection.connect();

connection.query('SELECT * from User', function(err, rows, fields) {
  if (!err) console.log('started');
  else console.log('Error while performing Query.', err);
});

main.use(bodyParser.urlencoded());
main.use(bodyParser.json());
main.use(express.static('./../Chrome-VChat-Client'));

// main.get('/', function(req, res) {
//   res.send(__dirname + '/../Chrome-VChat-Client/popup.html');
//   // res.sendFile(__dirname + '/../Chrome-VChat-Client/popup.html');
// });

main.post('/login', (req, res) => {
  let data = req.body;
  let sql = 'SELECT * from user WHERE user_id=? AND user_pw=?';
  let params = [data.id, data.password];

  try {
    connection.query(sql, params, (err, result) => {
      if (err) console.log(err);
      if (result.length == 0) {
        res.status(400).send();
        return;
      } else {
        res.status(200).json(result[0]);
      }
    });
  } catch (err) {
    console.error(err);
  }
});

main.post('/member', (req, res) => {
  let data = req.body;
  let sql = 'INSERT INTO user (user_id, user_pw, user_name, user_desc) VALUES(?, ?, ?, ?)';
  let params = [data.id, data.password, data.name, data.desc];
  console.log(sql);
  try {
    connection.query(sql, params, function(err, result) {
      if (err) {
        res.status(400).send();
        return;
      }
      res.status(200).send();
    });
  } catch (err) {
    console.error(err);
  }
});

main.get('/friends/:userId', (req, res) => {
  let data = req.params;
  let sql =
    'select user.id, user.user_name from friends join user on user.id = friends.friend_id WHERE friends.user_id=?';
  let params = [data.userId];
  console.log('params', params);
  console.log('data', data);
  try {
    connection.query(sql, params, (err, result) => {
      if (err) console.log(err);
      // if (result.length == 0) {
      //   res.status(400).send();
      //   return;
      // } else {
      res.status(200).json(result);
      // }
    });
  } catch (err) {
    console.error(err);
  }
});

main.post('/friends', (req, res) => {
  let data = req.body;
  let select_sql = 'SELECT id from user WHERE user_id=?';
  let select_params = [data.friendId];
  console.log('data: ', data);
  // let sql = 'INSERT INTO friends (user_id, friend_id) VALUES(?, ?)';
  // let params = [data.userId, data.friend];
  try {
    connection.query(select_sql, select_params, (err, result) => {
      if (err) {
        res.status(400).send();
        return;
      }
      console.log('result', result);
      let insert_sql = 'INSERT INTO friends (user_id, friend_id) values(?, ?)';
      let insert_params = [data.userId, result[0].id];
      try {
        connection.query(insert_sql, insert_params, (err, result) => {
          if (err) {
            res.status(400).send();
            return;
          } else {
            res.status(200).send();
          }
        });
      } catch (err) {
        console.error(err);
      }
      // console.log('result :', result);
      // res.status(200).send(result);
    });
  } catch (err) {
    console.error(err);
  }
});

// main.get('/index.html', function(req, res){ res.sendfile('newclient.html'); });
// main.get('/client.html', function(req, res){ res.sendfile('newclient.html'); });

/*************************/
/*** INTERESTING STUFF ***/
/*************************/
var channels = {};
var sockets = {};

/**
 * Users will connect to the signaling server, after which they'll issue a "join"
 * to join a particular channel. The signaling server keeps track of all sockets
 * who are in a channel, and on join will send out 'addPeer' events to each pair
 * of users in a channel. When clients receive the 'addPeer' even they'll begin
 * setting up an RTCPeerConnection with one another. During this process they'll
 * need to relay ICECandidate information to one another, as well as SessionDescription
 * information. After all of that happens, they'll finally be able to complete
 * the peer connection and will be streaming audio/video between eachother.
 */
io.sockets.on('connection', socket => {
  socket.channels = {};
  sockets[socket.id] = socket;

  socketRooms = io.sockets.adapter.rooms;

  socket.emit('rooms', rooms);

  socket.on('conn', data => {
    let obj = {
      name: data,
      id: socket.id
    };
    clients.push(obj);
  });

  socket.on('createRoom', roomName => {
    let socketRooms = io.sockets.adapter.rooms;
    let data = {
      room_idx: room_idx,
      room_name: roomName
    };
    // rooms.push(data);
    socket.emit('redirectRoom', `call.html?room_idx=${room_idx}`);
    room_idx++;
    Object.keys(socketRooms).map(key => {
      console.log('sockets', socketRooms[key].sockets);
    });
    io.emit('rooms', rooms);
    console.log('room created');
    console.log('rooms', rooms);
    console.log('room detail', io.sockets.adapter.rooms);
  });

  socket.on('joinRoom', room_idx => {
    socket.emit('redirectRoom', `call.html?room_idx=${room_idx}`);
  });

  socket.on('participate', data => {
    console.log('test', data);
    socket.room_idx = data.room_idx;
    console.log('room_idx', socket.room_idx);
    socket.join(data.room_idx);

    // First Room

    if (rooms.length === 0) {
      let newRoom = {
        id: socket.room_idx,
        name: data.room_name,
        detail: Object.values(socketRooms[0])[0]
      };
      rooms.push(newRoom);
      io.emit('rooms', rooms);

      console.log('key', Object.keys(newRoom.detail));

      io.to(socket.room_idx).emit('roomInfo', newRoom.detail);
      return;
    }

    // Join Room

    const idx = rooms.findIndex(findIdx);

    if (idx !== -1) {
      io.to(socket.room_idx).emit('roomInfo', rooms[idx].detail);
      return;
    }
    // const idx = rooms.filter(room => room.id === data.room_idx);

    // Create Room

    // rooms.forEach((room, i) => {
    //   let roomMaster = Object.keys(room.detail)[0];
    //   if (socket.id !== roomMaster) {
    //     let newRoom = {
    //       id: socket.room_idx,
    //       detail: Object.values(socketRooms[idx])[0]
    //     };
    //     rooms.push(newRoom);
    //     io.emit('rooms', rooms);
    //     return;
    //   }
    // });

    // Join Room
  });

  socket.on('disconnect', function() {
    let idx;

    for (var channel in socket.channels) {
      part(channel);
    }
    // console.log('[' + socket.id + '] disconnected');
    delete sockets[socket.id];
    if (socket.room_idx === undefined) {
      console.log('no Room');
      return;
    }

    rooms.forEach((room, i) => {
      if (Object.values(room)[0] === socket.room_idx) {
        idx = i;
      }
    });

    if (Object.keys(rooms[idx].detail)[0] === undefined) {
      rooms.splice(idx, 1);
      io.emit('rooms', rooms);
    }

    console.log(socket.room_idx);
  });

  socket.on('join', function(config) {
    console.log('[' + socket.id + '] join ', config);
    var channel = config.channel;
    var userdata = config.userdata;

    if (channel in socket.channels) {
      console.log('[' + socket.id + '] ERROR: already joined ', channel);
      return;
    }

    if (!(channel in channels)) {
      channels[channel] = {};
    }

    for (id in channels[channel]) {
      channels[channel][id].emit('addPeer', { peer_id: socket.id, should_create_offer: false });
      socket.emit('addPeer', { peer_id: id, should_create_offer: true });
    }

    channels[channel][socket.id] = socket;
    socket.channels[channel] = channel;
  });

  findIdx = e => {
    console.log(e);
    return e.id === socket.room_idx;
  };

  function part(channel) {
    console.log('[' + socket.id + '] part ');

    if (!(channel in socket.channels)) {
      console.log('[' + socket.id + '] ERROR: not in ', channel);
      return;
    }

    delete socket.channels[channel];
    delete channels[channel][socket.id];

    for (id in channels[channel]) {
      channels[channel][id].emit('removePeer', { peer_id: socket.id });
      socket.emit('removePeer', { peer_id: id });
    }
  }
  socket.on('part', part);

  socket.on('relayICECandidate', function(config) {
    var peer_id = config.peer_id;
    var ice_candidate = config.ice_candidate;
    console.log('[' + socket.id + '] relaying ICE candidate to [' + peer_id + '] ', ice_candidate);

    if (peer_id in sockets) {
      sockets[peer_id].emit('iceCandidate', { peer_id: socket.id, ice_candidate: ice_candidate });
    }
  });

  socket.on('relaySessionDescription', function(config) {
    var peer_id = config.peer_id;
    var session_description = config.session_description;
    console.log(
      '[' + socket.id + '] relaying session description to [' + peer_id + '] ',
      session_description
    );

    if (peer_id in sockets) {
      sockets[peer_id].emit('sessionDescription', {
        peer_id: socket.id,
        session_description: session_description
      });
    }
  });
});
