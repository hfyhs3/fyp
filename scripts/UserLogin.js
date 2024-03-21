const fs = require('fs');
const path = require('path');
const readline = require('readline');

const usersFilePath = path.join(__dirname, 'users.json');
const sessionFilePath = path.join(__dirname, 'session.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const loadUsers = () => {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data).users;
}

const saveUsers = (users) => {
    const data = JSON.stringify({ users }, null, 2);
    fs.writeFileSync(usersFilePath, data);
}

const UserExists = (id) => {
    const users = loadUsers();
    return users.find(user => user.id === id);
};

const handleNew = () => {
    rl.question('Enter your new ID: ', (id) => {
        if (UserExists(id)) {
          console.log('User ID already exists. Please try logging in or use a different ID.');
          rl.close();
          return;
        }
        rl.question('Enter your new password: ', (password) => {
          const users = loadUsers();
          users.push({ id, password }); // hash the password 
          saveUsers(users);
          console.log(`New user created with ID: ${id}`);
          fs.writeFileSync(sessionFilePath, JSON.stringify({ userId: id }), 'utf8');
          rl.close();
        });
      });
    };

    const handleExistingUser = () => {
        rl.question('Enter your ID: ', (id) => {
          if (!UserExists(id)) {
            console.log('No such user found. Please try again or create a new account.');
            rl.close();
            return;
          }
          rl.question('Enter your password: ', (password) => {
            // Additional logic to validate password can be implemented here
            console.log(`User logged in with ID: ${id}`);
            fs.writeFileSync(sessionFilePath, JSON.stringify({ userId: id }), 'utf8');
            rl.close();
          });
        });
      };

    const main = () => {
        rl.question('Are you a new or existing user? (new/existing): ', (answer) => {
          if (answer.toLowerCase() === 'new') {
            handleNew();
          } else if (answer.toLowerCase() === 'existing') {
            handleExistingUser();
          } else {
            console.log('Invalid input. Please type "new" or "existing".');
            rl.close();
          }
        });
      };
      
    main();