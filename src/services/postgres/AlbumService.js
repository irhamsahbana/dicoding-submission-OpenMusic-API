const { nanoid } = require('nanoid');
const { Pool } = require('pg');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

const { mapAlbumSongs } = require('../../utils');

class AlbumService {
  constructor() {
    this._pool = new Pool();
  }

  async getAlbums() {
    const result = await this._pool.query(`
      SELECT * FROM albums JOIN songs ON albums.id = songs."albumId"
    `);

    return mapAlbumSongs(result.rows);
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) throw new InvariantError('Album gagal ditambahkan');

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: `
      SELECT albums.*, songs.id as "songId", songs.title, songs.performer
      FROM albums
      LEFT JOIN songs ON songs."albumId" = albums.id
      WHERE albums.id = $1`,
      values: [id],
    };

    let result = await this._pool.query(query);

    if (!result.rowCount) throw new NotFoundError('Album tidak ditemukan');

    result = mapAlbumSongs(result.rows);

    return result;
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');

    return result.rows[0].id;
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new NotFoundError('Album gagal diperbarui. Id tidak ditemukan');

    return result.rows[0].id;
  }
}

module.exports = AlbumService;
