const Token     = artifacts.require('Token');
const TokenSale = artifacts.require('TokenSale');

// module.exports = function(deployer) {
  // deployer.deploy(Token, 1000000).then(function() {
    // // Token price is 0.001 Ether
    // var tokenPrice = 1000000000000000;
    // return deployer.deploy(TokenSale, Token.address, tokenPrice)
  // });
// };

const tokenSupply = 10000;
const tokenPrice  = 1000000000000000;
let admin;

web3.eth.getAccounts().then(function(accounts){
  admin = accounts[0];
})

module.exports = async function(deployer) {
  deployer.deploy(Token, tokenSupply).then(() => {
    return deployer.deploy(TokenSale, Token.address, tokenPrice);
  }).then(async () => {
    let tokenDeployed = await Token.deployed();
    await tokenDeployed.transfer(TokenSale.address, tokenSupply, {from: admin});
  });
};
