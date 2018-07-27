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


//Index route
router.get("/", (req, res) => {
  User.find({}, (err, foundUsers) => {
    if(err){
      console.log('error in find');
      console.log(err);
    } else {
      res.render('../views/userViews/index.ejs', {users: foundUsers});
    }
  });
});


//login or register route
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


//add new users
router.get('/new', (req, res) => {
  res.render('../views/userViews/new.ejs');
});

router.post('/', (req, res) => {
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
          res.redirect(`/piggybank/${user.id}/portfolio`);
        }
      });
    }
  });
});

router.get('/:id', (req, res) => {
  User.findById(req.params.id, (err, user) => {
    if(err){
      console.log(err, 'error in show');
      res.send(err);
    } else {
      console.log(req.params.id);
      res.render('../views/userViews/user.ejs', {
        user: user,
      });
    }

  })
});


let parsedData = []
let parsedData2 = []
let nameOfCoin;
let infoOnCoin;
let fuck1;
let fuck2;



router.get('/:id/portfolio', isLoggedIn, (req, res) => {
    User.findById(req.params.id, (err, user) => {
      if(err){
        console.log(err, 'error in show');
        res.send(err);
      } else {
          User.find({ '_id': user.id }, 'portfolio', (err, foundHoldings) => {
            if(err){
              console.log('error in find');
              console.log(err);
            } else {
                let fHoldings = foundHoldings[0].portfolio;
                console.log(fHoldings);
                res.render('../views/userViews/show.ejs', {
                  user: user,
                  holdings: fHoldings,
                });
              }
            });
          }
        });
      });


//=========================================================
//                  Coin Routes



//===========================================================
//                add coins with search bar

router.get('/:id/portfolio/addcoin', isLoggedIn, (req, res) => {
  User.findById(req.params.id, (err, user) => {
    if(err){
      console.log(err, 'error in show');
      res.send(err);
    } else {
      console.log(req.params.id);
      res.render('../views/transactionViews/new.ejs', {
        user: user,
      });
    }

  })

});

//Create route
router.post('/:id/portfolio', isLoggedIn, (req, res) => {
  User.findById(req.params.id, (err, user) => {
    if(err){
      console.log(err, 'error in show');
      res.send(err);
    } else {
      Holding.create(req.body, (err, newHolding) => {
        if(err){
          console.log(err, 'error in create');
          res.render('../views/transactionViews/new.ejs');
        } else {
          user.portfolio.push(newHolding);
          user.save();
          res.redirect(`/piggybank/${user.id}/portfolio`);
        }
      });

    }

  })
});

//Show route
router.get('/:id/portfolio/:holdingID', isLoggedIn, (req, res) => {
  User.findById(req.params.id, (err, user) => {
    if(err){
      console.log(err, 'error');
    } else {
      console.log(user, 'user');
      console.log(user.portfolio[0]);

      let userID = user["_id"];
      let id = user.portfolio[0]["_id"];
      let sym = user.portfolio[0].symbol;
      let hold = user.portfolio[0].numOfHoldings;
      let cost = user.portfolio[0].cost;
      console.log(userID);
      console.log(sym, 'this is symbol');
      console.log(id);
      // console.log(req.params.id);
      // console.log(user);
      User.findById(req.params.holdingID, (err, holding) => {
              if(err){
                console.log(err, 'error in show');
              } else {
                console.log(holding, 'holding');
                request('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=' + sym + '&tsyms=USD', (error, response, body) => {

                  if(!error && response.statusCode == 200){
                    let coinData = JSON.parse(body);
                    res.render('../views/transactionViews/show.ejs', {
                      userID: userID,
                      coinData: coinData,
                      hold: hold,
                      cost: cost,
                      sym: sym,
                      id: id,
                    })
                  }
                });
              }
            });
          }
        });
      });


//==========================================================
//             edit and delete transaction

router.delete('/:id/portfolio/:holdingID', (req, res) => {
  User.findById(req.params.id, (id) => {
    console.log(id);
    id.portfolio.findByIdAndRemove(req.params.holdingID, (err) => {
      if (err){
        console.log('you fucked');
      } else {
        console.log('delete request made');
        res.redirect(`/piggybank/${req.params.id}/portfolio`)
      }
    })
  })

})



router.post('/login', passport.authenticate('local'), (req, res) => {
  User.findById(req.body.id, (err, id) => {
    if (err) {
      console.log(err, 'error you dumb bitch');
    } else {
      console.log(req.user._id);
      res.redirect(`/piggybank/${req.user._id}/portfolio`)
    }
  });

});

//logout Routes
router.get('/:id/logout', (req, res) => {
  req.logout();
  res.redirect('/piggybank/login');
});

module.exports = router;
