const express = require('express');

const router = express.Router();

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
  registrerform
} = require('../controllers/users');

const { authMiddleware } = require('../middlewares/authMiddleware');
const { paginationMiddleware } = require('../middlewares/paginationMiddleware');

router.get('/all', authMiddleware, paginationMiddleware, getAllUsers);

router.get('/login',loginform );
router.get('/registro',registrerform );

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
