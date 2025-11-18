// public/js/register.js
document.addEventListener('DOMContentLoaded', () => {
    // Make sure your register form in register.html has id="register-form"
    const registerForm = document.querySelector('#register-form');
    // Make sure you have <p id="message"></p> in your HTML
    const messageEl = document.querySelector('#message');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Stop the form submission

            const formData = new FormData(registerForm);
            const data = Object.fromEntries(formData.entries());

            // Simple client-side check
            if (data.password !== data.confirmPassword) {
                messageEl.textContent = 'Passwords do not match.';
                messageEl.style.color = 'red';
                return;
            }

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: data.username,
                        email: data.email,
                        password: data.password
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    // --- SUCCESS! ---
                    messageEl.textContent = 'Registration successful! Redirecting to login...';
                    messageEl.style.color = 'green';

                    // Redirect to login page after a short delay
                    setTimeout(() => {
                        window.location.href = '/login.html?new_user=true';
                    }, 2000);

                } else {
                    // Show error message from the server
                    messageEl.textContent = `Error: ${result.error}`;
                    messageEl.style.color = 'red';
                }
            } catch (err) {
                console.error('Failed to register:', err);
                messageEl.textContent = 'An error occurred. Please try again.';
                messageEl.style.color = 'red';
            }
        });
    }
});