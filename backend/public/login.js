// public/js/login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('#login-form');
    const messageEl = document.querySelector('#message');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());

            try {
                // The /api/ routes are not part of /static, so this path is correct
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', result.token);
                    messageEl.textContent = 'Login successful! Redirecting...';
                    messageEl.style.color = 'green';

                    // --- THIS IS THE IMPORTANT FIX ---
                    // Redirect to the correct index.html path
                    window.location.href = '/static/index.html';

                } else {
                    messageEl.textContent = `Error: ${result.error}`;
                    messageEl.style.color = 'red';
                }
            } catch (err) {
                console.error('Failed to login:', err);
                messageEl.textContent = 'An error occurred. Please try again.';
                messageEl.style.color = 'red';
            }
        });
    }
});