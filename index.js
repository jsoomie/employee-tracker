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
});

// Breaks line
const linebreak = (symbol = "-", repeatTime = 35) => console.log(`\n${symbol.repeat(repeatTime)}\n`);

// puts the printing of result into a function to avoid repeating
const print = selector => {
    db.query(selector, (err, res) => {
        if(err) throw err;
        console.table(res);
        manage();
    })
};

//Validates letters and numbers
const noSymbols = (input) => {
    const regex = /^[a-zA-Z]+$/;
    if(input.match(regex)) {
        return true;
    }
    return 'No symbols are allowed for names!';
};

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
            choices: 
            [
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
            case "EXIT":
                exitProgram();
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

// Views all employees with ttheir managers and depts
const viewEmployees = () => {
    console.log("\nView All Employees\n");
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

// View all employees with departments as order
const viewEmployeesDept = () => {
    console.log("\nView All Employees Sort by Department\n");
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


// Views all employess ordered by their manager
const viewEmployeesManager = () => {
    console.log("\nView All Employees Sort By Manager\n");
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

// Add new employees
const addEmployee = () => {
    console.log("\nAdd an Employee\n");
    // Queries database to grab id, title
    db.query(`SELECT role.id, role.title FROM role;`, (err, res) => {
        if(err) throw err;
        // Maps out the query to id and title
        const items = res.map(items => `${items.id} ${items.title}`);
        inquirer.prompt([
            {
                type: "input",
                name: "firstName",
                message: "Please Enter Employee's First Name: ",
            },
            {
                type: "input",
                name: "lastName",
                message: "Please Enter Employee's Last Name: ",
            },
            {
                type: "list",
                name: "role",
                message: "Please Choose the Employee's Role: ",
                choices: items
            }
        ]).then((answers) => {
            const firstName = answers.firstName;
            const lastName = answers.lastName;
            const roleID = `${answers.role}`.split(" ")[0]; // grabs the id that was leading with the choices in the array
            // Inserts given info into the database
            db.query(`INSERT INTO employee(first_name, last_name, role_id) VALUES ("${firstName}", "${lastName}", ${roleID});`);
            // Grabs employees id first and last name
            db.query(`SELECT employee.id, CONCAT(first_name, ' ', last_name) AS employee FROM employee;`, (err, res) => {
                if(err) throw err;
                // Maps query
                const itemsManager = res.map(item => `${item.id} ${item.employee}`);
                inquirer.prompt([
                    {
                        type: "list",
                        name: "addManager",
                        message: `Choose the manager for ${firstName} ${lastName}`,
                        choices: itemsManager
                    }
                ]).then((answersManager) => {
                    //Grabs the managerID from the query choice by splitting the array
                    const managerID = `${answersManager.addManager}`.split(" ")[0];
                    // UPdates the employee with the manager
                    db.query(`UPDATE employee SET manager_id = ${managerID} WHERE CONCAT(employee.first_name, ' ', employee.last_name) = "${firstName} ${lastName}"`);
                    console.log(`\nAdded ${firstName} ${lastName} into the work roster!\n`);
                    linebreak();
                    manage();
                })
            })
        })
    });
};

// Updates existing employee role
const updateEmployeeRole = () => {
    console.log("\nUpdate Employee's Role\n");
    // Queries database from employee
    db.query(`SELECT * FROM employee;`, (err, res) => {
        if(err) throw err;
        // pulls in id first and last name into one variable
        const employeeFullName = res.map(fullName => `${fullName.id} ${fullName.first_name} ${fullName.last_name}`);
        inquirer.prompt([
            {
                type: "list",
                name: "employee",
                message: "Please first choose an employee to adjust their role",
                choices: employeeFullName
            }
        ]).then((answers) => {
            // Puts choice into a variable
            const employeeChoice = answers.employee;
            // Splitting the array to grab the id of the choice
            const employeeChoiceID = `${answers.employee}`.split(" ")[0];
            //Quries role database
            db.query(`SELECT id, title FROM role;`, (err, res) => {
                if(err) throw err;
                // maps id and title to roleQuery
                const roleQuery = res.map(role => `${role.id} ${role.title}`);
                inquirer.prompt([
                    {
                        type: "list",
                        name: "role",
                        message: (answer) => `Please choose the role for employee ${employeeChoice}`,
                        choices: roleQuery
                    }
                ]).then((answerR) => {
                    // Pulls out id
                    const roleChoice = `${answerR.role}`.split(" ")[0];
                    // Pulls out role title
                    const roleName = `${answerR.role}`.split(" ")[1];
                    // Updates db of employee with the new role
                    db.query(`UPDATE employee SET employee.role_id = ${roleChoice} WHERE employee.id = ${employeeChoiceID}`);
                    console.log(`Updating ${employeeChoice} with the role of ${roleName}`);
                    linebreak();
                    manage();
                })
            })
        })
    })
};

// Removes Employees
const removeEmployee = () => {
    console.log("\nRemove Employee\n");
    // Quries employee
    db.query(`SELECT employee.id, employee.first_name, employee.last_name FROM employee;`, (err, res) => {
        if(err) throw err;
        // maps the query
        const query = res.map(item => `${item.id} ${item.first_name} ${item.last_name}`);
        inquirer.prompt([
            {
                type: "list",
                name: "nameList",
                message: "Which Employee Would You Like To Remove?",
                choices: query
            },
            {
                type: "confirm",
                name: "confirm",
                message: (answer) => `\nCONFIRM: Do you wish to remove ID#${answer.nameList} from your employment?\n`
            }
        ]).then((answer) => {
            // Using switch for confirmation
            switch(answer.confirm) {
                case true:
                    // putting it into an array
                    const words = `${answer.nameList}`.split(" ");
                    // Pulls the id from the array
                    const id = words[0];
                    // Gets full name out of the array
                    const fullName = `${words[1]} ${words[2]}`;
                    // Deletes the employee by their id
                    db.query(`DELETE FROM employee WHERE employee.id = ${id};`, (err, res) => {
                        if(err) throw err;
                        console.log(`\n${fullName} has been removed from the roster!\n`);
                        linebreak();
                        manage();
                    })
                default: 
                    // if they deny confirmation/ go here
                    console.log("Returning to options...");
                    linebreak();
                    manage();
            }
        })
    })
};

// Update existing employee
const updateEmployeeManager = () => {
    console.log("\nUpdate Employee's Manager\n");
    // Query db
    db.query(`SELECT * FROM employee;`,(err, res) => {
        if(err) throw err;
        // maps query
        const query = res.map(employee => `${employee.id} ${employee.first_name} ${employee.last_name}`);
        inquirer.prompt([
            {
                type: "list",
                name: "employeeChoice",
                message: "Please choose an employee to update",
                choices: query
            }
        ]).then((answer) => {
            // putting answer into a var
            const employee = answer.employeeChoice;
            // Grabs the id
            const employeeID = `${employee}`.split(" ")[0];
            // grabs the name
            const employeeName = `${employee}`.split(" ").slice(1).join(" ");
            inquirer.prompt([
                {
                    type: "list",
                    name: "managerChoice",
                    message: (answer) => `Please choose the new manager for ${employeeName}`,
                    choices: query
                }
            ]).then((answers) => {
                // var input
                const manager = answers.managerChoice;
                // grabs the id of manager
                const managerID = `${manager}`.split(" ")[0];
                // grabs the managers name from the array
                const managerName = `${manager}`.split(" ").slice(1).join(" ");
                // Updates the db of a new manager against employee id
                db.query(`UPDATE employee SET manager_id = ${managerID} WHERE id = ${employeeID};`);
                console.log(`\nUpdated employee ${employeeName} with a new manager: ${managerName}\n`);
                linebreak();
                manage();
            })
        })
    })
};

// views all dept in a table
const viewDept = () => {
    console.log("\nViewing All Department\n");
    const selector = `
    SELECT department.id, department.name FROM department ORDER BY id ASC;
    `;
    // Prints the query
    print(selector);
};

// adds a new department
const addDept = () => {
    console.log("\nAdd a department\n")
    inquirer.prompt(
        {
            type: "input",
            name: "deptname",
            message: "Please Enter New Department Name: ",
            validate: noSymbols
        }
    ).then((answers) => {
        // Insert data into database
        db.query(`INSERT INTO department(name) VALUES ("${answers.deptname}");`);
        console.log(`\n${answers.deptname} has been added to Department list!\n`)
        linebreak();
        manage();
    })
};

// Removes a department
const removeDept = () => {
    console.log("\nRemove a department\n");
    // queries database
    db.query(`SELECT department.name FROM department;`, (err, res) => {
        if(err) throw err;
        // maps query
        const choices = res.map(item => item.name);
        inquirer.prompt(
            {
                type: "list",
                name: "deptname",
                message: "Please Choose Which Department You Wish To Remove: ",
                choices: choices
            },
            {
                type: "confirm",
                name: "confirm",
                message: (answer) => `Do You Wish To Delete ${answer.deptname}?`
            }
        ).then((answer) => {
                // switch to confirm
                switch(answer.confirm) {
                    case false: 
                        // returns to menu
                        console.log("Returning to options...");
                        manage();
                    default: 
                        console.log(`\nDELETING DEPARTMENT "${answer.deptname}"...\n`);
                        // Deletes the department
                        db.query(`DELETE FROM department WHERE department.name = "${answer.deptname}";`);
                        linebreak();
                        manage();
                }
        })
    })
};

// views all roles
const viewRoles = () => {
    console.log("\nViewing all roles\n");
    const selector = `
    SELECT role.id, role.title FROM role;
    `;
    print(selector);
};

// add a new role
const addRole = () => {
    console.log("\nAdding a role\n");
    // queries db
    db.query(`SELECT * FROM department;`, (err, res) => {
        if(err) throw err;
        // maps query
        const viewDepts = res.map(dept => `${dept.id} ${dept.name}`);
        inquirer.prompt([
            {
                type: "input",
                name: "newRole",
                message: "Enter Name of New Role: ",
                validate: noSymbols
            },
            {
                type: "number",
                name: "newSalary",
                message: "Enter Estimate of Salary: "
            },
            {
                type: "list",
                name: "department",
                message: "Please Enter Which Department this role is associated with",
                choices: viewDepts
            },
            {
                type: "confirm",
                name: "confirmation",
                message: (answer) => `CONFIRM: Create a new role called ${answer.newRole}?`
            }
        ]).then((answers) => {
            //switch confirm
            switch(answers.confirmation) {
                case true:
                    // puts answers in variables
                    const role = answers.newRole;
                    const salary = answers.newSalary;
                    // grabs dept name and id into their vars
                    const idWord = `${answers.department}`.split(" ");
                    const idDept = idWord[0];
                    // puts data into database
                    db.query(`INSERT INTO role(title, salary, department_id) VALUES ("${role}", ${salary}, ${idDept})`);
                    console.log(`\n${role} has been added to the role roster!\n`);
                    linebreak();
                    manage();
                default:
                    // Returns to options
                    console.log("Returning to options...");
                    linbreak();
                    manage();
            };
        });
    });
};

// Removes an existing role
const removeRole = () => {
    console.log("\nRemove a role\n");
    // Queries it and title from role
    db.query(`SELECT id, title FROM role;`, (err, res) => {
        if(err) throw err;
        // maps query
        const rolesList = res.map(role => `${role.id} ${role.title}`);
        inquirer.prompt([
            {
                type: "list",
                name: "roleChoice",
                message: "Please select a role to remove",
                choices: rolesList
            },
            {
                type: "confirm",
                name: "confirmation",
                message: (answer) => `CONFIRM: Remove ${answer.rolesChoice} from the roster?`
            }
        ]).then((answers) => {
            // puts role id and name into vars from the array
            const roleID = `${answers.roleChoice}`.split(" ")[0];
            const roleName = `${answers.roleChoice}`.split(" ")[1];
            switch(answers.confirmation) {
                case true: // after confirmation remove the role from db
                    console.log(`Removing ${roleName} from the roster...`);
                    db.query(`DELETE FROM role WHERE id = ${roleID}`);
                    linebreak();
                    manage();
                    break;
                default: // returns to menu
                    console.log("Returning to options...");
                    linebreak();
                    manage();
            };
        });
    });
};

// Exits the program
const exitProgram = () => {
    console.log("\nDisconnecting...");
    console.log("Goodbye!\n");
    db.end();
};

// Starts a connection
db.connect((err) => {
    if(err) throw err;
    // just loggin which port we are on
    console.log(`Listening on port: ${PORT}`);
    // Runs the program
    start();
});