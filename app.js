//Dependencias
const rp = require('request-promise')
var request = require('request')
const express = require('express')
const app = express()
const morgan = require('morgan')
const mysql = require('mysql')

//logs de requests
app.use(morgan('short'))

app.get('/articles/:topic', (req, res) => {
  console.log("Fetching articles of topic: " + req.params.topic)

  const connection = mysql.createConnection({
    host: 'mysql-datos-2.cyufope5fgiy.us-east-1.rds.amazonaws.com',
    port: 3306,
    user: 'root',
    password: 'root1234',
    database: 'lbta_mysql'
  })

  const myTopic = req.params.topic
  const queryString = "SELECT * FROM users WHERE id = ?"
  connection.query(queryString, [myTopic], (err, rows, fields) => {
    if (err) {
      //go fetch from wikipedia
      /*
      console.log("Failed to query for users: " + err)
      res.sendStatus(500)
      return
      */
      var articles = getFromWiki(myTopic);
    }

    //return info from db
    /*
    const users = rows.map((row) => {
      return {firstName: row.first_name, lastName: row.last_name}
    })
    */
    res.send(articles)
  })

  // res.end()
})

app.get("/", (req, res) => {
  console.log("Responding to root route")
  res.send("Root")
})

app.get("/users", (req, res) => {
  var user1 = {firstName: "Stephen", lastName: "Curry"}
  const user2 = {firstName: "Kevin", lastName: "Durant"}
  res.json([user1, user2])
})

// localhost:3003
app.listen(3003, () => {
  console.log("Server is up and listening on 3003...")
})

function getFromWiki(researchTopic) {
  console.log(researchTopic)
  var options={
      methode: 'GET',
      uri:'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + researchTopic + '&limit=25&namespace=0&format=json',
      json:true
  };
  
  rp(options)
      .then(function(parseBody){
        var articleNames = parseBody[1];
        console.log(articleNames);
        
      })
      .catch(function (err){
  });
  
}