const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
var mysql = require('mysql');

const app = express();

//create connection to mysql db
try {
  var con = mysql.createConnection({
    host: "qzkp8ry756433yd4.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "uoz4qxsooap10l9c",
    password: "ivq70bw6vnhss8e1",
    database: "ojb6fb1yyvuaj3a8"
  });
} catch (err) {
  console.log(err);
  res.send("Error " + err);
}

//connect to mysql db
con.connect(err => {
  if (err) throw err;
  console.log("Connected!");

  app.use(express.static(path.join(__dirname, 'public')));

  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');


  function getData(callback) {
    con.query("SELECT * FROM rooms", (err, result) => {
      if (err) throw err;
      let rooms = result;

      con.query("SELECT * FROM teams", (err, result) => {
        if (err) throw err;
        let teams = result;

        callback(rooms, teams);

      });
    });
  }


  app.get('/', (req, res) => {
    getData(function (rooms, teams) {
      res.render('pages/index', { rooms: rooms, teams: teams });
    });
  });


  app.get('/admin', (req, res) => {
    getData(function (rooms, teams) {
      res.render('pages/admin', { rooms: rooms, teams: teams });
    });
  });


  app.get('/signup', (req, res) => {
    res.render('pages/signup', {});
  });

  app.get('/team-submit', (req, res) => {
    //check if the name is already taken
    con.query("SELECT * FROM teams", (err, result) => {
      if (err) throw err;
      var teams = result;

      let exists = false;
      for (let i = 0; i < teams.length; i++) {
        if (teams[i].name === req.query.teamName) {
          exists = true;
        }
      };

      if (exists) {
        res.render('pages/signupError');
      } else {
        //add to sql db
        con.query("INSERT INTO teams (name) VALUES ('" + req.query.teamName + "')", (err, result) => {
          if (err) throw err;
          //render signup landing page
          res.render('pages/teamSubmit', { teamName: req.query.teamName });
        });
      }
    });
  });

  app.get('/teamEdit', (req, res) => {
    con.query("SELECT * FROM teams WHERE id=" + req.query.id, (err, result) => {
      if (err) throw err;
      var team = result[0];

      res.render('pages/teamEdit', { team: team });
    });

  });

  app.get('/roomEdit', (req, res) => {
    getData(function (rooms, teams) {
      con.query("SELECT * FROM rooms WHERE id=" + req.query.id, (err, result) => {
        if (err) throw err;
        var thisRoom = result[0];

        res.render('pages/roomEdit', { room: thisRoom, teams: teams });
      });
    });
  });

  app.get('/teamUpdate', (req, res) => {
    con.query("UPDATE teams SET name = '" + req.query.teamName + "' WHERE id=" + req.query.id, (err, result) => {
      if (err) throw err;
      res.redirect('/admin');
    });
  });

  app.get('/addRoom', (req, res) => {
    getData(function (rooms, teams) {
      console.log(teams);
      res.render('pages/addRoom', { teams: teams });
    });
  });

  app.get('/roomInsert', (req, res) => {
    con.query("SELECT * FROM rooms", (err, result) => {
      if (err) throw err;
      var rooms = result;

      let exists = false;
      for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].roomName === req.query.roomName) {
          exists = true;
        }
      };

      if (exists) {
        res.render('pages/roomAddError');
      } else {
        //add to sql db
        con.query(`INSERT INTO rooms (roomName, time, name) VALUES ('${req.query.roomName}', '${req.query.time}', '${req.query.name}')`, (err, result) => {
          if (err) throw err;
          //render signup landing page
          res.redirect('/admin');
        });
      }
    });
  });

  app.get('/roomUpdate', (req, res) => {
    getData(function (rooms, teams) {
      let teamID = teams.find(team => team.name === req.query.teamName).id;

      let query = `UPDATE rooms SET roomName = '${req.query.roomName}', time = '${req.query.time}', team = '${teamID}' WHERE id = '${req.query.id}'`;

      con.query(query, (err, result) => {
        if (err) throw err;
        res.redirect('/admin');
      });
    });

  });

  app.listen(PORT, () => console.log(`Listening on ${PORT}`));
});
  //sql connection closed
