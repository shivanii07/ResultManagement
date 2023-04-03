const express = require("express");
const app = express();
const mysql = require("mysql");
const flash = require('connect-flash');

// mysql database connection

const con = mysql.createConnection({

    host: "localhost",
    user: "root",
    password: "password",
    database: "rms",

});

con.connect((err) => {
    if (err) throw err;
    console.log("Connection created..!!");
});

//middlewares

var connection = require('request');
const port = 3004
var bodyParser = require("body-parser")
var session = require("express-session")

app.use(session({

    secret: 'webslesson',
    resave: true,
    saveUnintialized: true
}))
app.use(flash());

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());

// view engine configuration
app.set("view engine", "ejs");
app.set("views", "./views")


app.use(express.static(__dirname + "/public"))

//Routings

//Home Page routing

app.get("/", (req, res) => {
    res.render("index")

});


//teacher login page routing

app.get("/teacher/login", (req, res) => {
    res.render("teacher/teacherlogin")

});

//student login page routing

app.get("/student/login", (req, res) => {
    res.render("student/studentlogin")

});

//teacher login routing for diplaying next option page

app.post("/loginteacher", function (request, response, next) {

    var emailid = request.body.emailid;
    var password = request.body.password;

    if (emailid && password) {
        query = `SELECT * FROM teacher where emailid ="${emailid}" `;
        con.query(query, function (error, data) {

            if (data.length > 0) {
                for (var count = 0; count < data.length; count++) {
                    if (data[count].password == password) {
                        request.session.user_id = data[count].name;

                        response.render("teacher/option");
                    }
                    else {
                        response.redirect('/teacher/login');
                    }
                }
            }
            else {
                response.redirect('/teacher/login');
            }
            response.end();
        });
    }
    else {
        response.redirect('/teacher/login');
        response.end();
    }

});

app.get("/option", function (req, res) {
    res.render("teacher/option")
    

    
    

});
//routing to display add student page 

app.get("/teacher/add", function (req, res) {
    res.render("teacher/addstudent")
})

//routing to add student in database

app.get("/addstudent", (req, res) => {
    //fetching data from form
    const { rollno, name, dob, score } = req.query

    let qry = "SELECT * FROM student WHERE rollno=?";
    con.query(qry, [rollno], (err, results) => {
        if (err)
            throw err;
        else {
            if (results.length > 0) {

            } else {
                let qry2 = "INSERT INTO student values(?,?,?,?)";
                con.query(qry2, [rollno, name, dob, score], (err, results) => {
                    
                    res.redirect("/teacher/add")
                })
            }

        }
    })

});

// routing for diplaying all student score

app.get('/teacher/viewall', (req, res) => {
    let sql = "SELECT * FROM  student ORDER BY rollno";
    con.query(sql, (err, rows) => {
        if (err) throw err;

        res.render('teacher/viewall', {
            student: rows
        });
    });
});

app.get('/teacher/option', (req, res) => {
    res.render("teacher/option")
});

// routing for deleting the student


app.get('/teacher/delete/:userId', (req, res) => {
    const userId = req.params.userId;
    let sql = `DELETE from student where rollno = ${userId}`;
    con.query(sql, (err, result) => {
        if (err) throw err;
        res.redirect('/teacher/viewall');
    });
});

// routing to diplay student edit page
app.get('/teacher/edit/:userId', (req, res) => {
    const userId = req.params.userId;
    let sql = `SELECT * FROM student where rollno = ${userId}`;
    con.query(sql, (err, result) => {
        if (err) throw err;
        res.render('teacher/edit', {
            student: result[0]
        });
    });
});


// routing to update student details after editing

app.post('/update', (req, res) => {
    const userId = req.body.rollno;
    let sql = "UPDATE  student SET  name='" + req.body.name + "', dob='" + req.body.dob + "'  ,  score='" + req.body.score + "' where rollno =" + userId;
    con.query(sql, (err, results) => {
        if (err) throw err;
        res.redirect('teacher/viewall');
    });
});

// routing for student login using dob and roll no

app.post("/login", function (request, response, next) {

    var rollno = request.body.rollno;
    var dob = request.body.dob;

    if (rollno && dob) {
        query = `SELECT * FROM student WHERE rollno ="${rollno}" AND dob ="${dob}"`;
        con.query(query, function (error, data) {

            if (data.length > 0) {
                for (var count = 0; count < data.length; count++) {
                    if (data[count].rollno == rollno) {
                        request.session.user_id = data[count].name;

                        response.render("student/view", { student: data });
                    }
                    else {
                        response.redirect('/student/login')
                    }
                }
            }
            else {
                response.redirect('/student/login')
            }
            response.end();
        });
    }
    else {
        response.redirect('/student/login')
        response.end();
    }

});



//create server
app.listen(port, (err) => {
    if (err)
        throw err
    else
        console.log("Server is running at port %d:", port);
});