// Modules
const mysql = require("mysql");
const inquirer = require("inquirer");

// Variables
const PORT = process.env.PORT || 3306;
const mysqlUser = "Jon";
const mysqlPw = "123";
const database = "company";

// Creates connection to the specified database at the sepcified port
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
    // A little welcome box
    linebreak("=", 50);
    console.log("=== Welcome to the employee management system! ===");
    linebreak("=", 50);

    // Prompts the user
    inquirer.prompt(
        {
            type: "list",
            name: "start",
            message: "How would you like to start?",
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
            default: 
                console.log("Something went wrong...ending connection...");
                db.end();
        }
    })
}

// Starts the management process of employees
const manage = () => {
    console.log("Starting 'manage' function!");

    // array of choices here
    const choices = [
        "View All Employees",
        "View All Employees By Department",
        "View All Employees By Manager",
        new inquirer.Separator(),
        "Add Employee",
        "Update Employee Role",
        "Update Employee Manager",
        "Remove Employee",
        new inquirer.Separator(),
        "View All Roles",
        "Add Role",
        "Remove Role",
        new inquirer.Separator(),
        "View All Departments",
        "Add Department",
        "Remove Department",
        new inquirer.Separator(),
        "EXIT"
    ]

    // Array of questions here
    const question = [
        {
            type: "list",
            name: "manageList",
            message: "What would you like to do?",
            choices: choices,
        }
    ];

    inquirer.prompt(question).then((answers) => {
        switch(answers.manageList) {
            case "View All Employees":
                return viewEmployees();
            case "View All Employees By Department":
                return viewEmployeesDept();
            case "View All Employees By Manager":
                return viewEmployeesManager();
            default:
                db.end();
        };
    })
};

const viewEmployees = () => {
    console.log("View All Employees");

    db.query("SELECT ")
};

const viewEmployeesDept = () => {
    console.log("View All Employees Sort by Department");
};

const viewEmployeesManager = () => {
    console.log("View All Employees Sort By Manager");
};

const addEmployee = () => {
    console.log("Add an Employee");
};

const updateEmployeeRole = () => {
    console.log("Update Employee's Role");
};

const updateEmployeeManager = () => {
    console.log("Update Employee's Manager");
};

const viewDept = () => {
    console.log("Viewing All Department");
};

const addDept = () => {
    console.log("Add a department")
};

const removeDept = () => {
    console.log("Remove a department");
};

const viewRoles = () => {
    console.log("Viewing all roles");
};

const addRole = () => {
    console.log("Adding a role");
};

const removeRole = () => {
    console.log("Remove a role");
};

// Starts a connection
db.connect((err) => {
    if(err) throw err;
    console.log(`Listening on port: ${PORT}`);

    // Runs the program
    start();
});