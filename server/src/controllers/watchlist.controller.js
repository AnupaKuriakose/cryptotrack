const { query } = require('../db/database');

// GET /api/watchlist
exports.getAll = async (req, res, next) => {
    try {
        const result = await query(
            'SELECT * FROM watchlist ORDER BY added_at DESC'
        );
        res.json(result.rows);
    } catch (err) { next(err); }
};

// POST /api/watchlist
exports.addCoin = async (req, res, next) => {
    try {
        const { coin_id, coin_name, coin_symbol, coin_image } = req.body;

        if (!coin_id || !coin_name || !coin_symbol) {
            return res.status(400).json({ error: 'coin_id, coin_name, coin_symbol are required' });
        }

        const result = await query(
            `INSERT INTO watchlist (coin_id, coin_name, coin_symbol, coin_image)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (coin_id) DO NOTHING
       RETURNING *`,
            [coin_id, coin_name, coin_symbol, coin_image]
        );

        if (result.rows.length === 0) {
            return res.status(409).json({ error: 'Coin already in watchlist' });
        }

        res.status(201).json(result.rows[0]);
    } catch (err) { next(err); }
};


exports.removeCoin = async (req, res, next) => {
    try {
        const { coinId } = req.params;
        await query('DELETE FROM WATCHLIST WHERE COIN_ID = $1', [coinId]);
        res.status(204).send();
    }
    catch (e) {
        next(e);
    }
}
