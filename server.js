const session = require('express-session');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');
const morgan = require('morgan');

const express = require('express');
const app = express();
const port = 3000;

const config = require('./data/config');

// Kết nối MySQL
const connection = mysql.createConnection(config);
connection.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

// Thêm vào đầu file server.js
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


// Middleware
// Sắp xếp các middleware đúng thứ tự
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));
app.use(express.static('public'));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Đặt true nếu dùng HTTPS
}));

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Middleware kiểm tra đăng nhập
const zrequireLogin = (req, res, next) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
    next();
};

app.use('/api', zrequireLogin); // Áp dụng cho tất cả API

// Middleware kiểm tra admin
const requireAdmin = (req, res, next) => {
    if (!req.session.userId) {
        res.sendFile(path.join(__dirname, 'modules', 'login', 'login.html'));
    }
    connection.query(
        'SELECT role FROM users WHERE id = ?',
        [req.session.userId],
        (err, results) => {
            if (err || results[0].role !== 'admin') {
                return res.status(403).send('Forbidden');
            }
            next();
        }
    );
};

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API đăng nhập
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Tìm user trong database
        const [rows] = await connection.promise().query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Tài khoản không tồn tại' });
        }

        const user = rows[0];

        // So sánh mật khẩu
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Mật khẩu không đúng' });
        }

        // Lưu thông tin session
        req.session.userId = user.id;
        res.json({ success: true });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

const bcrypt = require('bcrypt'); // Đảm bảo đã require bcrypt

// API đăng xuất
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});


app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'modules', 'login', 'login.html'));
});


// Middleware kiểm tra đăng nhập
const requireLogin = (req, res, next) => {
    if (!req.session.userId) 
        return res.sendFile(__dirname + '/modules/login/login.html');
    next();
};

// Route chính
app.get('/', requireLogin, (req, res) => {
    res.sendFile(__dirname + '/modules/login/login.html');
});

app.get('/dashboard', requireLogin, (req, res) => {
    res.sendFile(__dirname + '/modules/dashboard/dashboard.html');
});

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

// API thống kê
app.get('/api/statistics', requireLogin, async (req, res) => {
    try {
        const [totalItems] = await connection.promise().query(
            'SELECT COUNT(*) AS total FROM items'
        );

        const [totalQuantity] = await connection.promise().query(
            'SELECT SUM(quantity) AS total FROM items'
        );

        const [lowStock] = await connection.promise().query(
            'SELECT * FROM items WHERE quantity < 10 ORDER BY quantity ASC LIMIT 5'
        );

        const [categories] = await connection.promise().query(
            'SELECT name, COUNT(*) AS count FROM items GROUP BY name'
        );

        res.json({
            totalItems: totalItems[0].total,
            totalQuantity: totalQuantity[0].total || 0,
            lowStock,
            categories
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// API get all users
app.get('/api/users', requireAdmin, (req, res) => {
    connection.query(
        'SELECT id, username, email, role, created_at FROM users',
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
});

app.post('/api/users', requireAdmin, async (req, res) => {
    const { username, password, email, role } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Invalid input' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await connection.promise().query(
            'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, email, role]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: 'Username already exists' });
    }
});

// API delete user
app.delete('/api/users/:id', requireAdmin, (req, res) => {
    connection.query(
        'DELETE FROM users WHERE id = ?',
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

app.put('/api/mainUsers/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { username, password, email, role } = req.body;

    try {
        const updateData = { username, email, role };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await connection.promise().query(
            'UPDATE users SET ? WHERE id = ?',
            [updateData, id]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: 'Update failed' });
    }
});

app.delete('/api/mainUsers/id', requireAdmin, (req, res) => {
    connection.query(
        'DELETE FROM users WHERE id = ?',
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

app.get('/api/mainUsers/:id', requireAdmin, (req, res) => {
    const userId = parseInt(req.params.id);

    // 1. Validate ID đầu vào
    if (isNaN(userId)) {
        return res.status(400).json({
            error: 'ID phải là số nguyên hợp lệ'
        });
    }

    // 2. Tạo câu query SQL (chỉ lấy các trường cần thiết)
    const query = `
        SELECT 
            id, 
            username, 
            email, 
            role, 
            created_at AS createdAt 
        FROM users 
        WHERE id = ?
    `;
    // 3. Thực thi query bằng promise
    connection.promise()
        .query(query, [userId])
        .then(([results, fields]) => {
            // 4. Xử lý kết quả trả về
            if (results.length === 0) {
                return res.status(404).json({
                    error: `Không tìm thấy user với ID ${userId}`
                });
            }
            // 5. Format lại ngày tháng
            const user = {
                ...results[0],
                createdAt: new Date(results[0].createdAt).toISOString()
            };
            res.json(user);
        })
        .catch(error => {
            // 6. Xử lý lỗi database
            console.error('Lỗi truy vấn database:', error);
            res.status(500).json({
                error: 'Lỗi hệ thống khi truy vấn dữ liệu user'
            });
        });
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Xử lý 404 cho API
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint không tồn tại' });
});

// Static files nên ở cuối
app.use(express.static('public'));