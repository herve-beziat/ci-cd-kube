const { execSync } = require('child_process');

module.exports = async () => {
  execSync('npm rebuild better-sqlite3', { stdio: 'inherit' });
};
