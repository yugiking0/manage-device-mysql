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
        showError(error.message);
    }
}

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
            <td>
                <button class="edit-btn" data-id="${user.id}">Sửa</button>
                <button class="delete-btn" data-id="${user.id}">Xóa</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Thêm sự kiện
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
        const response = await fetch(`/api/users/${userId}`);
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
        const url = currentUser ? `/api/users/${currentUser.id}` : '/api/users';
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
        const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
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

// Khởi động
document.addEventListener('DOMContentLoaded', loadUsers);