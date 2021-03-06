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
    return 'No symbols are allowed for department names!';
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
            const str = answers.role;
            const word = str.split(" ");
            const roleID = word[0];
            const roleTitle = word[1];

            db.query(`INSERT INTO employee(first_name, last_name, role_id) VALUES ("${firstName}", "${lastName}", ${roleID});`);
            db.query(`SELECT employee.id, CONCAT(first_name, ' ', last_name) AS employee FROM employee;`, (err, res) => {
                if(err) throw err;
                const items1 = res.map(item => `${item.id} ${item.employee}`);

                inquirer.prompt([
                    {
                        type: "list",
                        name: "addManager",
                        message: `Choose the manager for ${firstName} ${lastName}`,
                        choices: items1
                    }
                ]).then((answersManager) => {
                    const managerStr = answersManager.addManager;
                    const managerWord = managerStr.split(" ");
                    const managerID = managerWord[0];
                    const managerName = `${managerWord[1]} ${managerWord[2]}`;

                    console.log(managerID);
                    console.log(managerName);

                    db.query(`UPDATE employee SET manager_id = ${managerID} WHERE CONCAT(employee.first_name, ' ', employee.last_name) = "${firstName} ${lastName}"`);

                    console.log(`Added ${firstName} ${lastName} into the work roster!`);

                    linebreak();

                    manage();
                })
            })
        })


        // .then((answers) => {
        //     switch(answers.confirmation) {
        //         case true:
        //             db.query(`INSERT INTO employee(first_name, last_name, role_id) VALUES ("${answers.firstName}", "${answers.lastName}", ${answers.role});`);
        //             db.query(`SELECT employee.id, CONCAT(first_name, ' ', last_name) AS employee FROM employee;`, (err, res) => {
        //                 if(err) throw err;
        //                 inquirer.prompt(
        //                     {
        //                         type: "rawlist",
        //                         name: "addManager",
        //                         message: `Who manages ${answers.firstName} ${answers.lastName}?`,
        //                         choices: res.map(item => item.employee)
        //                     }
        //                 ).then((answers) => {
        //                     console.log(answers.addManager);
        //                     const fullName = `${answers.firstName} ${answers.lastName}`;
        //                     db.query(`SELECT employee.id FROM employee WHERE CONCAT(employee.first_name, ' ',employee.last_name) = "${answers.addManager}";`, (err, res) => {
        //                         const managerID = JSON.parse(JSON.stringify(res[0].id));
        //                         db.query(`UPDATE employee SET manager_id = ${managerID} WHERE CONCAT(employee.first_name, ' ',employee.last_name) = "${fullName}"`);
        //                         console.log(`${fullName} has been added to the roster.`);

        //                         linebreak();

        //                         manage();
        //                     })
        //                 })
        //             })
        //             break;
        //         default:
        //             linebreak();
        //             console.log("Returning to options...");
        //             manage();
        //             break;
        //     }
        // })
    });
};

const updateEmployeeRole = () => {
    console.log("\nUpdate Employee's Role\n");
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
                message: (answer) => `CONFIRM: Do you wish to remove ID#${answer.nameList} from your employment?`
            }
        ]).then((answer) => {
            switch(answer.confirm) {
                case true:
                    console.log(answer.nameList);

                    const str = answer.nameList;
                    const words = str.split(" ");
                    const id = words[0];
                    const fullName = `${words[1]} ${words[2]}`;

                    console.log(words[0]);
                    console.log(fullName);

                    // db.query(`DELETE FROM employee WHERE employee.id = ${id};`, (err, res) => {
                    //     console.log(`${fullName} has been removed from the roster!`);
                    // })
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
        console.log(`${answers.deptname} has been added to Department list!`)

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
};

const removeRole = () => {
    console.log("\nRemove a role\n");
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

