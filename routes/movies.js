// Create the router object that will manage all operations on movies
const moviesRouter = require("express").Router();

// Import the movie model that we'll need in controller functions
const Movie = require("../models/movie");

// GET /api/movies/
moviesRouter.get("/", (req, res) => {
  const { max_duration, color } = req.query;

  Movie.findManyMovies({ filters: { max_duration, color } })
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error retrieving movies from database");
    });
});

// GET /api/movies/:id
moviesRouter.get("/:id", (req, res) => {
  const movieId = req.params.id;

  Movie.findOneMovie(movieId)
    .then((movie) => {
      if (movie) {
        res.json(movie);
      } else {
        res.status(404).send("Movie not found");
      }
    })
    .catch((err, result) => {
      console.log(err);
      res.status(500).send("Error retrieving movie from database");
    });
});

// POST /api/movies
moviesRouter.post("/", (req, res) => {
  const error = Movie.validate(req.body);
  if (error) {
    res.status(422).json({ validationErrors: error.details });
  } else {
    Movie.addMovie(req.body)
      .then((addedMovie) => {
        res.status(201).json(addedMovie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error saving the movie");
      });
  }
});

// PUT /api/movies
moviesRouter.put("/:id", (req, res) => {
  let existingMovie = null;
  let validationErrors = null;
  Movie.findOneMovie(req.params.id)
    .then((movie) => {
      existingMovie = movie;
      if (!existingMovie) return Promise.reject("RECORD_NOT_FOUND");
      validationErrors = Movie.validate(req.body, false);
      if (validationErrors) return Promise.reject("INVALID_DATA");
      return Movie.updateMovie(req.params.id, req.body);
    })
    .then(() => {
      res.status(200).json({ ...existingMovie, ...req.body });
    })
    .catch((err) => {
      console.error(err);
      if (err === "RECORD_NOT_FOUND")
        res.status(404).send(`Movie with id ${req.params.id} not found.`);
      else if (err === "INVALID_DATA")
        res.status(422).json({ validationErrors: validationErrors.details });
      else res.status(500).send("Error updating a movie.");
    });
});

// DELETE /api/movies
moviesRouter.delete("/:id", (req, res) => {
  Movie.deleteMovie(req.params.id)
    .then((deleted) => {
      if (deleted) res.status(200).send("Movie deleted!");
      else res.status(404).send("Movie not found");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error deleting a movie");
    });
});

module.exports = moviesRouter;
