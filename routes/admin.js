var express = require("express");
var exe = require("./connection");
var router = express.Router();

function login(req)
{
    if(req.session.user_id==undefined)
      return false;
    else
      return true;
}


router.get("/", async function(req,res){

    var data = await exe(`SELECT * FROM contacts`);
    var obj = {"contacts":data}
    res.render("admin/home.ejs",obj);
});

router.get("/manage_slider",async function(req,res)

{
    var data=await exe("SELECT * FROM slider");
    var obj={"slides":data};
    res.render("admin/manage_slider.ejs",obj);
});

router.post("/save_slider",async function(req,res)
{
    const today = new Date();
    var time=today.getTime();

    var file_name=time+req.files.slider_image.name;

    req.files.slider_image.mv("public/uploads/"+file_name);

    // await exe(`CREATE TABLE slider(slider_id INT PRIMARY KEY AUTO_INCREMENT,
    // slider_image TEXT,slider_title TEXT,slider_button_text VARCHAR(50),
    // slider_button_link TEXT)`);
    var d=req.body;
    await exe(`INSERT INTO slider (slider_image ,slider_title,slider_button_text,
    slider_button_link) VALUES ('${file_name}','${d.slider_title}','${d.slider_button_text}','${d.slider_button_link}')`);

    res.redirect("/admin/manage_slider");
});



router.get("/manage_category",async function(req,res)
{
    var data= await exe(`SELECT * FROM category`);
    var obj={"cats":data};
    res.render("admin/manage_category.ejs",obj);
});
router.post("/save_category", function(req,res){
    // await exe(`CREATE TABLE category(category_id INT PRIMARY KEY AUTO_INCREMENT,
    //     category_name VARCHAR(200),category_details TEXT)`);
    var details=req.body.category_details.replace("'","\\'");
    var name=req.body.category_name.replace("'","\\'");
    
    exe(`INSERT INTO category(category_name,category_details) VALUES ('${name}','${details}')`);
    res.redirect("/admin/manage_category");
});

router.get("/add_course",async function(req,res)
{ 
    var data=await exe("SELECT * FROM category");
    var obj = {"cat_list":data};
    res.render("admin/add_course.ejs",obj);
});


// above all are clear

router.post("/save_course", async function(req,res)
{
   const today = new Date();
    var time=today.getTime(); 

    console.log(req.body);
    console.log(req.files);

    var img_name = time+req.files.course_image.name;
    req.files.course_image.mv("public/uploads/"+img_name);
    

    if(req.files.course_video != undefined)
    {
        video_name= time+req.files.course_video.name;
        req.files.course_video.mv("public/uploads/"+video_name);
    }

    else{
        var video_name="";
    }

    // CREATE TABLE course_tbl(course_id INT PRIMARY KEY AUTO_INCREMENT,
    //           course_name VARCHAR(200),course_category_id TEXT, course_duration TEXT, course_price TEXT, course_image TEXT,
    //           course_sample_video TEXT, course_mentor TEXT, course_link TEXT, course_platform TEXT, course_details TEXT );
   var d = req.body;
   var course_name = d.course_name.replace("'","\\'");
   var course_details = d.course_details.replace("'","\\'");
   var sql =`INSERT INTO course_tbl (course_name,course_category_id, course_duration, course_price, course_image,
             course_sample_video, course_mentor, course_link, course_platform, course_details) VALUES ('${d.course_name}','${d.course_category_id}',
             '${d.course_duration}','${d.course_price}','${img_name}','${video_name}','${d.course_mentor}','${d.course_link}',
             '${d.course_platform}','${d.course_details}')`;
             await exe(sql);
             res.redirect("/admin/add_course");
});



router.get("/course_list",async function(req,res)
{  
    
    var data = await exe(`SELECT * FROM course_tbl,category WHERE course_tbl. course_category_id = category.category_id`);
    var obj={"course_list":data};
   res.render("admin/course_list.ejs",obj);
});

router.get("/course_details/:id",async function(req,res)
{
    var id=req.params.id;
    var data = await exe(`SELECT * FROM course_tbl,category WHERE course_tbl. course_category_id = category.category_id AND course_id = '${id}'`);
    var obj = {"c_det":data};
    res.render("admin/course_details.ejs",obj);
    
});

router.get("/login",function(req,res){
    // res.send("hi");
    var  obj = {"login":login(req)};
    res.render("admin/login.ejs",obj);
});

router.get("/register",function(req,res){
    // res.send("hi");
    var  obj = {"login":login(req)};
    res.render("admin/register.ejs",obj);
});

router.post("/save_admin",async function(req,res){
    //  await exe(`CREATE TABLE admin_tbl(admin_id INT PRIMARY KEY AUTO_INCREMENT, admin_name VARCHAR(100),
    //   admin_mobile VARCHAR(15), admin_email VARCHAR(200), admin_password VARCHAR(200))`);
    var d = req.body
    await exe(`INSERT INTO admin_tbl(admin_name,admin_mobile, admin_email, admin_password) 
    VALUES ('${d.admin_name}','${d.admin_mobile}','${d.admin_email}','${d.admin_password}')`);
    //   res.send(d);
res.redirect("/admin/login");
});


router.post("/do_login",async function(req,res)
{
    var d = req.body;
    var sql = `SELECT * FROM admin_tbl WHERE admin_mobile='${d.admin_mobile}' AND 
    admin_password='${d.admin_password}'`;
    var data= await exe(sql);
    if(data.length > 0)
    {   
        req.session.admin_id = data[0].admin_id;
        // res.send("Login Success");
        res.redirect("/admin");
    }
    else
      res.send("login Failed");
    
});


router.get('/logout',  function (req, res, next)  {
    if (req.session) {
      // delete session object
      req.session.destroy(function (err) {
        if (err) {
          return next(err);
        } else {
          return res.redirect('/admin');
        }
      });
    }
  });
module.exports = router;


// var img_name = time+req.files.course_image.name;