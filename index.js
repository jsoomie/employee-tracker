// Modules
const mysql = require("mysql");
const inquirer = require("inquirer");

// Variables
const PORT = process.env.PORT || 3306;
const mysqlUser = "Jon";
const mysqlPw = "123";
const database = "company";

// Connects to the database
const db = mysql.createConnection({
    host: "localhost",
    port: PORT,
    user: mysqlUser,
    password: mysqlPw,
    database: database
})

// Breaks line
const linebreak = (symbol = "-", repeatTime = 35) => console.log(`\n${symbol.repeat(repeatTime)}\n`);

// Starts the questions
const start = () => {
    inquirer.prompt(
        {
            type: "list",
            name: "start",
            message: "What would you like to do?",
            choices: [
                "Employee Management",
                "EXIT"
            ]
        }
    ).then((answers) => {
        console.log(answers.start);
        switch(answers.start) {
            case "Employee Management":
                console.log("You're going to start the management.");
                manage();
                break;
            case "EXIT":
                console.log("Bye!");
                db.end();
                break;
        }
    })
}

// Starts the management process of employees
const manage = () => {
    console.log("Starting 'manage' function!");
}

// Starts a connection on a port
db.connect((err) => {
    if(err) throw err;
    console.log(`Listening on port: ${PORT}`);

    // A little welcome box
    linebreak("=", 50);
    console.log("=== Welcome to the employee management system! ===");
    linebreak("=", 50);

    // Runs the program
    start();
})