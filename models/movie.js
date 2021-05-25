const connection = require("../db-config");
const Joi = require("joi");
const db = connection.promise();

const validate = (data, forCreation = true) => {
  const presence = forCreation ? "required" : "optional";
  return Joi.object({
    title: Joi.string().max(255).presence(presence),
    director: Joi.string().max(255).presence(presence),
    year: Joi.number().integer().min(1888).presence(presence),
    color: Joi.boolean().presence(presence),
    duration: Joi.number().integer().min(1).presence(presence),
  }).validate(data, { abortEarly: false }).error;
};

const findManyMovies = ({ filters: { color, max_duration } }) => {
  let sql = "SELECT * FROM movies";
  const sqlValues = [];

  if (color) {
    sql += " WHERE color = ?";
    sqlValues.push(color);
  }

  if (max_duration) {
    if (color) sql += " AND duration <= ? ;";
    else sql += " WHERE duration <= ?";
    sqlValues.push(max_duration);
  }

  return db.query(sql, sqlValues).then(([results]) => results);
};

const findOneMovie = (movieId) => {
  let sql = "SELECT * FROM movies WHERE id = ?";
  return db.query(sql, movieId).then(([results]) => results[0]);
};

const addMovie = ({ title, director, year, color, duration }) => {
  let sql =
    "INSERT INTO movies (title, director, year, color, duration) VALUES (?, ?, ?, ?, ?)";

  return db
    .query(sql, [title, director, year, color, duration])
    .then(([result]) => {
      const id = result.insertId;
      return { id, title, director, year, color, duration };
    });
};

const updateMovie = (movieId, newData) => {
  let sql = "UPDATE movies SET ? WHERE id = ?";
  return db.query(sql, [newData, movieId]);
};

const deleteMovie = (movieId) => {
  return db
    .query("DELETE FROM movies WHERE id = ?", [movieId])
    .then(([result]) => result.affectedRows !== 0);
};

module.exports = {
  findManyMovies,
  findOneMovie,
  addMovie,
  validate,
  updateMovie,
  deleteMovie,
};
