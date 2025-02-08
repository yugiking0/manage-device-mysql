document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/statistics');
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
        console.error('Lỗi tải dữ liệu:', error);
    }
});

// Xử lý đăng xuất
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await fetch('/logout', { method: 'POST' });
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Lỗi đăng xuất:', error);
    }
});

// Xử lý danh mục vật tư
document.getElementById('items').addEventListener('click', async () => {
    try {
        await fetch('/index', { method: 'POST' });
        window.location.href = '/index.html';
    } catch (error) {
        console.error('Lỗi danh mục vật tư:', error);
    }
});

// Xử lý User
document.getElementById('user').addEventListener('click', async () => {
    try {
        await fetch('/user-management', { method: 'POST' });
        window.location.href = '/user-management.html';
    } catch (error) {
        console.error('Lỗi User:', error);
    }
});

function renderChart(categories) {
    const ctx = document.getElementById('categoryChart');
    // Kiểm tra canvas tồn tại
    if (!ctx) {
        console.error('Canvas element không tồn tại hoặc không đúng loại');
        return;
    }

    new Chart(ctx, { // Sử dụng trực tiếp ctx (không cần .getContext('2d'))
        type: 'bar',
        data: {
            labels: categories.map(c => c.name),
            datasets: [{
                data: categories.map(c => c.count),
                backgroundColor: [
                    '#1a73e8',
                    '#4caf50',
                    '#ff9800',
                    '#e91e63',
                    '#9c27b0'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}
