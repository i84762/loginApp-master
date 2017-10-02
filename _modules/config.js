const Confidence = require('confidence');
const Dotenv = require('dotenv');

Dotenv.config({ silent: true });

const criteria = {
  env: process.env.NODE_ENV,
};

const config = {
  noReplyEmail: {
    $filter: 'env',
    production: 'simpletestmail1@gmail.com',
    $default: 'simpletestmail1@gmail.com',
  },
  queue: {
    // user :
    // {
    findAndUpdate: {
      $filter: 'env',
      production: 'findAndUpdate',
      $default: 'findAndUpdate',
    },
    findById: {
      $filter: 'env',
      production: 'findById',
      $default: 'findById',
    },
    findByFilter: {
      $filter: 'env',
      production: 'findByFilter',
      $default: 'findByFilter',
    },
    forgotPassword: {
      $filter: 'env',
      production: 'forgotPassword',
      $default: 'forgotPassword',
    },
    resetPassword: {
      $filter: 'env',
      production: 'resetPassword',
      $default: 'resetPassword',
    },
    verifyUser: {
      $filter: 'env',
      production: 'verifyUser',
      $default: 'verifyUser',
    },
    findOrCreate: {
      $filter: 'env',
      production: 'findOrCreate',
      $default: 'findOrCreate',
    },
    register: {
      $filter: 'env',
      production: 'register',
      $default: 'register',
    },
    mailer: {
      $filter: 'env',
      production: 'mailerQueue',
      $default: 'mailerQueue',
    },
    //     }
    // ,
    login: {
      $filter: 'env',
      production: 'login',
      $default: 'login',
    },
    port: {
      $filter: 'env',
      production: '61613',
      test: '61613',
      dev: '61613',
      $default: '61613',
    },
    user: {
      $filter: 'env',
      production: 'user',
      test: 'user',
      dev: 'user',
      $default: 'user',
    },
    password: {
      $filter: 'env',
      production: 'pass',
      test: 'pass',
      dev: 'pass',
      $default: 'pass',
    },
    database: {
      $filter: 'env',
      production: 'master',
      test: 'master',
      dev: 'master',
      $default: 'master',
    },
  }
};


const store = new Confidence.Store(config);

exports.get = function (key) {
  return store.get(key, criteria);
};


exports.meta = function (key) {
  return store.meta(key, criteria);
};

