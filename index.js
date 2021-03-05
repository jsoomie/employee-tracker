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
        };
    })
};

// puts the printing of result into a function to avoid repeating
const print = selector => {
    db.query(selector, (err,res) => {
        console.table(res);
        manage();
    })
}

const viewEmployees = () => {
    console.log("\nView All Employees");

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
    print(selector);
};

const viewEmployeesDept = () => {
    console.log("\nView All Employees Sort by Department");

    const selector = `
    SELECT

    department.name AS "department",
    employee.id, 
    CONCAT(employee.first_name, ' ', employee.last_name) AS "employee name",
    role.title, role.salary, 
    CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee 

    LEFT JOIN role on employee.role_id = role.id 
    LEFT JOIN department on role.department_id = department.id 
    LEFT JOIN employee manager on manager.id = employee.manager_id
    ORDER BY department.name;
    `;
    // Prints the query
    print(selector);
};

const viewEmployeesManager = () => {
    console.log("\nView All Employees Sort By Manager");

    const selector = `
    SELECT

    CONCAT(manager.first_name, ' ', manager.last_name) AS manager,
    employee.id, 
    CONCAT(employee.first_name, ' ', employee.last_name) AS "employee name",
    role.title, role.salary, 
    department.name AS "department"
    FROM employee

    LEFT JOIN role on employee.role_id = role.id 
    LEFT JOIN department on role.department_id = department.id 
    LEFT JOIN employee manager on manager.id = employee.manager_id
    ORDER BY manager;
    `;

    print(selector);
};

const addEmployee = () => {
    console.log("\nAdd an Employee");
};

const updateEmployeeRole = () => {
    console.log("\nUpdate Employee's Role");
};

const removeEmployee = () => {
    console.log("\nRemove Employee");
}

const updateEmployeeManager = () => {
    console.log("\nUpdate Employee's Manager");
};

const viewDept = () => {
    console.log("\nViewing All Department");

    const selector = `
    SELECT department.id, department.name FROM department ORDER BY id ASC;
    `;

    // Prints the query
    print(selector);
};

const addDept = () => {
    console.log("\nAdd a department")
};

const removeDept = () => {
    console.log("\nRemove a department");
};

const viewRoles = () => {
    console.log("\nViewing all roles");

    const selector = `
    SELECT role.id, role.title FROM role;
    `;

    print(selector);
};

const addRole = () => {
    console.log("\nAdding a role");
};

const removeRole = () => {
    console.log("\nRemove a role");
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

