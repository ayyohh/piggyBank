const mongoose = require('mongoose');

const HoldingSchema = new mongoose.Schema({
  symbol: {type: String, required: true},
  cost: {type: Number, required: false},
  numOfHoldings: {type: Number, required: false},
  date: {type: Date, default: Date.now},
});

module.exports = mongoose.model('Holding', HoldingSchema);
