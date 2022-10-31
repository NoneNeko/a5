var fs = require("fs");

module.exports ={
    initialize,
    getAllEmployees,
    getDepartments,
    getManagers,
    addEmployee
}
let employees = [];
let departments = [];

function initialize(){
    return new Promise((resolve, reject) =>{
        fs.readFile('./data/employees.json',(err,data)=>{
            if (err) {
                reject("Failure to read file employees.json!");
            }
            else{
                employees=JSON.parse(data);
                fs.readFile('./data/department.json',(err,data)=>{
                    if (err) {
                        reject("Failure to read file employees.json!");
                    }
                    else{
                        departments=JSON.parse(data);
                        resolve();
                    }
                });
            }
        });
    });
}

function getAllEmployees(){
    return new Promise((resolve,reject) =>{
        if(employees.length == 0)
        {
            reject("no results returned");
        }
        else{
            resolve(employees);
        }
    });
}

function getDepartments(){
    return new Promise((resolve,reject) =>{

        if (departments.length == 0)
        {
            reject("no results returned");
        }
        else{
            resolve(departments);
        }
    });
}

function getManagers()
{
    return new Promise((resolve,reject) =>{
       
        let managers = employees.filter(employee => employee.isManager == true);
        if(managers.length == 0)
        {
            reject("no result returned");
        }
        else{
            resolve(managers);
        }
    });
}

function addEmployee(employeeData){
    return new Promise((resolve,reject) =>{
        if(employeeData.isManager){
            employeeData.isManager = true;
        }
        else{
            employeeData.isManager = false;
        }
        employeeData.employeeNum = employees.length +1;
        employees.push(employeeData);
        resolve();
    })
}
    

