const models = require('./models');

const init = async () => {
  try {
    await models.sequelize.authenticate();
  
    await models.sequelize.sync();
    console.log("ok");
  } catch (error) {
    console.log("nok");
    throw new ApiError('nok (conect database) ', 400);
  }
  
};

module.exports = {
  init,
};
