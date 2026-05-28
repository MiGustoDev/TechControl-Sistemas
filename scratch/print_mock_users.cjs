const { users } = require('../src/data/mock');
console.log("Mock users count:", users.length);
users.slice(0, 10).forEach(u => {
  console.log(`ID: ${u.id}, Username: ${u.username}, FullName: ${u.fullName}`);
});
