'use strict';

const crypto = require('crypto');
const { clampRoomSize } = require('./validation');

// ======================================================
// ROOMS SERVICE
//
// Dono de todo o estado de salas do servidor. Não sabe nada
// sobre Socket.IO: recebe ids/nomes/senhas já sanitizados e
// devolve resultados ({ ok, ... } ou dados prontos pra UI),
// deixando quem chama decidir o que emitir e para quem.
// ======================================================

class RoomsService {
  constructor() {
    // roomName -> { members: Map<socketId, {id, name}>, maxUsers, passwordHash }
    this.rooms = new Map();
  }

  static hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  /** Lista de salas em formato pronto para enviar ao cliente. */
  list() {
    return Array.from(this.rooms.entries()).map(([name, roomData]) => ({
      name,
      count: roomData.members.size,
      maxUsers: roomData.maxUsers,
      hasPassword: Boolean(roomData.passwordHash),
      users: Array.from(roomData.members.values()).map((user) => ({
        id: user.id,
        name: user.name
      }))
    }));
  }

  has(room) {
    return this.rooms.has(room);
  }

  get(room) {
    return this.rooms.get(room);
  }

  /**
   * Cria uma sala nova com o criador já como primeiro membro.
   * Retorna { ok: true } ou { ok: false, error }.
   */
  create({ room, name, socketId, maxUsers, password }) {
    if (!room || !name) {
      return { ok: false, error: 'Nome da sala e nome do usuário são obrigatórios.' };
    }

    if (this.rooms.has(room)) {
      return { ok: false, error: 'Essa sala já existe.' };
    }

    const members = new Map();
    members.set(socketId, { id: socketId, name });

    const finalMaxUsers = clampRoomSize(maxUsers);

    this.rooms.set(room, {
      members,
      maxUsers: finalMaxUsers,
      passwordHash: password ? RoomsService.hashPassword(password) : null
    });

    return {
      ok: true,
      maxUsers: finalMaxUsers
    };
    
  }

  /**
   * Tenta adicionar um membro a uma sala existente, validando
   * nome, senha e lotação.
   * Retorna:
   *  - { ok: true, existingUsers, maxUsers }
   *  - { ok: false, reason: 'not-found' | 'name-too-long' | 'password-required' | 'wrong-password' | 'full', error? }
   */
  join({ room, name, socketId, password, maxNameLength }) {
    if (!room || !name) {
      return { ok: false, reason: 'invalid', error: 'Nome da sala e nome do usuário são obrigatórios.' };
    }

    const roomData = this.rooms.get(room);

    if (!roomData) {
      return { ok: false, reason: 'not-found', error: 'Essa sala não existe.' };
    }

    if (name.length > maxNameLength) {
      return {
        ok: false,
        reason: 'name-too-long',
        error: `O nome deve ter no máximo ${maxNameLength} caracteres.`
      };
    }

    if (roomData.passwordHash) {
      if (!password) {
        return { ok: false, reason: 'password-required' };
      }

      if (RoomsService.hashPassword(password) !== roomData.passwordHash) {
        return { ok: false, reason: 'wrong-password', error: 'Senha incorreta.' };
      }
    }

    if (roomData.members.size >= roomData.maxUsers) {
      return {
        ok: false,
        reason: 'full',
        error: `Essa sala já está cheia (${roomData.maxUsers}/${roomData.maxUsers}).`
      };
    }

    const existingUsers = Array.from(roomData.members.values());

    roomData.members.set(socketId, { id: socketId, name });

    return { ok: true, existingUsers, maxUsers: roomData.maxUsers };
  }

  /**
   * Remove um socket de qualquer sala em que esteja.
   * Retorna { room, roomDeleted } ou null se ele não estava em nenhuma sala.
   */
  leave(room, socketId) {
    if (!room) {
      return null;
    }

    const roomData = this.rooms.get(room);

    if (!roomData) {
      return null;
    }

    roomData.members.delete(socketId);

    const roomDeleted = roomData.members.size === 0;

    if (roomDeleted) {
      this.rooms.delete(room);
    }

    return { room, roomDeleted };
  }
}

module.exports = RoomsService;
