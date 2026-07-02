const coingeckoService = require('../services/coingecko.service');
exports.getCoins = async (req, res, next) => {
  try {
    const { page = 1, per_page = 50, currency = 'usd' } = req.query;
    //req.query contains URL query parameters. 
    // When Angular calls /api/market/coins?page=2&per_page=25, this destructures those values with defaults as fallback.
     const data = await coingeckoService.getMarketCoins({ page, perPage: per_page, currency });
    res.json(data);
    //Calls the service, awaits the result, sends it as JSON. The controller doesn't know or care whether the data came from cache or CoinGecko — that's the service's concern.
  } catch (error) {
    next(error);
  }
  //Every controller wraps everything in try/catch and calls next(err) on failure. This hands the error to errorHandler.js. If you forget this, an unhandled error crashes the whole server.
}; 
exports.getCoinDetail = async (req, res, next) => {
  try {
    const data = await coingeckoService.getCoinDetail(req.params.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.getPriceHistory = async(req, res, next) => {
  try{

  }
  catch(error)
  {

  }
}

exports.getTrending = async(req, res, next) => {
  try{

  }
  catch(error)
  {
    
  }
}

exports.getGlobal = async(req, res, next) => {
  try{

  }
  catch(error)
  {
    
  }
}