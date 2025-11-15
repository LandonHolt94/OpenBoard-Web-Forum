// public/js/main.js
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. GET ALL OUR HTML ELEMENTS ---
    const postsContainer = document.querySelector('#posts-container');
    const createPostSection = document.querySelector('#create-post-section');
    const createPostForm = document.querySelector('#create-post-form');
    const postMessage = document.querySelector('#post-message');

    // Auth elements
    const authLinks = document.querySelector('#auth-links');
    const userInfo = document.querySelector('#user-info');
    const usernameDisplay = document.querySelector('#username-display');
    const logoutButton = document.querySelector('#logout-button');

    // Get token and check login state
    const token = localStorage.getItem('token');
    let loggedInUser = null; // We'll store user data here

    // --- 2. CHECK LOGIN STATE & UPDATE UI ---
    async function checkLoginState() {
        if (token) {
            // User *might* be logged in. Let's verify token with the server.
            try {
                //
                //  THIS IS THE CORRECTED LINE 
                //
                const response = await fetch('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error('Token is invalid');
                }

                loggedInUser = await response.json(); // Save user data (e.g., { userId: 1, ... })

                // --- Update UI for LOGGED-IN user ---
                authLinks.style.display = 'none';
                userInfo.style.display = 'flex';
                usernameDisplay.textContent = `Welcome, ${loggedInUser.username}`;
                createPostSection.style.display = 'block'; // Show the "Create Post" form

            } catch (error) {
                // Token is bad or expired
                console.warn('Invalid token:', error);
                localStorage.removeItem('token');
                // --- Update UI for LOGGED-OUT user ---
                authLinks.style.display = 'flex';
                userInfo.style.display = 'none';
                createPostSection.style.display = 'none';
            }
        } else {
            // --- Update UI for LOGGED-OUT user ---
            authLinks.style.display = 'flex';
            userInfo.style.display = 'none';
            createPostSection.style.display = 'none';
        }

        // --- 3. ALWAYS FETCH POSTS (after checking login) ---
        // We run this *after* checking login so we know who the user is
        await fetchAndDisplayPosts();
    }

    // --- 4. FUNCTION TO FETCH & DISPLAY POSTS ---
    async function fetchAndDisplayPosts() {
        try {
            // This URL is already correct
            const response = await fetch('/api/posts');
            if (!response.ok) throw new Error('Failed to fetch posts');

            const posts = await response.json();
            postsContainer.innerHTML = ''; // Clear loading/old posts

            if (posts.length === 0) {
                postsContainer.innerHTML = '<p>No posts yet. Be the first!</p>';
                return;
            }

            posts.forEach(post => {
                const postElement = document.createElement('article');
                postElement.className = 'post-card card';

                const postDate = new Date(post.CreatedAt).toLocaleString();

                postElement.innerHTML = `
                    <h3>${post.Title}</h3>
                    <p>${post.Content}</p>
                    <div class="post-meta">
                        <span>Posted by: <strong>${post.Username}</strong></span>
                        <span>On: ${postDate}</span>
                    </div>
                `;

                // --- Add Delete Button ONLY if user is logged in AND is the author ---
                if (loggedInUser && post.UserID === loggedInUser.userId) {
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.className = 'delete-button';
                    deleteButton.addEventListener('click', () => handleDeletePost(post.PostID, postElement));
                    postElement.appendChild(deleteButton);
                }

                postsContainer.appendChild(postElement);
            });

        } catch (error) {
            console.error('Error fetching posts:', error);
            postsContainer.innerHTML = '<p style="color: red;">Could not load posts.</p>';
        }
    }

    // --- 5. FUNCTION TO HANDLE DELETING A POST ---
    async function handleDeletePost(postId, postElement) {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            // This URL is already correct
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                postElement.remove(); // Remove post from the page instantly
            } else {
                const result = await response.json();
                alert(`Error: ${result.error || 'Failed to delete post.'}`);
            }
        } catch (err) {
            alert('An error occurred. Please try again.');
        }
    }

    // --- 6. ADD EVENT LISTENERS ---

    // Logout Button
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token'); // Clear the token
        window.location.reload(); // Refresh the page
    });

    // Create Post Form
    createPostForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Stop form from reloading page

        const title = document.querySelector('#post-title').value;
        const content = document.querySelector('#post-content').value;

        try {
            // This URL is already correct
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, content })
            });

            const result = await response.json();

            if (response.ok) {
                postMessage.textContent = 'Post created!';
                postMessage.style.color = 'green';
                createPostForm.reset(); // Clear the form
                await fetchAndDisplayPosts(); // Refresh posts list
            } else {
                postMessage.textContent = `Error: ${result.error}`;
                postMessage.style.color = 'red';
            }
        } catch (err) {
            postMessage.textContent = 'An network error occurred.';
            postMessage.style.color = 'red';
        }
    });

    // --- 7. INITIALIZE THE APP ---
    checkLoginState();
});