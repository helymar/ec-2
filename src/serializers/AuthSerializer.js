const BaseSerializer = require('./BaseSerializer');

class AuthSerializer extends BaseSerializer {
  constructor(accessToken, id) {
    super('success', { accessToken }, { id });
  }
}

module.exports = AuthSerializer;
