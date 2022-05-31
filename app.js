const express = require('express');
const path = require('path');
const ErrorSerializer = require('./src/serializers/BaseSerializer');
const usersRouter = require('./src/routes/users');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/users', usersRouter);

app.set('views', path.join(__dirname, '/src/views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, '/src/public')));
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
