// /*************************************************************************
// * WEB322– Assignment 6
// * I declare that this assignment is my own work in accordance with Seneca Academic
// Policy. No part * of this assignment has been copied manually or electronically from any
// other source
// * (including 3rd party web sites) or distributed to other students.
// *
// * Name: Dai Dung Lam, Student ID: 137 632 196 Date: December-07th-2022
// *
// * Your app’s URL (from Cyclic) : https://cute-pink-wasp-belt.cyclic.app
// *
// *************************************************************************/ 
const express = require("express");
const multer = require("multer");
const path =require("path");
const fs = require("fs");
const exphbs = require("express-handlebars");
const app = express();
const dataService = require("./data-service");
const dataServiceAuth = require("./data-service-auth")
const clientSessions = require('client-sessions');
app.use(express.static('public'));


const HTTP_PORT = process.env.Port || 8080;

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
        }
});

const upload = multer({storage: storage});



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
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
   });

app.use(clientSessions({
    cookieName: "session",
    secret: "assignment6ForWeb322",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60
}));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

function ensureLogin(req,res,next) {
    if (!(req.session.user)) {
        res.redirect("/login");
    }
    else { 
        next(); 
    }
};

app.get("/", (req,res) => {
    res.render("home");
});

app.get("/about", (req,res) =>{
    res.render("about");
}) ;

app.get("/images/add", ensureLogin, (req,res) =>{
    res.render("addImage");
 });

app.post("/images/add",ensureLogin, upload.single("imageFile"), (req,res) =>{
    res.redirect("/images");
});

app.get("/images", ensureLogin, function(req,res){
    fs.readdir("./public/images/uploaded", function(err, items){
    res.render("images", {data: items});
    });
});

app.get("/employees/add", ensureLogin, (req,res) => {
    dataService.getDepartments().then((data) =>{
        res.render("addEmployee", {departments: data});
    }).catch((e) =>{
        res.render("addEmployee", {departments: []});
    })
});


app.get("/employees", ensureLogin, (req,res) =>{
    if(req.query.status){
        dataService.getEmployeesByStatus(req.query.status).then((data) =>{
            if(data.length > 0)
            {
                res.render("employees", {employees: data});
            }
            else{
                res.render("employees",{ message: "no results" });
            }
           
        }).catch((err) =>{
           res.render({message: "no results"});
        })
    }
    else if(req.query.department){
        dataService.getEmployeesByDepartment(req.query.department).then((data) =>{
            if(data.length > 0)
            {
                res.render("employees", {employees: data});
            }
            else{
                res.render("employees",{ message: "no results" });
            }
        }).catch((err) =>{
            res.render({message: "no results"});
        })
    }
    else if(req.query.manager){
        dataService.getEmployeesByManager(req.query.manager).then((data) =>{
            if(data.length > 0)
            {
                res.render("employees", {employees: data});
            }
            else{
                res.render("employees",{ message: "no results" });
            }
        }).catch((err) =>{
            res.render({message: "no results"});
        })
    }
    else {
    dataService.getAllEmployees().then((data)=>{
        if(data.length > 0)
        {
            res.render("employees", {employees: data});
        }
        else{
            res.render("employees",{ message: "no results" });
        }
    }).catch((err) =>{
        res.render({message: "no results"});
    });
    }
});

app.post("/employee/update", ensureLogin, (req, res) => {
    dataService.updateEmployee(req.body).then(() =>{
        console.log(req.body);
        res.redirect("/employees");
    })
   });

app.post("/employees/add", ensureLogin, function(req,res){
    dataService.addEmployee(req.body).then(() => {
        res.redirect("/employees");
    });
});

app.get("/employee/:employeeNum", ensureLogin, (req, res) => {
    // initialize an empty object to store the values
    let viewData = {};
    dataService.getEmployeeByNum(req.params.employeeNum).then((data) => {
    if (data) {
    viewData.employee = data; //store employee data in the "viewData" object as "employee"
    } else {
    viewData.employee = null; // set employee to null if none were returned
    }
    }).catch(() => {
    viewData.employee = null; // set employee to null if there was an error
    }).then(dataService.getDepartments)
    .then((data) => {
    viewData.departments = data; // store department data in the "viewData" object as "departments"
    // loop through viewData.departments and once we have found the departmentId that matches
    // the employee's "department" value, add a "selected" property to the matching
    // viewData.departments object
    for (let i = 0; i < viewData.departments.length; i++) {
    if (viewData.departments[i].departmentId == viewData.employee.department) {
    viewData.departments[i].selected = true;
    }
    }
    }).catch(() => {
    viewData.departments = []; // set departments to empty if there was an error
    }).then(() => {
    if (viewData.employee == null) { // if no employee - return an error
    res.status(404).send("Employee Not Found");
    } else {
    res.render("employee", { viewData: viewData }); // render the "employee" view
    }
    });
   });
   

app.get("/departments", ensureLogin, (req,res) =>{
    dataService.getDepartments().then((data) =>{
        if(data.length > 0)
            {
                res.render("departments", {departments: data});
            }
            else{
                res.render("departments",{ message: "no results" });
            }
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



app.get("/departments/add", ensureLogin, (req, res) => {
    res.render("addDepartment");
});

app.post("/departments/add", ensureLogin, (req, res) => {
    dataService.addDepartment(req.body).then(() => {
        res.redirect("/departments");
    });
});

app.post("/department/update", ensureLogin, (req, res) => {
    dataService.updateDepartment(req.body).then(() =>{
        console.log(req.body);
        res.redirect("/departments");
    })
   });

app.get("/department/:departmentId", ensureLogin, (req,res) =>{
    dataService.getDepartmentById(req.params.departmentId).then((data) =>
    {
       res.render("department", {department: data});
    }).catch((err) =>{
        res.status(404).send("Department Not Found");
    })
});

app.get("/employee/delete/:empNum", ensureLogin,(req,res) =>{
    dataService.deleteEmployeeByNum(req.params.empNum).then((data) =>{
        res.redirect("/employees");
    }).catch((e) =>{
       res.status(500).send("Unable to Remove Employee / Employee not found");
    })
})

app.get("/login" ,(req,res) =>{
    res.render("login");
});

app.get("/register" , (req,res) =>{
    res.render("register");
});

app.post("/register", (req,res) => {
    dataServiceAuth.registerUser(req.body)
    .then(() => res.render("register", {successMessage: "User created" } ))
    .catch (err => res.render("register", {errorMessage: err, userName:req.body.userName }) )
});

app.post("/login", (req,res) => {
    req.body.userAgent = req.get('User-Agent');
    dataServiceAuth.checkUser(req.body)
    .then(user => {
        req.session.user = {
            userName:user.userName,
            email:user.email,
            loginHistory:user.loginHistory
        }
        res.redirect("/employees");
    })
    .catch(err => {
        res.render("login", {errorMessage:err, userName:req.body.userName} )
    }) 
});

app.get("/logout", (req,res) =>{
    req.session.reset();
    res.redirect("/");
})

app.get("/userHistory", ensureLogin, (req,res) =>{
    res.render("userHistory");
})


app.use((req, res) =>{
    res.status(404).send("<b>Error 404: Page not found.</b>");
});

dataService.initialize()
.then(dataServiceAuth.initialize)
.then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
     });
}).catch(function(err){
    console.log("unable to start server: " + err);
});
