const fs = require('fs').promises;
const bcrypt = require('bcrypt');
const path = require('path');

const FILE_PATH = path.join(__dirname, '../src/data/users.json');

async function hashPasswords() {
  try {
    const data = await fs.readFile(FILE_PATH, 'utf8');
    const users = JSON.parse(data);

    for (const user of users) {
      user.password = await bcrypt.hash(user.password, 10);
    }

    await fs.writeFile(FILE_PATH, JSON.stringify(users, null, 2));
    console.log('Passwords hashed successfully!');
  } catch (error) {
    console.error('Error hashing passwords:', error);
  }
}

hashPasswords();