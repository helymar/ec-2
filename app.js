const express = require('express');
const path = require('path');
const session = require('express-session');
const ErrorSerializer = require('./src/serializers/BaseSerializer');
const usersRouter = require('./src/routes/users');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/', usersRouter);
app.use(session({secret: 'keyboard cat',
resave: false,
saveUninitialized: true,
cookie: { secure: true }}));

app.set('views', path.join(__dirname, '/src/views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, '/src/public')));
app.use('/uploads', express.static('uploads'));
app.use('/csv', express.static('csv'));
app.use((req, res, next) => {
  res.status(404);
  res.json(new ErrorSerializer('Not found', null).toJSON());
});

app.use((err, req, res, next) => {
  const {
    statusCode = 500,
    message,
  } = err;

  res.status(statusCode);
  res.json(new ErrorSerializer(message, null).toJSON());
});

module.exports = app;
