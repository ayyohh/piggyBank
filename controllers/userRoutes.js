const express = require('express');
const router = express.Router();
const User = require('../models/users');
const Holding = require('../models/holdings');
const CoinMarketData = require('../models/coinmarketcapData');
const request = require('request');



//==============================================
//      passport set up
const passport = require('passport');
const LocalStrategy = require('passport-local');

router.use(require('express-session')({
  secret: 'fuck yo bitch slutty',
  resave: false,
  saveUnintialized: false
}));
router.use(passport.initialize());
router.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/piggybank/login');
}







//===============================================================
//             Routes


/////                     CMC API TESTING                //
// var CoinMarketCap = require("node-coinmarketcap");
// var cmc = new CoinMarketCap();
// If you want to check a single coin, use get() (You need to supply the coinmarketcap id of the cryptocurrency, not the symbol)
// If you want to use symbols instead of id, use multi.
// cmc.get("bitcoin", coin => {
//   console.log(coin.price_usd); // Prints the price in USD of BTC at the moment.
// });
// If you want to check multiple coins, use multi():
// cmc.multi(coins => {
//   console.log(coins.get("BTC").price_usd); // Prints price of BTC in USD
//   console.log(coins.get("ETH").price_usd); // Print price of ETH in USD
//   console.log(coins.get("ETH").price_btc); // Print price of ETH in BTC
//   console.log(coins.getTop(10)); // Prints information about top 10 cryptocurrencies
// });



//=====================================================


//login or register route
router.get('/coin', (req, res) => {

  cmc.get("ethereum", coin => {

     res.render('../views/userViews/show.ejs', {
      coin: coin
     } );
//    res.send(coin.price_usd);
  })
});




//secret page(aka specific users profile page)
router.get('/coin', isLoggedIn, (req, res) => {
  res.render('../views/userViews/show.ejs');
});


//add new users
router.get('/register', (req, res) => {
  res.render('../views/userViews/new.ejs');
});

router.post('/register', (req, res) => {
  let newUser = new User({username: req.body.username});
  User.register(newUser, req.body.password, (err, user) => {
    if(err){
      console.log(err, 'err in create new user');
      return res.render('../views/userViews/new.ejs')
    } else {
      passport.authenticate('local')(req, res, (err) => {
        if(err){
          console.log(err, 'error in authenticate');
        } else {
          res.render('../views/userViews/show.ejs')
        }
      });
    }
  });
});



let parsedData = []
let parsedData2 = []
let nameOfCoin;
let infoOnCoin;
let fuck1;
let fuck2;
//===========================Login Routes

router.get('/login', (req, res) => {
  // request('https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH,DASH&tsyms=BTC,USD,EUR', (error, response, body) => {
  request('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BTC,LTC,XRP,XLM,USDT,ETH,IOTA,EOS,BCH,ADA&tsyms=USD', (error, response, body) => {
    if(!error && response.statusCode == 200){
      let coinData = JSON.parse(body);

      res.render('../views/userViews/login.ejs', {
        coinData: coinData
      });
    }
  });
});



router.post('/login', passport.authenticate('local', {
  successRedirect: '/piggybank/portfolio',
  failureRedirect: '/piggybank/login'
}), (req, res) => {
});

//logout Routes
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/piggybank/login');
});



//=========================================================
//                  Coin Routes


router.get('/portfolio', isLoggedIn, (req, res) => {

  Holding.find({}, (err, foundHoldings) => {
    if(err){
      console.log('error in find');
      console.log(err);
    } else {
        res.render('../views/userViews/show.ejs', {
          holdings: foundHoldings
      })
    }
  });
});


//===========================================================
//                add coins with search bar

router.get('/portfolio/addcoin', isLoggedIn, (req, res) => {
  res.render('../views/transactionViews/new.ejs');
});

//Create route
router.post('/portfolio', (req, res) => {
  Holding.create(req.body, (err, newHolding) => {
    if(err){
      console.log(err, 'error in create');
      res.render('../views/transactionViews/new.ejs');
    } else {
      res.redirect('/piggybank/portfolio');
    }
  });
});

//Show route
router.get('/portfolio/:id', (req, res) => {
  Holding.findById(req.params.id, (err, holding) => {
    if(err){
      console.log(err, 'error in show');
      res.send(err);
    } else {
      let sym = holding.symbol;
      console.log(holding.symbol);
      request('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=' + sym + '&tsyms=USD', (error, response, body) => {

        if(!error && response.statusCode == 200){
          let coinData = JSON.parse(body);
          console.log(coinData);
          console.log(coinData["RAW"][sym]["USD"]);
          res.render('../views/transactionViews/show.ejs', {
            holding: holding,
            coinData: coinData,
            sym: sym,
          });
        }
      });
    }
  });
});






module.exports = router;
