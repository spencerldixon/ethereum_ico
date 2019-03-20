const Token = artifacts.require('Token');

module.exports = function(deployer) {
  deployer.deploy(Token, 1000000); // Contract to deploy, then constructor args to deploy with
};
