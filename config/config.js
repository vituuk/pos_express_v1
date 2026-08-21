require('dotenv').config();

const dbHost = (process.env.DB_HOST || '').trim();
const useSSL = process.env.DB_SSL === 'true' || dbHost.includes('render.com');

const dialectOptions = useSSL
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  : {};

module.exports = {
  development: {
    username: (process.env.DB_USERNAME || '').trim(),
    password: (process.env.DB_PASSWORD || '').trim(),
    database: (process.env.DB_NAME || '').trim(),
    host: dbHost,
    dialect: (process.env.DB_DIALECT || 'postgres').trim(),
    dialectOptions
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql"
  },
  production: {
    username: (process.env.DB_USERNAME || '').trim(),
    password: (process.env.DB_PASSWORD || '').trim(),
    database: (process.env.DB_NAME || '').trim(),
    host: dbHost,
    dialect: (process.env.DB_DIALECT || 'postgres').trim(),
    dialectOptions
  }
};

 

 
//in local
// require('dotenv').config();

// module.exports = {
//   "development": {
//     "username": process.env.DB_USERNAME || "postgres",
//     "password": process.env.DB_PASSWORD || "postgres",
//     "database": process.env.DB_NAME,
//     "host": process.env.DB_HOST || "127.0.0.1",
//     "dialect": process.env.DB_DIALECT || "postgres"
//     // Removed dialectOptions block here so local machine connects without SSL
//   },
//   "test": {
//     "username": "root",
//     "password": null,
//     "database": "database_test",
//     "host": "127.0.0.1",
//     "dialect": "mysql"
//   },
//   "production": {
//     "username": process.env.DB_USERNAME,
//     "password": process.env.DB_PASSWORD,
//     "database": process.env.DB_NAME,
//     "host": process.env.DB_HOST,
//     "dialect": process.env.DB_DIALECT,
//     "dialectOptions": {
//       "ssl": {
//         "require": true,
//         "rejectUnauthorized": false
//       }
//     }
//   }
// };
