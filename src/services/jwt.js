const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('../config');

const blacklistData = [];
/**
 *
 * @param {Number} id user.id
 * @param {String} role user.role
 * @returns {String}
 */
function generateAccessToken(id, role) {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '1d' });
}

function blacklistTokenVerify(token) {
  let sw = true;
  for (let index = 0; index < blacklistData.length; index += 1) {
    if (blacklistData[index] === token) {
      sw = false;
    }
  }
  return sw;
}

function blacklistTokenInser(token) {
  blacklistData.push(token);
}

/**
 *
 * @param {String} token
 * @returns {{ id: Number, role: String }}
 */
function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  blacklistTokenVerify,
  blacklistTokenInser,
};
