App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 750000,
  init: function() {
    console.log("app initialised");
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },

  initContracts: function() {
    $.getJSON("TokenSale.json", function(tokenSale) {
      App.contracts.TokenSale = TruffleContract(tokenSale);
      App.contracts.TokenSale.setProvider(App.web3Provider);
      App.contracts.TokenSale.deployed().then(function(tokenSale) {
        console.log("Token Sale Address:", tokenSale.address);
      });
    }).done(function() {
      $.getJSON("Token.json", function(token) {
        App.contracts.Token = TruffleContract(token);
        App.contracts.Token.setProvider(App.web3Provider);
        App.contracts.Token.deployed().then(function(token) {
          console.log("Token Address:", token.address);
        });

        // App.listenForEvents();
        return App.render();
      });
    })
  },

  render: function() {
    web3.eth.getCoinbase(function(err, account){
      if(err == null){
        App.account = account;
        $('#accountAddress').html(account);
      }
    });
  }

}

$(function() {
  $(window).load(function() {
    App.init();
  });
});
