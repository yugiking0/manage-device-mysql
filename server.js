const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const config = require('./config');
const path = require('path');

const app = express();
const port = 3000;

// Kết nối MySQL
const connection = mysql.createConnection(config);
connection.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API endpoints
app.get('/items', (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM items';
    let countQuery = 'SELECT COUNT(*) AS total FROM items';
    const params = [];

    if (search) {
        query += ' WHERE name LIKE ? OR description LIKE ?';
        countQuery += ' WHERE name LIKE ? OR description LIKE ?';
        params.push(`%${search}%`, `%${search}%`);
    }

    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    connection.query(countQuery, params.slice(0, 2), (err, countResult) => {
        if (err) return res.status(500).json({ error: err.message });
        
        connection.query(query, params, (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            
            res.json({
                items: results,
                total: countResult[0].total,
                page: parseInt(page),
                totalPages: Math.ceil(countResult[0].total / limit)
            });
        });
    });
});

app.post('/items', (req, res) => {
    const { name, quantity, description } = req.body;
    if (!name || quantity < 0) {
        return res.status(400).json({ error: 'Invalid input' });
    }
    
    const query = 'INSERT INTO items SET ?';
    connection.query(query, { name, quantity, description }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId });
    });
});

app.put('/items/:id', (req, res) => {
    const { name, quantity, description } = req.body;
    if (!name || quantity < 0) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    const query = 'UPDATE items SET ? WHERE id = ?';
    connection.query(query, [{ name, quantity, description }, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.delete('/items/:id', (req, res) => {
    const query = 'DELETE FROM items WHERE id = ?';
    connection.query(query, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

//node server.js