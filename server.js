/*************************************************************************
* WEB322– Assignment 2
* I declare that this assignment is my own work in accordance with Seneca Academic
Policy. No part * of this assignment has been copied manually or electronically from any
other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Dai Dung Lam, Student ID: 137 632 196 Date: October-4th-2022
*
* Your app’s URL (from Cyclic) : https://tan-lovely-hedgehog.cyclic.app/
*
*************************************************************************/ 
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const app = express();
const dataService = require("./data-service");
app.use(express.static('public'));

var HTTP_PORT = process.env.Port || 8080;

function onHttpStart(){
    console.log("Express http server listening on: "+ HTTP_PORT);
};

app.get("/", (req,res) => {
    res.sendFile(__dirname + "/views/home.html");
});

app.get("/about", (req,res) =>{
    res.sendFile(__dirname +"/views/about.html");
}) ;

app.get("/employees/add", (req,res) => {
    res.sendFile(__dirname + "/views/addEmployee.html");
});

app.get("/images/add", (req,res) =>{
    res.sendFile(__dirname + "/views/addImage.html");
});

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
        }
});

const upload = multer({storage:storage});

app.post("/images/add", upload.single("imageFile"), (req,res) =>{
    res.redirect("/images");
});

app.get("/images", function(req,res){
    fs.readdir("./public/images/uploaded", function(err, items){
    res.json({"images" : items});
    });
});

app.get("/employees", (req,res) =>{
    dataService.getAllEmployees().then((data)=>{
        const employee = data;
        let resText = "<br>";
        resText = JSON.stringify(employee) + "<br>";
        res.send(resText);
    }).catch((err) =>{
        res.send("{message: }", err);
    });
});

app.get("/departments", (req,res) =>{
    dataService.getDepartments().then((data1) =>{
        const department = data1;
        let resText1 = "<br>";
        resText1 = JSON.stringify(department) + "<br>";
        res.send(resText1);
    }).catch((err)=>{
        res.send("{message: }",err);
    });
 
}) ;


app.get("/managers", (req,res) =>{
    dataService.getManagers().then((data2) =>{
        const manager = data2;
        let resText2 = "<br>";
        resText2 = JSON.stringify(manager) + "<br>";
        res.send(resText2);
    }).catch((err) =>{
        res.send("{message: }", err);
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
