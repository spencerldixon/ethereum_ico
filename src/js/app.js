App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 750000,
  tokenSaleAddress: '0x0',
  tokenAddress: '0x0',
  balance: 0,
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
        App.tokenSaleAddress = tokenSale.address;
        $("#tokenSaleAddress").html(App.tokenSaleAddress);
        console.log("Token Sale Address:", tokenSale.address);
      });
    }).done(function() {
      $.getJSON("Token.json", function(token) {
        App.contracts.Token = TruffleContract(token);
        App.contracts.Token.setProvider(App.web3Provider);
        App.contracts.Token.deployed().then(function(token) {
          App.tokenAddress = token.address;
          $("#tokenAddress").html(App.tokenAddress);
          console.log("Token Address:", token.address);
        });

        // App.listenForEvents();
        return App.render();
      });
    })
  },

  render: function() {
    if(App.loading) {
      return;
    }

    App.loading = true;
    var loader = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();
    // Load account data
    web3.eth.getCoinbase(function(err, account){
      if(err == null){
        App.account = account;
        $('#accountAddress').html(account);
      }
    })

    App.contracts.TokenSale.deployed().then(function(instance) {
      tokenSaleInstance = instance;
      return tokenSaleInstance.tokenPrice();
    }).then(function(tokenPrice) {
      App.tokenPrice = tokenPrice;
      $("#tokenPrice").html(web3.fromWei(App.tokenPrice, 'ether').toNumber());
      return tokenSaleInstance.tokensSold();
    }).then(function(tokensSold) {
      App.tokensSold = tokensSold;
      $("#tokensSold").html(App.tokensSold.toNumber());
      $("#tokensAvailable").html(App.tokensAvailable);
    })

    App.contracts.Token.deployed().then(function(instance) {
      tokenInstance = instance;
      return tokenInstance.balanceOf(App.account);
    }).then(function(balance) {
      App.balance = balance;
      $("#balance").html(balance.toNumber());

      App.loading = false;
      loader.hide();
      content.show();
    })


  },

  buyTokens: function() {
    $("#content").hide();
    $("#loader").show();

    var numberOfTokens = $("#numberOfTokens").val();
    App.contracts.TokenSale.deployed().then(function(instance){
      return instance.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gasLimit: 500000,
      })
    }).then(function(result) {
      console.log(result);
      $("#transactionsLog").append('<li class="list-group-item">' + result + '</li>');
      $("#form").trigger('reset');
      $("#loader").hide();
      $("#content").show();
    })
  }
}

$(function() {
  $(window).load(function() {
    App.init();
  });
});
