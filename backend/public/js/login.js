// public/js/login.js
document.addEventListener('DOMContentLoaded', () => {
    // Make sure your login form in login.html has id="login-form"
    const loginForm = document.querySelector('#login-form');
    // Make sure you have <p id="message"></p> in your HTML to show errors
    const messageEl = document.querySelector('#message');

    //
    // --- STEP 1: CATCH THE SIGNAL ---
    // Check the URL for the 'new_user' parameter
    //
    const params = new URLSearchParams(window.location.search);
    const isNewUser = params.get('new_user') === 'true';

    // (Optional but clean: remove the param from the login URL)
    if (isNewUser) {
        window.history.replaceState(null, '', '/login.html');
    }
    //
    // --- END OF STEP 1 ---
    //

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

                    //
                    // --- STEP 2: PASS THE SIGNAL ---
                    // Check if they are a new user and redirect accordingly
                    //
                    if (isNewUser) {
                        // Redirect to the main page WITH the signal
                        window.location.href = '/?new_user=true';
                    } else {
                        // Redirect to the main page normally
                        window.location.href = '/';
                    }
                    //
                    // --- END OF STEP 2 ---
                    //

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