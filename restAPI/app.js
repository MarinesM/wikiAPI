//Dependencias
const rp = require('request-promise')
var request = require('request')
const express = require('express')
const app = express()
const morgan = require('morgan')
const mysql = require('mysql')

//logs de requests
app.use(morgan('short'))


app.get('/articles/:topic&:userId', (req, res) => {
  console.log("Fetching articles of topic: " + req.params.topic)

  const connection = mysql.createConnection({
    host: 'mysql-datos-2.cyufope5fgiy.us-east-1.rds.amazonaws.com',
    port: 3306,
    user: 'root',
    password: 'root1234',
    database: 'MySQL_Datos_2'
  })

  const myTopic = req.params.topic
  const queryString = "SELECT topic, info_array FROM articulos WHERE topic = ?"
  connection.query(queryString, [myTopic], (err, rows, fields) => {
    if (err) {
      //go fetch from wikipedia
      console.log("Unable to retrieve from database: " + err)
      res.sendStatus(500)
      
    }

    //return info from db
    var topArticles = rows.map((row) => {
      return {"Topic": row.topic, "Top articles": row.info_array};
    })

    if (rows == 0) {
      console.log("Not found locally; fetching from wikipedia");
      var options={
        methode: 'GET',
        uri:'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + myTopic + '&limit=25&namespace=0&format=json',
        json:true
      };
    
      rp(options)
        .then(function(parseBody){
          topArticles = parseBody[1];
          //console.log(topArticles);
          res.json("[{Topic : " + myTopic + ", Top articles : " + topArticles + "}]");
        })
        .catch(function (err){
        }).finally(function(){
          var cleanArticles = topArticles.toString().replace("'","-");
          console.log(cleanArticles);
          console.log(cleanArticles);
          var sql = "INSERT INTO articulos (topic, info_array) VALUES ('" + myTopic + "', '" + topArticles + "')";
          connection.query(sql, function (err, result) {
          if (err) throw err;
            console.log("1 record inserted");
          });
        });
    }else{
    res.json(topArticles);
    }
  })
  //Inserta log del request
  var sql = "INSERT INTO user_logs (topic, usuario) VALUES ('" + myTopic + "', '" + req.params.userId + "')";
  connection.query(sql, function (err, result) {
  if (err) throw err;
  console.log("1 log inserted");
  });
})

app.get("/", (req, res) => {
  console.log("Responding to root route")
  res.send("Root")
})

app.get('/topTrends', (req, res) => {
  console.log("Fetching top trends")

  const connection = mysql.createConnection({
    host: 'mysql-datos-2.cyufope5fgiy.us-east-1.rds.amazonaws.com',
    port: 3306,
    user: 'root',
    password: 'root1234',
    database: 'MySQL_Datos_2'
  })

  const queryString = "SELECT topic FROM user_logs GROUP BY topic ORDER BY count(*) DESC LIMIT 10; "
  connection.query(queryString, (err, rows, fields) => {
    if (err) {
      console.log("Failed to query for users: " + err)
      res.sendStatus(500)
      return
      // throw err
    }
    res.json(rows)
  })

  // res.end()
})

app.get('/history/:userId', (req, res) => {
  console.log("Fetching history by userId")

  const connection = mysql.createConnection({
    host: 'mysql-datos-2.cyufope5fgiy.us-east-1.rds.amazonaws.com',
    port: 3306,
    user: 'root',
    password: 'root1234',
    database: 'MySQL_Datos_2'
  })

  const queryString = "SELECT fecha, topic FROM user_logs where usuario = ? "
  connection.query(queryString, [req.params.userId], (err, rows, fields) => {
    if (err) {
      console.log("Failed to query for users: " + err)
      res.sendStatus(500)
      return
      // throw err
    }

    const users = rows.map((row) => {
      return {"Trending topics": row.topic}
    })
    
    res.json(rows)
  })

  // res.end()
})

// localhost:3003
app.listen(3003, () => {
  console.log("Server is up and listening on 3003...")
})
