// Modules
const mysql = require("mysql");
const inquirer = require("inquirer");
require("console.table"); // Brings in console.table to view consolelogs data as a table

// Variables // hide in .env
const hostname = "localhost";
const PORT = process.env.PORT || 3306;
const mysqlUser = "Jon";
const mysqlPw = "123";
const database = "company";

// Creates connection to the specified database at the sepcified port
const db = mysql.createConnection({
    host: hostname,
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
                exitProgram();
                break;
            default: 
                console.log("Something went wrong...ending connection...");
                exitProgram();
        }
    })
}

// Starts the management process of employees
const manage = () => {
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
            case "Add Employee":
                return addEmployee();
            case "Update Employee Role":
                return updateEmployeeRole();
            case "Update Employee Manager":
                return updateEmployeeManager();
            case "Remove Employee":
                return removeEmployee();
            case "View All Roles":
                return viewRoles();
            case "Add Role":
                return addRole();
            case "Remove Role":
                return removeRole();
            case "View All Departments":
                return viewDept();
            case "Add Department":
                return addDept();
            case "Remove Department":
                return removeDept();
            default:
                exitProgram();
                break();
        };
    })
};

const viewEmployees = () => {
    console.log("View All Employees");

    const selector = `
    SELECT

    employee.id, 
    CONCAT(employee.first_name, ' ', employee.last_name) AS "employee name",
    role.title, role.salary, 
    department.name AS "department", 
    CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee

    LEFT JOIN role on employee.role_id = role.id 
    LEFT JOIN department on role.department_id = department.id 
    LEFT JOIN employee manager on manager.id = employee.manager_id;
    `
    // Prints out the results of the query
    db.query(selector, (err, result) => {
        console.table(result);
        manage();
    })
};

const viewEmployeesDept = () => {
    console.log("View All Employees Sort by Department");

    const selector = `
    SELECT 
    `

    db.query()
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

const removeEmployee = () => {
    console.log("Remove Employee");
}

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

const exitProgram = () => {
    console.log("\nDisconnecting...");
    console.log("Goodbye!\n");
    db.end();
}

// Starts a connection
db.connect((err) => {
    if(err) throw err;
    console.log(`Listening on port: ${PORT}`);

    // Runs the program
    start();
});

