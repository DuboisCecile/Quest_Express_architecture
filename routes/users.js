// Create the router object that will manage all operations on users
const usersRouter = require("express").Router();

// Import the user model that we'll need in controller functions
const User = require("../models/user");

// GET /api/users/
usersRouter.get("/", (req, res) => {
  const { language } = req.query;

  User.findManyUsers({ filters: { language } })
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error retrieving users from database");
    });
});

// GET /api/users/:id
usersRouter.get("/:id", (req, res) => {
  const userId = req.params.id;

  User.findOneUser(userId)
    .then((user) => {
      if (user) {
        res.json(user);
      } else {
        res.status(404).send("user not found");
      }
    })
    .catch((err, result) => {
      console.log(err);
      res.status(500).send("Error retrieving user from database");
    });
});

// POST /api/users
usersRouter.post("/", (req, res) => {
  const error = User.validate(req.body);
  if (error) {
    res.status(422).json({ validationErrors: error.details });
  } else {
    User.addUser(req.body)
      .then((addedUser) => {
        res.status(201).json(addedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error saving the user");
      });
  }
});

// PUT /api/users
usersRouter.put("/:id", (req, res) => {
  let existingUser = null;
  let validationErrors = null;
  User.findOneUser(req.params.id)
    .then((user) => {
      existingUser = user;
      if (!existingUser) return Promise.reject("RECORD_NOT_FOUND");
      validationErrors = User.validate(req.body, false);
      if (validationErrors) return Promise.reject("INVALID_DATA");
      return User.updateUser(req.params.id, req.body);
    })
    .then(() => {
      res.status(200).json({ ...existingUser, ...req.body });
    })
    .catch((err) => {
      console.error(err);
      if (err === "RECORD_NOT_FOUND")
        res.status(404).send(`user with id ${req.params.id} not found.`);
      else if (err === "INVALID_DATA")
        res.status(422).json({ validationErrors: validationErrors.details });
      else res.status(500).send("Error updating a user.");
    });
});

// DELETE /api/users
usersRouter.delete("/:id", (req, res) => {
  User.deleteUser(req.params.id)
    .then((deleted) => {
      if (deleted) res.status(200).send("user deleted!");
      else res.status(404).send("user not found");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error deleting a user");
    });
});
module.exports = usersRouter;
