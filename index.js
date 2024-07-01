const express = require('express')
const mysql = require('mysql')
const fs = require('fs');
const { request } = require('https');
const app = express();

const PORT = 8000;

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mock_users'
})

connection.connect(function (err) {
  if (err) throw err
  console.log("Database connected successfully!!");
})

// connection.query("CREATE DATABASE mock_users", function(err, res){
//   if(err) throw err
//   console.log("DB is created")
// })

// const userTableQuery = ` CREATE TABLE users (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   first_name VARCHAR(255) NOT NULL,
//   last_name VARCHAR(255) NOT NULL,
//   email VARCHAR(255) UNIQUE NOT NULL,
//   gender VARCHAR(10),
//   job_title VARCHAR(255)
// )`

// connection.query(userTableQuery, (err, result) => {
//   if (err) {
//     console.error('Error creating the table:', err.stack);
//     return;
//   }

//   console.log('Table created successfully:', result);
// })

// connection.end((err) => {
//   if (err) {
//     console.error('Error closing the connection:', err.stack);
//     return;
//   }
//   console.log('Connection closed successfully');
// })



app.use(express.urlencoded({ extended: true })) //middlewares

// app.use((req, res, next) => {
//   req.creditNo = 1234;
//   fs.appendFile("./log.txt", `\n UserIp: ${req.ip} ${Date.now()}: ${req.method}: ${req.path}`, (err, data) => next())
//   console.log("I am 1st middleware")
//   next()
// })
// app.use((req, res, next) => {
//   console.log("creditNo:", req.creditNo)
//   console.log("I am 2nd middleware")
//   next()
// })

//Routes

app.get('/users', async (req, res) => {

  const sql = await 'SELECT * FROM users'

  // const html = `
  //   <ul>${allUsers.map((user) => `
  //     <li>
  //     <h1>${user.first_name}</h1>
  //     <p>${user.email} ${user.job_title}</p>
  //     </li> 
  //     `).join("")}</ul>
  // `
  // res.send(html);

  connection.query(sql, (err, result) => {
    if (!err) {
      const Users = result

      const html = `
     <ul>${Users.map((user) => `
     <li>
     <h1>${user.first_name}</h1>
     <p>${user.email}</p>
     </li> 
     `).join("")}</ul>
   `
      res.status(200).send(html);

    } else {
      res.status(500).send(err, "Internal server error")
      console.log(err)
    }
  })
})

app.post('/api/users', async (req, res) => {
  const body = req.body;
  const sql = await 'INSERT INTO users (first_name, last_name, email, gender, job_title) VALUES (?, ?, ?, ?, ?)';
  const values = [body.first_name, body.last_name, body.email, body.gender, body.job_title];

  if (!body || !body.first_name || !body.last_name || !body.email || !body.gender || !body.job_title) {
    return res.status(400).json({ msg: "All fields are required" })
  }

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error creating user", err)
      return res.status(500).json({ msg: 'Database error' });
    } else {
      res.status(200).json({ msg: 'User created successfully', userId: result.insertId })
    }
  })

})

app
.route("/api/users/:id")
.get( async (req, res) => {
    const id = Number(req.params.id)

    const sql = await 'SELECT * FROM users WHERE id = ?';
    const values = [id];

    connection.query(sql, values, (err, result) => {
      if (!err) {
        res.status(200).json(result[0])
      } else {
        res.status(500).json({ msg: "Internal server error" })
      }
    })

    if(!id){
      res.json({msg: "NO user found"})
    }
  })
.patch( async (req, res) => {
  const id = Number(re.params.id)
  const { first_name, last_name, email, gender, job_title } = req.body;
  const  sql = await 'UPDATE users SET first_name = ?, last_name = ?, email = ?, gender = ?, job_title = ? WHERE id = ?';
  const values = [first_name, last_name, email, gender, job_title, id];

  connection.query(sql, values, (err, result) => {
    if(!err){
      console.log("result:", result)
      return res.status(200).json({ msg: 'User updated successfully' })
    } else{
      console.error('Error updating user:', err.stack);
      return res.status(500).json({ msg: 'Database error' });
      } 
  })
})
.delete( async(req, res) => {
  const id = Number(req.params.id)
  const sql = await 'DELETE FROM users WHERE id = ? '
    
  connection.query(sql, id, (err,result) => {
    if(err) { 
      return res.status(500).json({ error:err, msg: "Internal server error"})
    } else{
      return res.status(200).json({msg:"User deleted Success"})
    }
  })

})  

// app
//   .route("/api/users/:id")
//   .get((req, res) => {
//     const id = Number(req.params.id)

//     const user = users.find(user => id === user.id)
//     if (!user) res.status(404).json({ error: "user not found" })
//     res.send(user)
//   })
//   .patch((req, res) => {

//   })
//   .delete((req, res) => {

//   })

// app.get('/api/users', (req, res) => {
//   // res.setHeader("X-MyName", "Atharva rao")
//   // allways add x in the custom headers 
//   console.log(req.headers)
//   res.json(users)
// })


// app.post('/api/users', (req, res) => {
//   const body = req.body;

//   if (!body || !body.first_name || !body.last_name || !body.email || !body.email || !body.gender || !body.job_title) {
//     return res.status(400).json({ msg: "All fields are required" })
//   }

//   users.push({ ...body, id: users.length + 1 })

//   fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err, data) => {
//     return res.status(201).json({ status: "succesfully", id: users.length })
//   })
// })


app.listen(PORT, () => console.log(`Sever started at port http://localhost:${PORT}`))