module.exports ={
    initialize,
    getAllEmployees,
    getDepartments,
    getManagers,
    addEmployee,
    getEmployeesByStatus,
    getEmployeesByDepartment,
    getEmployeesByManager,
    getEmployeeByNum,
    updateEmployee,
    addDepartment,
    updateDepartment,
    getDepartmentById,
    deleteEmployeeByNum
}

const Sequelize = require('sequelize');

var sequelize = new Sequelize('xmrvvrtf', 'xmrvvrtf', 'puSoFMFOMAy4fDyfdnRFw0tczXMp0On4', {
    host: 'mouse.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
    ssl: true
   },
   query:{raw: true} // update here, you. Need this
   }); 

   sequelize.authenticate().then(()=> console.log('Connection success.'))
.catch((err)=>console.log("Unable to connect to DB.", err));

var Employee = sequelize.define('Employee', {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true 
    }, 
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING,
},{
        createdAt: false, 
        updatedAt: false
});

var Department = sequelize.define('Department', {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }, 
    departmentName: Sequelize.STRING},
    {
        createdAt: false, 
        updatedAt: false 
});

function initialize(){
    return new Promise((resolve, reject) =>{
       sequelize.sync().then((Employee) =>{
        resolve();
       }).then((Department) =>{
        resolve();
       }).catch((err) =>{
            reject("unable to sync the database");
       })
    });
}

function getAllEmployees(){
    return new Promise((resolve,reject) =>{
      sequelize.sync().then(() =>{
        resolve(Employee.findAll());
      }).catch((e) =>{
        reject("no result returned");
      })
    });
}

function getDepartments(){
    return new Promise((resolve,reject) =>{
        sequelize.sync().then(() =>{
            resolve(Department.findAll());
        }).catch((e) =>{
            reject("no result returned");
        })
    });
}

function getManagers()
{
    return new Promise((resolve,reject) =>{
       
       
            reject("no result returned");
      
    });
}

function addEmployee(employeeData){
    employeeData.isManager = (employeeData.isManager) ? true : false;
    return new Promise((resolve,reject) =>{
        sequelize.sync().then(() =>{
            for (var i in employeeData)
            {
                if(employeeData == "")
                {
                    employeeData[i] = null;
                }
            }
            resolve(Employee.create(employeeData)).catch((e) =>{
                reject("unable to create employee");
            })
        }).catch((e) =>{
            reject("unable to create employee");
        })
    })
}

function addDepartment(departmentData){
    return new Promise((resolve,reject) =>{
        sequelize.sync().then(() =>{
            for (var i in departmentData)
            {
                if(departmentData[i] == "")
                {
                    departmentData[i] = null;
                }
            }
            resolve(Department.create(departmentData)).catch((e) =>{
                reject("unable to create department");
            } )
        }).catch((e) =>{
            reject("unable to create department");
        })
    })
}

function getEmployeesByStatus(status){
    return new Promise((resolve,reject) => {
       sequelize.sync().then(()=>{
            resolve(Employee.findAll({
                where: {
                status : status
       }}));
       }).catch((e) =>{
        reject("no result returned");
       })
    })
}

function getEmployeesByDepartment(department){
    return new Promise((resolve,reject) =>{
        sequelize.sync().then(() =>{
            resolve(Employee.findAll({
                where:{
                    department : department
                }
            }));
        }).catch((e) =>{
            reject("no result returned");
        })
    })
}

function getEmployeesByManager(manager){
    return new Promise((resolve,reject) =>{
       sequelize.sync().then(() =>{
        resolve(Employee.findAll({
            where:{
                employeeManagerNum : manager
            }
        }))
       }).catch((e) =>{
        reject("no result returned");
       })
    })
}

function getEmployeeByNum(num){
    return new Promise((resolve, reject) =>{
       sequelize.sync().then(() =>{
        resolve(Employee.findAll({
            where:{
                employeeNum : num
            }
        }))
       }).catch((e) =>{
        reject("no result returned");
       })
    })
}
    
function updateEmployee(employeeData){
    employeeData.isManager = (employeeData.isManager) ? true : false;
    return new Promise((resolve,reject) =>{
        sequelize.sync().then(() =>{
            for (var i in employeeData)
            {
                if(employeeData.employeeManagerNum == "")
                {
                    employeeData[i].employeeManagerNum = null;
                }
            }
        resolve(Employee.update(employeeData)).catch((e) =>{
            reject("unable to update employee");
        })
   }) 
})};



function updateDepartment(departmentData){
    return new Promise((resolve,reject) =>{
        sequelize.sync().then(() =>{
            for (var i in departmentData)
            {
                if(departmentData[i] == "")
                {
                    departmentData[i] = null;
                }
            }
           Department.update({
            departmentName: departmentData.departmentName
           }, {
            where :{
                departmentId : departmentData.departmentId
            }}).then(() =>{
                resolve(Department);
            }).catch((e) =>{
                reject("unable to update department");
            })
        }).catch((e) =>{
            reject("unable to update department");
        })
    })
}

function getDepartmentById(num){
    return new Promise((resolve, reject) =>{
       sequelize.sync().then(() =>{
        resolve(Department.findAll({
            where:{
                departmentId : num
            }
        }))
       }).catch((e) =>{
        reject("no result returned");
       })
    })
}

function deleteEmployeeByNum(num){
    return new Promise((resolve, reject) =>{
        sequelize.sync().then(() =>{
            resolve(Employee.destroy({
                where:{
                    employeeNum : num
                }
            }))
        }).catch((e) =>{
            reject("Error while destroying");
        })
    })
}