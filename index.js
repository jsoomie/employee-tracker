// Modules
const mysql = require("mysql");
const inquirer = require("inquirer");

const PORT = process.env.PORT || 3306;
const mysqlUser = "Jon";
const mysqlPw = "123";
const database = "company";

const db = mysql.createConnection({
    host: "localhost",
    port: PORT,
    user: mysqlUser,
    password: mysqlPw,
    database: database
})

const linebreak = (symbol = "-", repeatTime = 35) => console.log(`\n${symbol.repeat(repeatTime)}\n`);

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

const manage = () => {
    console.log("Starting 'manage' function!");
}

db.connect((err) => {
    if(err) throw err;
    console.log(`Listening on port: ${PORT}`);

    linebreak("=", 50);
    console.log("=== Welcome to the employee management system! ===");
    linebreak("=", 50);

    start();
})