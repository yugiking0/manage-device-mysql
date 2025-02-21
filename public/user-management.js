
let currentUser = null;

const modal = document.getElementById('userFormModal');
const userForm = document.getElementById('userForm');

// Load danh sách user
async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Failed to load users');
        const users = await response.json();
        renderUsers(users);
    } catch (error) {
        const response = await fetch('/login');
        showError(error.message);
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

// Hiển thị form chỉnh sửa
async function showEditForm(userId) {
    try {
        const response = await fetch(`/api/mainUsers/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch user');
        currentUser = await response.json();
        document.getElementById('userId').value = currentUser.id;
        document.getElementById('username').value = currentUser.username;
        document.getElementById('email').value = currentUser.email || '';
        document.getElementById('role').value = currentUser.role;
        modal.style.display = 'block';
    } catch (error) {
        showError(error.message);
    }
}

// Xử lý submit form
userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        email: document.getElementById('email').value,
        role: document.getElementById('role').value
    };

    try {
        const url = currentUser ? `/api/mainUsers/${currentUser.id}` : '/api/users';
        const method = currentUser ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Request failed');
        }

        modal.style.display = 'none';
        userForm.reset();
        await loadUsers();
    } catch (error) {
        showError(error.message);
    }
});

// Xóa user
async function deleteUser(userId) {
    if (!confirm('Bạn chắc chắn muốn xóa user này?')) return;
    
    try {
        const response = await fetch(`/api/mainUsers/${userId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Delete failed');
        await loadUsers();
    } catch (error) {
        showError(error.message);
    }
}

// Hiển thị lỗi
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

// Sự kiện
document.getElementById('addUserBtn').addEventListener('click', () => {
    currentUser = null;
    userForm.reset();
    modal.style.display = 'block';
});

document.querySelector('.close').addEventListener('click', () => {
    modal.style.display = 'none';
});

/*
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

*/