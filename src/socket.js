'use strict';

const { sanitizeString, sanitizeRawString, truncate } = require('./validation');
const { MAX_NAME_LENGTH, MAX_CHAT_MESSAGE_LENGTH } = require('./config');

// ======================================================
// SOCKET HANDLERS
//
// Única camada que conhece Socket.IO. Toda regra de negócio
// de salas fica em RoomsService; aqui só traduzimos eventos
// de entrada em chamadas ao serviço e eventos de saída.
// ======================================================

function registerSocketHandlers(io, roomsService) {
  function broadcastRooms() {
    io.emit('rooms', roomsService.list());
  }

  function leaveCurrentRoom(socket) {
    const room = socket.data.room;
    const result = roomsService.leave(room, socket.id);

    socket.data.room = null;
    socket.data.name = null;

    if (!result) {
      return;
    }

    socket.to(result.room).emit('user-left', { id: socket.id });
    socket.leave(result.room);

    console.log(`[leave] ${socket.id} saiu de "${result.room}"`);

    broadcastRooms();
  }

  io.on('connection', (socket) => {
    console.log(`[connect] ${socket.id}`);

    // ==================================================
    // LISTA DE SALAS
    // ==================================================

    socket.emit('rooms', roomsService.list());

    socket.on('get-rooms', () => {
      socket.emit('rooms', roomsService.list());
    });

    // ==================================================
    // CRIAR SALA
    // ==================================================

    socket.on('create-room', ({ room, name, maxUsers, password } = {}) => {
      room = sanitizeString(room);
      name = sanitizeString(name);
      password = sanitizeRawString(password);

      const result = roomsService.create({
        room,
        name,
        socketId: socket.id,
        maxUsers,
        password
      });

      if (!result.ok) {
        socket.emit('room-error', result.error);
        return;
      }

      socket.join(room);

      socket.data.room = room;
      socket.data.name = name;

      socket.emit('room-created', {
        room,
        name,
        maxUsers: result.maxUsers
      });

      socket.emit('room-users', {
        users: [],
        maxUsers: result.maxUsers
      });

      console.log(
        `[create] ${socket.id} (${name}) criou "${room}"` + (password ? ` pass: ${password}` : '')
      );

      broadcastRooms();
    });

    // ==================================================
    // ENTRAR NA SALA
    // ==================================================

    socket.on('join-room', ({ room, name, password } = {}) => {
      room = sanitizeString(room);
      name = sanitizeString(name);
      password = sanitizeRawString(password);

      const result = roomsService.join({
        room,
        name,
        socketId: socket.id,
        password,
        maxNameLength: MAX_NAME_LENGTH
      });

      if (!result.ok) {
        if (result.reason === 'password-required') {
          socket.emit('password-required', { room });
          return;
        }

        socket.emit('room-error', result.error);
        return;
      }

      socket.join(room);

      socket.data.room = room;
      socket.data.name = name;

      // Envia os usuários existentes E o limite real da sala para
      // quem entrou (sem isso o cliente fica com o padrão de 3).
      socket.emit('room-users', {
        users: result.existingUsers,
        maxUsers: result.maxUsers
      });

      // Avisa os outros usuários da sala.
      socket.to(room).emit('user-joined', { id: socket.id, name });

      console.log(`[join] ${socket.id} (${name}) entrou em "${room}"`);

      broadcastRooms();
    });

    // ==================================================
    // SIGNAL WEBRTC
    // ==================================================

    socket.on('signal', ({ to, data } = {}) => {
      if (!to || !data) {
        return;
      }

      io.to(to).emit('signal', { from: socket.id, data });
    });

    // ==================================================
    // INFO DE MÍDIA (qual stream é webcam e se está ligada)
    //
    // O cliente manda o id do MediaStream que usa para a
    // câmera. Sem isso o outro lado não tem como saber se a
    // track de vídeo que chegou é tela ou webcam.
    // ==================================================

    socket.on('media-info', ({ to, cameraStreamId, cameraOn } = {}) => {
      const room = socket.data.room;

      if (!room) {
        return;
      }

      const payload = {
        from: socket.id,
        cameraStreamId: typeof cameraStreamId === 'string' ? cameraStreamId : null,
        cameraOn: Boolean(cameraOn)
      };

      if (to) {
        io.to(to).emit('media-info', payload);
      } else {
        socket.to(room).emit('media-info', payload);
      }
    });

    // ==================================================
    // CHAT
    // ==================================================

    socket.on('chat-message', ({ text } = {}) => {
      const room = socket.data.room;
      const name = socket.data.name;

      if (!room || !name) {
        return;
      }

      text = truncate(sanitizeString(text), MAX_CHAT_MESSAGE_LENGTH);

      if (!text) {
        return;
      }

      io.to(room).emit('chat-message', {
        id: socket.id,
        name,
        text,
        time: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      });
    });

    // ==================================================
    // SAIR DA SALA / DESCONECTAR
    // ==================================================

    socket.on('leave-room', () => leaveCurrentRoom(socket));
    socket.on('disconnect', () => leaveCurrentRoom(socket));
  });
}

module.exports = registerSocketHandlers;
