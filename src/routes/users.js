const express = require('express');
const { User } = require('../database/models');
const router = express.Router();
const multer  = require('multer');
const { v4: uuid } = require('uuid');
const csv = require('csvtojson')
const path = require('path');


const {
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
} = require('../controllers/users');

const { authMiddleware } = require('../middlewares/authMiddleware');
const { paginationMiddleware } = require('../middlewares/paginationMiddleware');

router.get('/all', authMiddleware, paginationMiddleware, getAllUsers);

router.get('/login',loginform );
router.get('/registro',registrerform );
router.post('/registro', createUserform);
router.post('/loginUser', loginUser2);
router.get('/inicio', dasboardhome);


var storage = multer.diskStorage({

  destination: function(req, file, cb, res) {

    cb(null, "src/public/uploads/csv");

  },

  filename: function(req, file, cb, res) {

    var name = uuid() + path.extname(file.originalname);
    cb(null, name);

    return name;
  }
});
const upload = multer ({
  storage: storage,
  dest: "src/public/uploads/csv",
  fileFilter: function (req, file, cb) {

     var filetypes = /csv/;
     var mimetype = filetypes.test(file.mimetype);
     var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      if (mimetype && extname) {
                  return cb(null, true);
     }
     cb(new Error("El tipo de archivo soportados es - " + filetypes), false);

 },
  limits: {fileSize: 20000000}
});
const findUserexist = async (where) => {
  Object.assign(where, { active: true });

  const user = await User.findOne({ where });
  return user;
};
//Guardar archivo y convertirlo a json
router.post('/subir', upload.single('file'),async function  (req, res) {
  const ruta = "src/public/uploads/csv/"+req.file.filename;
  const converter = csv()
    .fromFile(ruta)
    .then((json) => {
      console.log(json);
      json.forEach(async element => {
        const userPayload = {
          username: element.username || element.Username ,
          password: element.Password || element.password,
        };
        let username = await findUserexist({ username: userPayload.username });
        if (!username) {
          const user = await User.create(userPayload);
        }
      });
    }) 
    res.redirect('/inicio');
});

router.get('/borrarusuarios', deleteallusers);

router.post('/', createUser);

router.post('/login', loginUser);

router.post('/logout', authMiddleware, logoutUser);

router.get('/:id', authMiddleware, getUserById);

router.put('/:id', authMiddleware, updateUser);

router.delete('/:id', authMiddleware, deactivateUser);

router.delete('/deleteusers/all', authMiddleware, deleteall);

router.post('/update_password', authMiddleware, updatepassword);

router.post('/send_password_reset', sendpassword);

router.post('/reset_password', resetpassword);

module.exports = router;
