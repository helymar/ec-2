const { v4: uuid } = require('uuid');
const ApiError = require('../utils/ApiError');

const { User } = require('../database/models');
const { generateAccessToken, blacklistTokenInser } = require('../services/jwt');

const UserSerializer = require('../serializers/UserSerializer');
const AuthSerializer = require('../serializers/AuthSerializer');
const UsersSerializer = require('../serializers/UsersSerializer');
const transporter = require('../lib/nodemailer');

const { ROLES } = require('../config/constants');

const findUser = async (where) => {
  Object.assign(where, { active: true });

  const user = await User.findOne({ where });
  if (!user) {
    throw new ApiError('User not found', 404);
  }

  return user;
};

const findUserexist = async (where) => {
  Object.assign(where, { active: true });

  const user = await User.findOne({ where });
  return user;
};

const getAllUsers = async (req, res, next) => {
  try {
    req.isRole(ROLES.admin);

    const users = await User.findAll({ ...req.pagination });

    res.json(new UsersSerializer(users, await req.getPaginationInfo(User)));
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { body } = req;

    if (body.password !== body.passwordConfirmation) {
      throw new ApiError('Passwords do not match', 400);
    }

    const userPayload = {
      username: body.username,
      email: body.email,
      name: body.name,
      password: body.password,
    };

    if (Object.values(userPayload).some((val) => val === undefined)) {
      throw new ApiError('Payload must contain name, username, email and password', 400);
    }

    let email = await findUserexist({ email: userPayload.email });
    let username = await findUserexist({ username: userPayload.username });
    console.log(email, username);
    if ((email) || (username)) {
      console.log('nok');
      throw new ApiError('nok (User already exists)', 400);
      
    }else{
      const user = await User.create(userPayload);
      console.log('ok');
      res.json(new UserSerializer(user));
    }
      
    
    
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { params } = req;

    const user = await findUser({ id: Number(params.id) });

    res.json(new UserSerializer(user));
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { params, body } = req;

    const userId = Number(params.id);
    req.isUserAuthorized(userId);

    const user = await findUser({ id: userId });

    const userPayload = {
      username: body.username,
      email: body.email,
      name: body.name,
    };

    if (Object.values(userPayload).some((val) => val === undefined)) {
      throw new ApiError('Payload can only contain username, email or name', 400);
    }

    Object.assign(user, userPayload);

    await user.save();

    res.json(new UserSerializer(user));
  } catch (err) {
    next(err);
  }
};

const deactivateUser = async (req, res, next) => {
  try {
    const { params } = req;

    const userId = Number(params.id);
    req.isUserAuthorized(userId);

    const user = await findUser({ id: userId });

    Object.assign(user, { active: false });

    await user.save();

    res.json(new UserSerializer(null));
  } catch (err) {
    next(err);
  }
};

const deleteall = async (req, res, next) => {
  try {

    const users = await User.destroy({ where: {} });
    console.log('ok (delete all)');
    res.json('ok (delete all)');
  } catch (err) {
    console.log('nok (delete all)');
    res.json('nok (delete all)');
    next(err);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { body } = req;

    const user = await findUser({ username: body.username });

    if (!(await user.comparePassword(body.password))) {
      console.log('nok');
      throw new ApiError('nok (User not found)', 400);
    }
    const userPayload = {
      lastLoginDate: new Date(),
    };

    Object.assign(user, userPayload);

    await user.save();

    const accessToken = generateAccessToken(user.id, user.role);
    console.log(user.id);
    res.json(new AuthSerializer(accessToken, user.id));
  } catch (err) {
    next(err);
  }
};

const updatepassword = async (req, res, next) => {
  try {
    const { body } = req;

    if (body.password === undefined || body.passwordConfirmation === undefined) {
      throw new ApiError('Bad request', 400);
    }

    if (body.password !== body.passwordConfirmation) {
      throw new ApiError('Passwords do not match', 400);
    }
    const user = await findUser({ id: req.user.id });

    const userPayload = {
      password: body.password,
    };

    Object.assign(user, userPayload);

    await user.save();

    res.json(new UserSerializer(user));
  } catch (err) {
    next(err);
  }
};

const sendpassword = async (req, res, next) => {
  try {
    const { body } = req;

    if (body.username === undefined) {
      throw new ApiError('Bad request', 400);
    }

    const user = await findUser({ username: body.username });

    const userEmail = user.dataValues.email;

    const userPayload = {
      token: uuid(),
    };

    Object.assign(user, userPayload);

    await user.save();

    const info = await transporter.sendMail({
      from: '"Trinos-API" <helymara@uninorte.edu.co>', // sender address
      to: userEmail, // list of receivers
      subject: 'Solicitud de restablecimiento de contraseña', // Subject line
      html: `<b>Hola,</b>
        <p>Se solicito el restablecimiento de su contraseña el token es: </p>
        <br>${userPayload.token}</br>
        <p>En caso de que usted no haya solicitado este cambio contacte a soporte</p>
        <p>Atentamente, <br>  
        Trinos-API</p>`, // html body
    });

    res.json(new UserSerializer(null));
  } catch (err) {
    next(err);
  }
};

const resetpassword = async (req, res, next) => {
  try {
    const { body } = req;

    if (body.password === undefined || body.token === undefined) {
      if (body.passwordConfirmation === undefined) {
        throw new ApiError('Bad request', 400);
      }
      throw new ApiError('Bad request', 400);
    }

    if (body.password !== body.passwordConfirmation) {
      throw new ApiError('Passwords do not match', 400);
    }

    const user = await findUser({ token: body.token });

    const userPayload = {
      password: body.password,
      token: null,
    };

    Object.assign(user, userPayload);

    await user.save();

    res.json(new UserSerializer(user));
  } catch (err) {
    next(err);
  }
};
const loginform = async (req, res, next) => {
  res.render('login');
}
const registrerform = async (req, res, next) => {
  res.render('registro');
}
const createUserform = async (req, res, next) => {
  try {
    const { body } = req;

    const userPayload = {
      username: body.username,
      password: body.Password,
    };

    if (Object.values(userPayload).some((val) => val === undefined)) {
      res.send('<script>alert("Payload must contain name, username, email and password"); window.location.href = "/registro"; </script>');
    }

    let username = await findUserexist({ username: userPayload.username });
    if (username) {
      res.send('<script>alert("nok"); window.location.href = "/registro"; </script>');

    }else{
      const user = await User.create(userPayload);
      res.send('<script>alert("ok"); window.location.href = "/registro"; </script>');
    }
      
    
    
  } catch (err) {
    next(err);
  }
};

const loginUser2 = async (req, res, next) => {
  try {
    const { body } = req;

    const user = await findUser({ username: body.username });

    if (!(await user.comparePassword(body.Password))) {
      res.send('<script>alert("nok"); window.location.href = "/login"; </script>');
    }
    const userPayload = {
      lastLoginDate: new Date(),
    };

    Object.assign(user, userPayload);

    await user.save();

    const accessToken = generateAccessToken(user.id);
    new AuthSerializer(accessToken, user.id)
 
    res.send('<script>alert("'+user.id+'"); window.location.href = "/inicio"; </script>');
  } catch (err) {
    next(err);
  }
};

const dasboardhome = async (req, res, next) => {
  res.render('dashboard');
}
const deleteallusers = async (req, res, next) => {
  try {

    const users = await User.destroy({ where: {} });
    res.send('<script>alert("ok (delete all)"); window.location.href = "/login"; </script>');
  } catch (err) {
    res.send('<script>alert("nok (delete all)"); window.location.href = "/login"; </script>');
    next(err);
  }
};

const logoutUser = async (req, res, next) => {
  const accessToken = req.headers.authorization?.split(' ')[1];
  blacklistTokenInser(accessToken);
  res.json(new UserSerializer(null));
};

module.exports = {
  createUser,
  getUserById,
  updateUser,
  deactivateUser,
  loginUser,
  getAllUsers,
  updatepassword,
  sendpassword,
  resetpassword,
  logoutUser,
  deleteall,
  loginform,
  registrerform,
  createUserform,
  loginUser2,
  dasboardhome,
  deleteallusers
};
