/*************************************************************************
* WEB322– Assignment 3
* I declare that this assignment is my own work in accordance with Seneca Academic
Policy. No part * of this assignment has been copied manually or electronically from any
other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Dai Dung Lam, Student ID: 137 632 196 Date: October-31st-2022
*
* Your app’s URL (from Heroku) : https://ghastly-phantom-23786.herokuapp.com/
*
*************************************************************************/ 
const express = require("express");
const multer = require("multer");
const path =require("path");
const fs = require("fs");
const exphbs = require("express-handlebars");
const app = express();
const dataService = require("./data-service");
app.use(express.static('public'));



const HTTP_PORT = process.env.Port || 8080;

function onHttpStart(){
    console.log("Express http server listening on: "+ HTTP_PORT);
};

app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
   });


app.engine(".hbs", exphbs.engine({
    extname:".hbs",
    defaultLayout: "main",
    helpers:{
        navLink: function(url, options){
            return '<li' +
            ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
            '><a href=" ' + url + ' ">' + options.fn(this) + '</a></li>';
           },
           equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
            return options.inverse(this);
            } else {
            return options.fn(this);
            }
           }
    }

}));
app.set("view engine", ".hbs");

app.get("/", (req,res) => {
    res.render("home");
});

app.get("/about", (req,res) =>{
    res.render("about");
}) ;

app.get("/employees/add", (req,res) => {
   res.render("addEmployee");
});

app.get("/images/add", (req,res) =>{
   res.render("addImage");
});

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
        }
});

const upload = multer({storage: storage});

app.post("/images/add", upload.single("imageFile"), (req,res) =>{
    res.redirect("/images");
});

app.get("/images", function(req,res){
    fs.readdir("./public/images/uploaded", function(err, items){
    res.render("images", {data: items});
    });
});

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/employees", (req,res) =>{
    if(req.query.status){
        dataService.getEmployeesByStatus(req.query).then((data) =>{
           res.render("employees", {employees: data});
        }).catch((err) =>{
           res.render({message: "no results"});
        })
    }
    else if(req.query.department){
        dataService.getEmployeesByDepartment(req.query).then((data) =>{
          res.render("employees", {employees:data});
        }).catch((err) =>{
            res.render({message: "no results"});
        })
    }
    else if(req.query.manager){
        dataService.getEmployeesByManager(req.query).then((data) =>{
            res.render("employees", {employees: data});
        }).catch((err) =>{
            res.render({message: "no results"});
        })
    }
    else {
    dataService.getAllEmployees().then((data)=>{
        res.render("employees", {employees: data});
    }).catch((err) =>{
        res.render({message: "no results"});
    });
    }
});

app.get("/employee/:employeeNum", function(req,res){
    dataService.getEmployeeByNum(req.params).then((data) =>
    {
       res.render("employee", {employee: data});
    }).catch((err) =>{
        res.render({message:"no results"});
    })
});

app.get("/departments", (req,res) =>{
    dataService.getDepartments().then((data) =>{
       res.render("departments", {departments: data});
    }).catch((err)=>{
        res.render({message: "no results"});
    });
}) ;

// app.get("/managers", (req,res) =>{
//     dataService.getManagers().then((data2) =>{
//         const manager = data2;
//         let resText2 = "<br>";
//         resText2 = JSON.stringify(manager) + "<br>";
//         res.send(resText2);
//     }).catch((err) =>{
//         res.send("{message: }", err);
//     });
// });

app.post("/employees/add", function(req,res){
    dataService.addEmployee(req.body).then(() =>{
        res.redirect("/employees");
    });
});

app.use((req, res) =>{
    res.status(404).send("<b>Error 404: Page not found.</b>");
});

dataService.initialize().then(() =>{
    app.listen(HTTP_PORT, onHttpStart);
}).catch((err) =>{
    console.log(err);
});
