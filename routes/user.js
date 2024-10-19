var express = require("express");
var exe = require("./connection");
const { render } = require("ejs");
var router = express.Router();

function login(req)
{
    if(req.session.user_id==undefined)
      return false;
    else
      return true;
}

router.get("/",async function(req,res)
{
    var slides = await exe("SELECT * FROM slider");
    var courses = await exe("SELECT * FROM course_tbl ORDER BY course_id DESC LIMIT 8");
    var obj= {"slides":slides,"courses":courses,"login":login(req)};
    res.render("user/home.ejs",obj);
});
router.get("/course_details/:id",async function(req,res){
    var id = req.params.id;
    course_det = await exe(`SELECT * FROM course_tbl WHERE course_id = '${id}'`);
    var obj = {"course_det":course_det,"login":login(req)};
    res.render("user/course_details.ejs",obj);

});

router.get("/courses",async function(req,res){
    courses = await exe(`SELECT * FROM course_tbl`);
    var obj = {"courses":courses,"login":login(req)};
    res.render("user/courses.ejs",obj);
});

router.get("/login",function(req,res){
     var  obj = {"login":login(req)};
     res.render("user/login.ejs",obj);
});

router.get("/register",function(req,res){
    var  obj = {"login":login(req)};
    res.render("user/register.ejs",obj);
});

router.post("/save_user",async function(req,res){
            //  await exe(`CREATE TABLE user_tbl(user_id INT PRIMARY KEY AUTO_INCREMENT, user_name VARCHAR(100),
            //   user_mobile VARCHAR(15), user_email VARCHAR(200), user_password VARCHAR(200))`);
            var d = req.body
            await exe(`INSERT INTO user_tbl(user_name,user_mobile, user_email, user_password) 
            VALUES ('${d.user_name}','${d.user_mobile}','${d.user_email}','${d.user_password}')`);

    res.redirect("/login");
});

router.post("/do_login",async function(req,res)
{
    var d = req.body;
    var sql = `SELECT * FROM user_tbl WHERE user_mobile='${d.user_mobile}' AND 
    user_password='${d.user_password}'`;
    var data= await exe(sql);
    if(data.length > 0)
    {   
        req.session.user_id = data[0].user_id;
        // res.send("Login Success");
        res.redirect("/");
    }
    else
      res.send("login Failed");
    
});
  
router.get("/confirm_seat/:id",async function(req,res)
{  
    if(req.session.user_id!=undefined)
    {
        var id = req.params.id;
        course_det = await exe(`SELECT * FROM course_tbl WHERE course_id = '${id}'`);
        var obj = {"course_det":course_det,"login":login(req)};
       res.render("user/confirm_seat.ejs",obj);
    }
    else
    {
        res.send(`
          <script>
          alert('Login First');
          location.href = "/login";
          </script>
        `);

    }
});

router.get("/pay_course_fee/:course_id",async function(req,res)
{
    if(req.session.user_id!=undefined)
    {
      var course_id = req.params.course_id;
      var user_id = req.session.user_id;
    //  await exe(`CREATE TABLE user_courses (user_course_id INT PRIMARY KEY AUTO_INCREMENT, 
    //     user_id INT,course_id INT,amount INT,transaction_id VARCHAR(100))`);
      res.send("User Id = "+user_id+"<br> Course Id = "+course_id);
    }
    else{
        res.send(`
        <script>
        alert('Login First');
        location.href = "/login";
        </script>
      `);

    }

});

router.get('/logout',  function (req, res, next)  {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

router.get("/contacts", function(req,res){
  const isLoggedIn = req.session && req.session.user; 
  res.render("user/contacts.ejs", { login: isLoggedIn });
});

router.post("/save_contact", async function(req,res){

  var d = req.body;
  var sql = `INSERT INTO contacts (user_name,user_email,user_message) VALUES('${d.user_name}','${d.user_email}','${d.user_message}')`;
  var data = await exe(sql);
  // res.send(data);
  res.redirect("/")

});


module.exports = router;

// CREATE TABLE contacts(user_id INT PRIMARY KEY AUTO_INCREMENT, user_name VARCHAR(100), user_email VARCHAR(100), user_message VARCHAR (200))