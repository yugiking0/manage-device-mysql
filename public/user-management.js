let currentUser = null;
// Load danh sách user
async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        const users = await response.json();
        renderUsers(users);
    } catch (error) {
        alert('Lỗi tải danh sách user: ' + error.message);
    }
}
// Khởi động
document.addEventListener('DOMContentLoaded', loadUsers);

// Hiển thị danh sách
function renderUsers(users) {
    const tbody = document.getElementById('userList');
    tbody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email || '-'}</td>
            <td>${user.role}</td>
            <td class="action-buttons">
                <button class="edit-btn" data-id="${user.id}">Sửa</button>
                <button class="delete-btn" data-id="${user.id}">Xóa</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Thêm sự kiện cho các nút
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => showEditForm(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteUser(btn.dataset.id));
    });
}

// Hiển thị form
async function showEditForm(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`);
        currentUser = await response.json();
        
        document.getElementById('userId').value = currentUser.id;
        document.getElementById('username').value = currentUser.username;
        document.getElementById('email').value = currentUser.email || '';
        document.getElementById('role').value = currentUser.role;
        document.getElementById('password').value = '';
        
        document.getElementById('userFormModal').style.display = 'block';
    } catch (error) {
        alert('Lỗi tải thông tin user: ' + error.message);
    }
}

// Trong phần xử lý submit form
document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        role: document.getElementById('role').value,
        password: document.getElementById('password').value // Gửi password dạng plaintext
    };

    try {
        const url = currentUser ? `/api/users/${currentUser.id}` : '/api/users';
        const method = currentUser ? 'PUT' : 'POST';

        // GỌI API VỚI PASSWORD PLAINTEXT
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Request failed');
        
        document.getElementById('userFormModal').style.display = 'none';
        loadUsers();
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
});

// Xóa user
async function deleteUser(userId) {
    if (!confirm('Bạn chắc chắn muốn xóa user này?')) return;
    
    try {
        await fetch(`/api/users/${userId}`, { method: 'DELETE' });
        loadUsers();
    } catch (error) {
        alert('Lỗi xóa user: ' + error.message);
    }
}

// Sự kiện
document.getElementById('addUserBtn').addEventListener('click', () => {
    currentUser = null;
    document.getElementById('userForm').reset();
    document.getElementById('userFormModal').style.display = 'block';
});

document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('userFormModal').style.display = 'none';
});

async function showEditForm(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`);
        
        // Kiểm tra nếu response không thành công
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        // Kiểm tra content type
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const htmlResponse = await response.text();
            console.error('Nhận response HTML thay vì JSON:', htmlResponse);
            throw new Error('Server trả về dữ liệu không hợp lệ');
        }

        currentUser = await response.json();
        
        // Điền dữ liệu vào form
        document.getElementById('userId').value = currentUser.id;
        document.getElementById('username').value = currentUser.username;
        document.getElementById('email').value = currentUser.email || '';
        document.getElementById('role').value = currentUser.role;
        document.getElementById('password').value = '';
        
        // Hiển thị modal
        document.getElementById('userFormModal').style.display = 'block';
        
    } catch (error) {
        console.error('Chi tiết lỗi:', error);
        alert(`Lỗi tải thông tin user: ${error.message}`);
    }
}

app.get('/api/users/:id', requireAdmin, (req, res) => {
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

