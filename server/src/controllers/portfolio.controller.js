const { query } = require('../db/database');

// GET /api/portfolio
exports.getAll = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM portfolio ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) { next(err); }
};

// POST /api/portfolio
exports.addHolding = async (req, res, next) => {
  try {
    const { coin_id, coin_name, coin_symbol, coin_image, quantity, buy_price, buy_date } = req.body;

    if (!coin_id || !coin_name || !coin_symbol || !quantity || !buy_price || !buy_date) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (quantity <= 0) return res.status(400).json({ error: 'Quantity must be greater than 0' });
    if (buy_price <= 0) return res.status(400).json({ error: 'Buy price must be greater than 0' });

    const result = await query(
      `INSERT INTO portfolio (coin_id, coin_name, coin_symbol, coin_image, quantity, buy_price, buy_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [coin_id, coin_name, coin_symbol, coin_image, quantity, buy_price, buy_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

// PUT /api/portfolio/:id
exports.updateHolding = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity, buy_price, buy_date } = req.body;

    if (quantity <= 0) return res.status(400).json({ error: 'Quantity must be greater than 0' });
    if (buy_price <= 0) return res.status(400).json({ error: 'Buy price must be greater than 0' });

    const result = await query(
      `UPDATE portfolio
       SET quantity = $1, buy_price = $2, buy_date = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [quantity, buy_price, buy_date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Holding not found' });
    }

    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

// DELETE /api/portfolio/:id
exports.deleteHolding = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM portfolio WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) { next(err); }
};