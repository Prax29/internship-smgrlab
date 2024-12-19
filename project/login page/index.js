import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import bcrypt from 'bcrypt';
import svgCaptcha from 'svg-captcha';
import fs from "fs";
import session from "express-session";
const saltRounds=10;
const __dirname = dirname(fileURLToPath(import.meta.url));
const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'));
const port=3000;
app.listen(port, ()=>{
    console.log(`Server running on port no. ${port}!`);
});
app.use(
  session({
    secret : ".Gmailcom@",
    resave : false,
    saveUninitialized : false,
    cookie : {
      maxAge : 60000,
      httpOnly : true
    }
  })
);
app.get("/", (req, res) => {
  let captcha = svgCaptcha.create({
      size : 6,
      noise : 2,
      color : true,
      background :"#fafafa"
  });
  res.render("index.ejs",{
    captcha : captcha.data,
    text : captcha.text
  });
});
app.get("/login", (req, res)=>{
  res.render("login.ejs");
});
app.get("/register", (req, res)=>{
  let captcha = svgCaptcha.create({
    size : 6,
    noise : 2,
    color : true,
    background :"#fafafa"
  });
  res.render("index.ejs",{
    captcha : captcha.data,
    text : captcha.text
  });
});
const isLogged = (req, res, next)=>{
  if(req.session.user){
    next();
  }
  else{
    res.redirect("/login");
  }
};
app.get("/success", isLogged, (req, res)=>{
  const action = req.session.action;
  res.render("success.ejs",{
    action : action
  });
});
app.post("/logout", (req, res)=>{
  req.session.destroy((err)=>{
    if(err){
      console.log(err);
    }
    res.redirect("/login");
  })
})
//database
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "login",
    password: "db.pranav29",
    port: 5432,
  });
  db.connect();
//registration
app.post("/register", (req, res)=>{
    const {username, email, password, mobile, role} = req.body;
    const query2 = "SELECT email from users";
    let unique=true;
    let captcha = svgCaptcha.create({
      size : 6,
      noise : 2,
      color : true,
      background :"#fafafa"
    });
    db.query(query2, (err, result1)=>{
      if(err){
        console.log("Error executing query", err.stack);
      }
      else{
        for(var i=0;i<result1.rows.length;i++){
          if(result1.rows[i].email===email){
            unique = false;
            return res.render("index.ejs",{
              error : 1,
              captcha : captcha.data,
              text : captcha.text
            });
          }
        }
        if(unique){
          const hash = bcrypt.hashSync(password, saltRounds);
          const query1 = "INSERT INTO users (username, email, pass, mobile, rolename) VALUES ($1, $2, $3, $4, $5)";
          const values = [username, email, hash, mobile, role];
          db.query(query1, values, (err, result2) => {
            if (err) {
              console.error("Error executing query", err.stack);
            } else {
              console.log("Entered successfully!");
              res.redirect("/success");
              console.log(values);
            }
          });
        }
      }
    });
});
//login
app.post("/login", (req, res)=>{
  const {email, password} = req.body;
  const query = "SELECT email,pass from users";
  let eError = true;
  let pError = true;
  // let errorType = 0;
  db.query(query, (err, result)=>{
    if(err){
      console.log("Error executing query", err.stack);
    }
    else{
      for(var i=0;i<result.rows.length;i++){
        if(result.rows[i].email===email){
          eError=false;
          // console.log(result.rows[i].email);

          if(bcrypt.compareSync(password, result.rows[i].pass)){
            pError=false;
            // errorType=0;
            // console.log(result.rows[i].pass);
            req.session.user = { email };
            req.session.action = "Login";
            res.redirect("/success");
          }
        }
      }
      if(eError){
        // errorType=1;
        return res.render("login.ejs",{
          error : 1
        });
      }
      else if(pError){
        // errorType=2;
        return res.render("login.ejs",{
          error : 2
        });
      }
    }
    db.end();
  });
});