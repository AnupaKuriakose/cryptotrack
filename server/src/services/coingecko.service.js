const axios = require('axios');
const cache = require('../cache/cacheService');

const BASE_URL = process.env.COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3';

async function getMarketCoins({ page = 1, perPage = 50, currency = 'usd' } = {}) {
  const key = `market_coins_${page}_${perPage}_${currency}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const { data } = await axios.get(`${BASE_URL}/coins/markets`, {
    params: {
      vs_currency: currency,
      order: 'market_cap_desc',
      per_page: perPage,
      page,
      sparkline: false,
      price_change_percentage: '24h',
    },
  });

  cache.set(key, data, 60);
  return data;
}

async function getCoinDetail(coinId) {
  const key = `coin_detail_${coinId}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const { data } = await axios.get(`${BASE_URL}/coins/${coinId}`, {
    params: {
      localization: false,
      tickers: false,
      market_data: true,
      community_data: false,
      developer_data: false,
    },
  });

  cache.set(key, data, 120);
  return data;
}

async function getPriceHistory(coinId, days = 7, currency = 'usd') {
  const key = `price_history_${coinId}_${days}_${currency}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const { data } = await axios.get(`${BASE_URL}/coins/${coinId}/market_chart`, {
    params: { vs_currency: currency, days },
  });

  const ttl = days <= 1 ? 300 : 1800;
  cache.set(key, data, ttl);
  return data;
}

async function getTrending() {
  const key = 'trending';
  const cached = cache.get(key);
  if (cached) return cached;

  const { data } = await axios.get(`${BASE_URL}/search/trending`);
  cache.set(key, data, 300);
  return data;
}

async function getGlobal() {
  const key = 'global';
  const cached = cache.get(key);
  if (cached) return cached;

  const { data } = await axios.get(`${BASE_URL}/global`);
  cache.set(key, data, 300);
  return data;
}

async function getSimplePrice(coinIds = []) {
  const key = `simple_price_${coinIds.join('_')}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const { data } = await axios.get(`${BASE_URL}/simple/price`, {
    params: {
      ids: coinIds.join(','),
      vs_currencies: 'usd',
      include_24hr_change: true,
    },
  });

  cache.set(key, data, 60);
  return data;
}

module.exports = {
  getMarketCoins,
  getCoinDetail,
  getPriceHistory,
  getTrending,
  getGlobal,
  getSimplePrice,
};