let currentUser = null;

const modal = document.getElementById('userFormModal');
const userForm = document.getElementById('userForm');

async function loadDashboard() {
    try {
        const response = await fetch('/login');
        const data = await response.json();

        // Hiển thị tổng quan
        document.getElementById('totalItems').textContent = data.totalItems;
        document.getElementById('totalQuantity').textContent = data.totalQuantity;

        // Hiển thị vật tư sắp hết
        const lowStockList = document.getElementById('lowStockList');
        data.lowStock.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${item.name}</span>
                <span class="warning-text">${item.quantity}</span>
            `;
            lowStockList.appendChild(li);
        });

        // Vẽ biểu đồ
        renderChart(data.categories);

    } catch (error) {
        // Hàm kiểm tra trạng thái đăng nhập (ví dụ: kiểm tra cookie, local storage, hoặc gọi API)
        const response = await fetch('/login');
        if (!response.ok) throw new Error('Failed to load users');
    }

}

// Khởi động
document.addEventListener('DOMContentLoaded', loadDashboard);

// Hiển thị lỗi
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}
