let currentPage = 1;
const limit = 5;

// Tải danh sách vật tư
async function loadItems() {
    const search = document.getElementById('searchInput').value;
    const response = await fetch(`/items?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(search)}`);
    const data = await response.json();
    
    renderItems(data.items);
    updatePagination(data);
}

// Hiển thị danh sách
function renderItems(items) {
    const tbody = document.getElementById('itemList');
    tbody.innerHTML = '';

    items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="editable" data-field="name">${item.name}</td>
            <td class="editable" data-field="quantity">${item.quantity}</td>
            <td class="editable" data-field="description">${item.description || ''}</td>
            <td>
                <button class="edit-btn" data-id="${item.id}">Sửa</button>
                <button class="delete-btn" data-id="${item.id}">Xóa</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Thêm sự kiện cho các nút
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', handleEdit);
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDelete);
    });
}

// Xử lý sửa
async function handleEdit(e) {
    const id = e.target.dataset.id;
    const row = e.target.closest('tr');
    const cells = row.querySelectorAll('.editable');
    
    if (e.target.textContent === 'Sửa') {
        // Chuyển sang chế độ chỉnh sửa
        cells.forEach(cell => {
            const field = cell.dataset.field;
            const value = cell.textContent;
            cell.innerHTML = `<input type="${field === 'quantity' ? 'number' : 'text'}" 
                                  value="${value}" 
                                  ${field === 'quantity' ? 'min="0"' : ''}>`;
        });
        e.target.textContent = 'Lưu';
    } else {
        // Lưu thay đổi
        const data = {};
        cells.forEach(cell => {
            const field = cell.dataset.field;
            data[field] = cell.querySelector('input').value;
        });

        try {
            await fetch(`/items/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            await loadItems();
        } catch (error) {
            alert('Lỗi khi cập nhật: ' + error.message);
        }
    }
}

// Xử lý xóa
async function handleDelete(e) {
    if (!confirm('Bạn chắc chắn muốn xóa?')) return;
    
    try {
        await fetch(`/items/${e.target.dataset.id}`, { method: 'DELETE' });
        await loadItems();
    } catch (error) {
        alert('Lỗi khi xóa: ' + error.message);
    }
}

// Phân trang
function updatePagination(data) {
    document.getElementById('currentPage').textContent = currentPage + "/" + data.totalPages;
    //document.getElementById('prevPage').textContent = "<" ;
    //document.getElementById('nextPage').textContent = ">" ;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === data.totalPages;
}

// Sự kiện
document.getElementById('itemForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const item = {
        name: document.getElementById('name').value,
        quantity: Math.max(0, document.getElementById('quantity').value),
        description: document.getElementById('description').value
    };

    try {
        await fetch('/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });
        document.getElementById('itemForm').reset();
        await loadItems();
    } catch (error) {
        alert('Lỗi khi thêm: ' + error.message);
    }
});

document.getElementById('searchInput').addEventListener('input', () => {
    currentPage = 1;
    loadItems();
});

document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadItems();
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    currentPage++;
    loadItems();
});

// Khởi động
document.addEventListener('DOMContentLoaded', loadItems);