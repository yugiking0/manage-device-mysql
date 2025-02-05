document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        email: document.getElementById('email').value,
        role: document.getElementById('role').value
    };

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user)
        });

        const data = await response.json();
        if (data.error) {
            showMessage(data.error, 'error');
        } else {
            showMessage('Đăng ký thành công!', 'success');
            document.getElementById('registerForm').reset();
        }
    } catch (error) {
        showMessage('Lỗi kết nối server', 'error');
    }
});

function showMessage(message, type = 'success') {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = type;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}