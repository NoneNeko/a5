/*************************************************************************
* WEB322– Assignment 5
* I declare that this assignment is my own work in accordance with Seneca Academic
Policy. No part * of this assignment has been copied manually or electronically from any
other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Dai Dung Lam, Student ID: 137 632 196 Date: November-13rd-2022
*
* Your app’s URL (from Cyclic) : https://long-jade-walkingstick-kit.cyclic.app/
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
    dataService.getDepartments(req.body).then(() =>{
        res.render("addEmployee", {departments: data});
    }).catch((e) =>{
        res.render("addEmployee", {departments: []});
    })
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
        dataService.getEmployeesByDepartment(req.query).then((data) =>{
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
        dataService.getEmployeesByManager(req.query).then((data) =>{
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

app.get("/employee/:employeeNum", (req, res) => {
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
    viewData.departments = data; // store department data in the "viewData" object as
   "departments"
    // loop through viewData.departments and once we have found the departmentId that matches
    // the employee's "department" value, add a "selected" property to the matching
    // viewData.departments object
   13
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
   

app.get("/departments", (req,res) =>{
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

app.post("/employee/update", (req, res) => {
    dataService.updateEmployee(req.body).then(() =>{
        console.log(req.body);
        res.redirect("/employees");
    })
   });

app.post("/employees/add", function(req,res){
    dataService.addEmployee(req.body).then(() => {
        res.redirect("/employees");
    });
});

app.get("/departments/add", (req, res) => {
    res.render("addDepartment");
});

app.post("/departments/add", (req, res) => {
    dataService.addDepartment(req.body).then(() => {
        res.redirect("/departments");
    });
});

app.post("/department/update", (req, res) => {
    dataService.updateDepartment(req.body).then(() =>{
        console.log(req.body);
        res.redirect("/departments");
    })
   });

app.get("/department/:departmentId", (req,res) =>{
    dataService.getDepartmentById(req.params.departmentId).then((data) =>
    {
       res.render("department", {department: data});
    }).catch((err) =>{
        res.status(404).send("Department Not Found");
    })
});

app.get("/employee/delete/:empNum", (req,res) =>{
    dataService.deleteEmployeeByNum(req.params.empNum).then((data) =>{
        res.redirect("/employees");
    }).catch((e) =>{
       res.status(500).send("Unable to Remove Employee / Employee not found");
    })
})
app.use((req, res) =>{
    res.status(404).send("<b>Error 404: Page not found.</b>");
});

dataService.initialize().then(() =>{
    app.listen(HTTP_PORT, onHttpStart);
}).catch((err) =>{
    console.log(err);
});
