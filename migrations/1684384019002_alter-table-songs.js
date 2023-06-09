exports.up = (pgm) => {
  pgm.addConstraint(
    'songs',
    'fk_songs.album_id_albums.id',
    'FOREIGN KEY("albumId") REFERENCES albums(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint(
    'songs',
    'fk_songs.album_id_albums.id',
  );
};
