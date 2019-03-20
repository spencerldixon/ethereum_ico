const Token = artifacts.require('./Token.sol');

contract('Token', function(accounts) {
  it('initialises the contract with the correct values', function() {
    return Token.deployed()
      .then(function(instance) {
        tokenInstance = instance;
        return tokenInstance.name();
      })
      .then(function(name) {
        assert.equal(name, 'TestToken', 'sets the name correctly');
        return tokenInstance.symbol();
      })
      .then(function(symbol) {
        assert.equal(symbol, 'TEST', 'sets the token symbol correctly');
        return tokenInstance.standard();
      })
      .then(function(standard) {
        assert.equal(
          standard,
          'Test Token v1.0',
          'sets the standard correctly',
        );
      });
  });

  it('allocates initial supply', function() {
    return Token.deployed()
      .then(function(instance) {
        tokenInstance = instance;
        return tokenInstance.totalSupply();
      })
      .then(function(totalSupply) {
        assert.equal(
          totalSupply.toNumber(),
          1000000,
          'sets total supply to 1 million',
        );
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then(function(adminBalance) {
        assert.equal(
          adminBalance.toNumber(),
          1000000,
          'allocates initial supply to admin account',
        );
      });
  });

  it('transfers ownership of tokens', function() {
    return Token.deployed()
      .then(function(instance) {
        tokenInstance = instance;
        // Send more tokens than possible
        // Call is not triggering a transaction, but allowing us to inspect it
        return tokenInstance.transfer.call(
          accounts[1],
          '99999999999999999999999',
        );
      })
      .then(assert.fail)
      .catch(function(error) {
        assert(
          error.message.indexOf('revert') >= 0,
          'error message must contain revert',
        );
        return tokenInstance.transfer.call(accounts[1], '25000', {
          from: accounts[0],
        });
      })
      .then(function(success) {
        assert.equal(success, true, 'it returns true');
        return tokenInstance.transfer(accounts[1], '25000', {
          from: accounts[0],
        });
      })
      .then(function(receipt) {
        assert.equal(receipt.logs.length, 1, 'triggers one event');
        assert.equal(
          receipt.logs[0].event,
          'Transfer',
          'should be the "Transfer" event',
        );
        assert.equal(
          receipt.logs[0].args._from,
          accounts[0],
          'logs the account the tokens are transferred from',
        );
        assert.equal(
          receipt.logs[0].args._to,
          accounts[1],
          'logs the account the tokens are transferred to',
        );
        assert.equal(
          receipt.logs[0].args._value.toNumber(),
          25000,
          'logs the transfer amount',
        );
        return tokenInstance.balanceOf(accounts[1]);
      })
      .then(function(balance) {
        assert.equal(
          balance.toNumber(),
          25000,
          'adds 25000 tokens to the balance of the recieving account',
        );
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then(function(balance) {
        assert.equal(
          balance.toNumber(),
          975000,
          'removes 25000 tokens from the balance of transferring account',
        );
      });
  });

  it('approves tokens for delegated transfer', function() {
    return Token.deployed()
      .then(function(instance) {
        tokenInstance = instance;
        return tokenInstance.approve.call(accounts[1], 100);
      })
      .then(function(success) {
        assert.equal(success, true, 'it returns true when successful');
        return tokenInstance.approve(accounts[1], 100);
      })
      .then(function(receipt) {
        assert.equal(receipt.logs.length, 1, 'triggers one event');
        assert.equal(
          receipt.logs[0].event,
          'Approval',
          'should be the "Approval" event',
        );
        assert.equal(
          receipt.logs[0].args._owner,
          accounts[0],
          'logs the account the tokens are authorized by',
        );
        assert.equal(
          receipt.logs[0].args._spender,
          accounts[1],
          'logs the account the tokens are authorized to',
        );
        assert.equal(
          receipt.logs[0].args._value.toNumber(),
          100,
          'logs the transfer amount',
        );
        return tokenInstance.allowance(accounts[0], accounts[1]);
      });
  });

  // it('transfers ownership of tokens', function() {
  // return Token.deployed().then(function(instance) {
  // tokenInstance = instance;
  // });
  // });
});
