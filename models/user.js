const connection = require("../db-config");
const Joi = require("joi");
const { optional } = require("joi");
const db = connection.promise();

const validate = (data, forCreation = true) => {
  const presence = forCreation ? "required" : "optional";
  return Joi.object({
    email: Joi.string().email().max(255).presence(presence),
    firstname: Joi.string().max(255).presence(presence),
    lastname: Joi.string().max(255).presence(presence),
    city: Joi.string().allow(null, "").max(255).presence("optional"),
    language: Joi.string().allow(null, "").max(255).presence("optional"),
  }).validate(data, { abortEarly: false }).error;
};

const findManyUsers = ({ filters: { language } }) => {
  let sql = "SELECT * FROM users";
  const sqlValues = [];

  if (language) {
    sql += " WHERE language = ?";
    sqlValues.push(language);
  }

  return db.query(sql, sqlValues).then(([results]) => results);
};

const findOneUser = (userId) => {
  let sql = "SELECT * FROM users WHERE id = ?";
  return db.query(sql, userId).then(([results]) => results[0]);
};

const addUser = ({ firstname, lastname, email, city, language }) => {
  let sql =
    "INSERT INTO users (firstname, lastname, email, city, language) VALUES (?, ?, ?, ?, ?)";

  return db
    .query(sql, [firstname, lastname, email, city, language])
    .then(([result]) => {
      const id = result.insertId;
      return { id, firstname, lastname, email, city, language };
    });
};

const updateUser = (userId, newData) => {
  let sql = "UPDATE users SET ? WHERE id = ?";
  return db.query(sql, [newData, userId]);
};

const deleteUser = (userId) => {
  return db
    .query("DELETE FROM users WHERE id = ?", [userId])
    .then(([result]) => result.affectedRows !== 0);
};

module.exports = {
  findManyUsers,
  findOneUser,
  addUser,
  validate,
  updateUser,
  deleteUser,
};
