const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
app.use(express.json());

let db;
const dbPath = path.join(__dirname, "moviesData.db");

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server has been started");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//Get All Movies API
app.get("/movies/", async (req, res) => {
  const getMoviesQuery = `
        SELECT movie_name FROM movie
    `;
  const movies = await db.all(getMoviesQuery);
  res.send(
    movies.map((each) => {
      return {
        movieName: each.movie_name,
      };
    })
  );
});

//Get Specific Movie Details API
app.get("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const getMovieDetails = `
        SELECT * FROM movie WHERE movie_id=${movieId}
    `;
  const movie = await db.get(getMovieDetails);
  res.send({
    movieId: movie.movie_id,
    directorId: movie.director_id,
    movieName: movie.movie_name,
    leadActor: movie.lead_actor,
  });
});

//Add New Movie to Movie Table
app.post("/movies/", async (req, res) => {
  const movieDetails = req.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
        INSERT INTO movie(director_id, movie_name, lead_actor)
        VALUES (
            ${directorId},
            '${movieName}',
            '${leadActor}'
        )
    `;
  const dbResponse = await db.run(addMovieQuery);
  res.send("Movie Successfully Added");
});

//Update A Movie Details API
app.put("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const { directorId, movieName, leadActor } = req.body;
  const updateMovieQuery = `
        UPDATE movie 
            SET 
                director_id = ${directorId},
                movie_name = '${movieName}',
                lead_actor = "${leadActor}"
            WHERE movie_id = ${movieId}
    `;
  const dbResponse = await db.run(updateMovieQuery);
  res.send("Movie Details Updated");
});

//Delete Movie API
app.delete("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const deleteMovieQuery = `
        DELETE FROM movie  WHERE movie_id = ${movieId}
    `;
  const dbResponse = await db.run(deleteMovieQuery);
  res.send("Movie Removed");
});

//Get Directors API
app.get("/directors/", async (req, res) => {
  const getDirectorsQuery = `
        SELECT * FROM director
    `;
  const directors = await db.all(getDirectorsQuery);
  res.send(
    directors.map((each) => {
      return {
        directorId: each.director_id,
        directorName: each.director_name,
      };
    })
  );
});

//Get Movie of one particular Director API
app.get("/directors/:directorId/movies/", async (req, res) => {
  const { directorId } = req.params;
  const getMoviesByDirectorQuery = `
        SELECT movie_name FROM movie INNER JOIN director
        ON movie.director_id = director.director_id
        WHERE director.director_id = ${directorId}

    `;
  const moviesList = await db.all(getMoviesByDirectorQuery);
  res.send(
    moviesList.map((each) => {
      return {
        movieName: each.movie_name,
      };
    })
  );
});

module.exports = app;
