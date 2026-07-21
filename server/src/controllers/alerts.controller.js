const { query } = require('../db/database');

// GET /api/alerts
exports.getAll = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM alerts ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) { next(err); }
};

// POST /api/alerts
exports.createAlert = async (req, res, next) => {
  try {
    const { coin_id, coin_name, coin_symbol, condition, target_price } = req.body;

    if (!coin_id || !coin_name || !coin_symbol || !condition || !target_price) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (!['above', 'below'].includes(condition)) {
      return res.status(400).json({ error: 'Condition must be above or below' });
    }
    if (target_price <= 0) {
      return res.status(400).json({ error: 'Target price must be greater than 0' });
    }

    const result = await query(
      `INSERT INTO alerts (coin_id, coin_name, coin_symbol, condition, target_price)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [coin_id, coin_name, coin_symbol, condition, target_price]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

// PATCH /api/alerts/:id/trigger
exports.triggerAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `UPDATE alerts
       SET status = 'triggered', triggered_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

// DELETE /api/alerts/:id
exports.deleteAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM alerts WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) { next(err); }
};