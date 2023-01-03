const { getConnection } = require('../db/db');
const joi = require('joi');
const { generateError } = require('../helpers');

let connection;
const getNews = async (req, res) => {
  connection = await getConnection();
  try {
    const news = await connection.query(`SELECT * FROM news;`);
    console.log(news);
    res.send([news[0]]);
  } catch (error) {
    console.log(error);
    res.status(500).send;
  } finally {
    connection.release();
  }
};

const createNew = async (req, res) => {
  //TODO: Se necesita el user id para no meterlo a mano, tendra que pasarlo el meddlewere que comprueba que
  //esta autenticado

  const title = req.body.title;
  const header = req.body.header;
  const body = req.body.body;
  const user_id = req.body.user_id;
  const date = req.body.date;
  const image = req.body.image;
  console.log('Log en createNew', user_id);
  const schema = joi.object().keys({
    title: joi.string().max(150).required(),
    header: joi.string().max(250).required(),
    body: joi.string().required(),
    user_id: joi.required(),
    date: joi.date(),
    image: joi.string(),
  });

  const validation = await schema.validateAsync({
    title,
    header,
    body,
    user_id,
    date,
    image,
  });

  if (validation.error) {
    res.status(500).send('test');
  }
  try {
    let connection = await getConnection();

    await connection.query(
      `
      INSERT INTO news(title, image, header, body,user_id, date )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [title, image, header, body, user_id, date]
    );
  } catch (err) {
    throw generateError('Error en la base de datos', 500);
  } finally {
    connection.release();
    res.status(201).send();
  }
};

module.exports = {
  getNews,
  createNew,
};