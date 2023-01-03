const bcrypt = require('bcrypt');
const { generateError } = require('../helpers');
const { getConnection } = require('./db');

//Crea un usuario en la BD y devuelve su id
const createUser = async (user_name, email, password) => {
  let connection;

  try {
    connection = await getConnection();
    //Comprobar que no exista otro usuario con ese email
    const [user] = await connection.query(
      `
      SELECT id FROM users WHERE email = ?
    `,
      [email]
    );

    if (user.length > 0) {
      throw generateError(
        'Ya existe un usario en la base de datos con ese email',
        409
      );
    }

    const [user_nick] = await connection.query(
      `
      SELECT id FROM users WHERE user_name = ?
    `,
      [user_name]
    );

    if (user_nick.length > 0) {
      throw generateError(
        'Ya existe un usario en la base de datos con ese nickname',
        409
      );
    }

    //Encriptar la password
    const passwordHash = await bcrypt.hash(password, 8);
    //Crear el usuario
    const [newUser] = await connection.query(
      `
    INSERT INTO users (user_name, email, password) VALUES(?, ?, ?)
    `,
      [user_name, email, passwordHash]
    );
    //Devolver la id
    return newUser.insertId;
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  createUser,
};
