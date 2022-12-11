module.exports ={
    initialize,
    registerUser,
    checkUser
}
const mongoose = require ('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
 
var userSchema = new Schema({
    "userName" : {
       "type" : String,
       "unique" : true
    },
    "password" : String,
    "email" : String,
    "loginHistory" : [{
        "dateTime" : Date,
        "userAgent" : String
    }]
})

let User;

function initialize() {
    return new Promise((resolve, reject) =>{
         let db = mongoose.createConnection("mongodb+srv://dbUser:Supermeo2001@a6.llx8esk.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true })
        db.on('error', (err) =>{
            reject (err);
        })
        db.once('open', () =>{
            User = db.model("users", userSchema);
            resolve();
        })
    })
};

function registerUser(userData){
    return new Promise((resolve,reject) =>{
        if(userData.password == " " || userData.password.length == 0 
        || userData.password2 == " " || userData.password2.length ==0)
        {
            reject("Error: user name cannot be empty or only white spaces!");
        }
        else if(userData.password != userData.password2)
        {
            reject("Error: Passwords do not match");
        }else{
            bcrypt.genSalt(10, function (err,salt) {
                bcrypt.hash(userData.password, salt, function(err, hash){
                    if(err){
                        reject("There was an error encrypting the password");
                    }
                    else{
                        userData.password = hash;
                        let newUser = new User(userData);
                        newUser.save((err) =>{
                            if(err)
                            {
                                if(err.code == 11000)
                                {
                                    reject("User Name already taken");
                                }
                                else{
                                    reject("There was an error creating the user: " + err);
                                }
                            }else{
                                resolve(newUser);
                            }
                        })
                    }
                })
            })
        }
    })
}

function checkUser(userData){
    return new Promise((resolve,reject) =>{
        User.findOne({userName : userData.userName}).exec().then(foundUser =>{
            bcrypt.compare(userData.password, foundUser.password).then(res =>{
                if(res == true)
                {
                    foundUser.loginHistory.push({dateTime : (new Date()).toString(), userAgent:userData.userAgent});
                    User.update(
                        {
                       userName: foundUser.userName 
                        },
                        {
                            $set: {
                                loginHistory: foundUser.loginHistory
                            }
                        },
                        {
                            multi: false
                        }
                    ).exec().then(() =>{
                        resolve(foundUser)
                    }).catch(err =>{
                        reject("There was an error verifying the user: " + err);
                    })
                }
                else{
                    reject("Incorrect Password for User " + userData.userName);
                }
            })
        }).catch(() =>{
            reject("Unable to find user: " + userData.userName);
        })
    })
}