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

const addEmployee = () => {
    console.log("\nAdd an Employee\n");

    db.query(`SELECT role.id, role.title FROM role;`, (err, res) => {
        if(err) throw err;

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
            const roleID = `${answers.role}`.split(" ")[0];

            db.query(`INSERT INTO employee(first_name, last_name, role_id) VALUES ("${firstName}", "${lastName}", ${roleID});`);

            db.query(`SELECT employee.id, CONCAT(first_name, ' ', last_name) AS employee FROM employee;`, (err, res) => {
                if(err) throw err;
                const itemsManager = res.map(item => `${item.id} ${item.employee}`);

                inquirer.prompt([
                    {
                        type: "list",
                        name: "addManager",
                        message: `Choose the manager for ${firstName} ${lastName}`,
                        choices: itemsManager
                    }
                ]).then((answersManager) => {
                    const managerID = `${answersManager.addManager}`.split(" ")[0];

                    db.query(`UPDATE employee SET manager_id = ${managerID} WHERE CONCAT(employee.first_name, ' ', employee.last_name) = "${firstName} ${lastName}"`);

                    console.log(`\nAdded ${firstName} ${lastName} into the work roster!\n`);

                    linebreak();

                    manage();
                })
            })
        })
    });
};

const updateEmployeeRole = () => {
    console.log("\nUpdate Employee's Role\n");

    db.query(`SELECT * FROM employee;`, (err, res) => {
        if(err) throw err;

        const employeeFullName = res.map(fullName => `${fullName.id} ${fullName.first_name} ${fullName.last_name}`);

        inquirer.prompt([
            {
                type: "list",
                name: "employee",
                message: "Please first choose an employee to adjust their role",
                choices: employeeFullName
            }
        ]).then((answers) => {

            const employeeChoice = answers.employee;
            const employeeChoiceID = `${answers.employee}`.split(" ")[0];

            db.query(`SELECT id, title FROM role;`, (err, res) => {
                if(err) throw err;

                const roleQuery = res.map(role => `${role.id} ${role.title}`);

                inquirer.prompt([
                    {
                        type: "list",
                        name: "role",
                        message: (answer) => `Please choose the role for employee ${employeeChoice}`,
                        choices: roleQuery
                    }
                ]).then((answerR) => {
                    const roleChoice = `${answerR.role}`.split(" ")[0];
                    const roleName = `${answerR.role}`.split(" ")[1];

                    console.log(`${employeeChoice[0]}`);

                    db.query(`UPDATE employee SET employee.role_id = ${roleChoice} WHERE employee.id = ${employeeChoiceID}`);

                    console.log(`Updating ${employeeChoice} with the role of ${roleName}`);

                    linebreak();

                    manage();

                })
            })
        })
    })
};

const removeEmployee = () => {
    console.log("\nRemove Employee\n");

    db.query(`SELECT employee.id, employee.first_name, employee.last_name FROM employee;`, (err, res) => {
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
            switch(answer.confirm) {
                case true:

                    const words = `${answer.nameList}`.split(" ");
                    const id = words[0];

                    const fullName = `${words[1]} ${words[2]}`;

                    db.query(`DELETE FROM employee WHERE employee.id = ${id};`, (err, res) => {
                        console.log(`\n${fullName} has been removed from the roster!\n`);
                        manage();
                    })
                    break;
                default: 
                    console.log("Returning to options...");

                    linebreak();

                    manage();
            }
        })
    })
};

const updateEmployeeManager = () => {
    console.log("\nUpdate Employee's Manager\n");

    db.query(`SELECT * FROM employee;`,(err, res) => {
        if(err) throw err;

        
    })
};

const viewDept = () => {
    console.log("\nViewing All Department\n");

    const selector = `
    SELECT department.id, department.name FROM department ORDER BY id ASC;
    `;

    // Prints the query
    print(selector);
};

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
        console.log(answers.deptname);
        db.query(`INSERT INTO department(name) VALUES ("${answers.deptname}");`);
        console.log(`\n${answers.deptname} has been added to Department list!\n`)

        linebreak();

        manage();
    })
};

const removeDept = () => {
    console.log("\nRemove a department\n");

    db.query(`SELECT department.name FROM department;`, (err, res) => {
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
                switch(answer.confirm) {
                    case false: 
                        console.log("Returning to options...");
                        break;
                    default: 
                        console.log(`\nDELETING DEPARTMENT "${answer.deptname}"...\n`);
                        db.query(`DELETE FROM department WHERE department.name = "${answer.deptname}";`);

                        linebreak();

                        manage();
                }
        })
    })
};

const viewRoles = () => {
    console.log("\nViewing all roles\n");

    const selector = `
    SELECT role.id, role.title FROM role;
    `;

    print(selector);
};

const addRole = () => {
    console.log("\nAdding a role\n");

    db.query(`SELECT * FROM department;`, (err, res) => {
        if(err) throw err;

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
            switch(answers.confirmation) {
                case true:
                    const role = answers.newRole;
                    const salary = answers.newSalary;

                    const idWord = `${answers.department}`.split(" ");
                    const idDept = idWord[0];

                    db.query(`INSERT INTO role(title, salary, department_id) VALUES ("${role}", ${salary}, ${idDept})`);

                    console.log(`\n${role} has been added to the role roster!`);

                    linebreak();
                    manage();
                    break;

                default: 
                    console.log("Returning to options...");
                    linbreak();
                    manage();
                    break;
            };
        });
    });
};

const removeRole = () => {
    console.log("\nRemove a role\n");

    db.query(`SELECT id, title FROM role;`, (err, res) => {
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
            const roleID = `${answers.roleChoice}`.split(" ")[0];
            const roleName = `${answers.roleChoice}`.split(" ")[1];
            switch(answers.confirmation) {
                case true:
                    console.log(`Removing ${roleName} from the roster...`);
                    db.query(`DELETE FROM role WHERE id = ${roleID}`);
                    linebreak();
                    manage();
                    break;
                default:
                    console.log("Returning to options...");
                    linebreak();
                    manage();
            };
        });
    });
};

const exitProgram = () => {
    console.log("\nDisconnecting...");
    console.log("Goodbye!\n");
    db.end();
};

// Starts a connection
db.connect((err) => {
    if(err) throw err;
    console.log(`Listening on port: ${PORT}`);

    // Runs the program
    start();
});

