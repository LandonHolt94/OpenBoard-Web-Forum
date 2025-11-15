// public/js/login.js
document.addEventListener('DOMContentLoaded', () => {
    // Make sure your login form in login.html has id="login-form"
    const loginForm = document.querySelector('#login-form');
    // Make sure you have <p id="message"></p> in your HTML to show errors
    const messageEl = document.querySelector('#message');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Stop the form from submitting normally

            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    // --- SUCCESS! ---
                    // Save the token to local storage
                    localStorage.setItem('token', result.token);

                    messageEl.textContent = 'Login successful! Redirecting...';
                    messageEl.style.color = 'green';

                    // Redirect to the main page
                    window.location.href = '/'; // This will load index.html

                } else {
                    // Show error message from the server
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