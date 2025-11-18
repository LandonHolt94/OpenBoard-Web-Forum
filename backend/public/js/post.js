// public/js/post.js
document.addEventListener('DOMContentLoaded', () => {

    // Get the main containers
    const postContainer = document.querySelector('#post-detail-container');

    // 1. Get the Post ID from the URL
    // (e.g., /post.html?id=3)
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');

    if (!postId) {
        postContainer.innerHTML = '<p style="color:red;">Error: No post ID specified.</p>';
        return;
    }

    // 2. Fetch and display the single post
    async function fetchPost() {
        try {
            const response = await fetch(`/api/posts/${postId}`);
            if (!response.ok) {
                throw new Error('Post not found');
            }

            const post = await response.json();

            // Format the date
            const postDate = new Date(post.CreatedAt).toLocaleString();

            // Display the post
            postContainer.innerHTML = `
                <article class="card">
                    <h2>${post.Title}</h2>
                    <div class="post-meta">
                        <span>Posted by: <strong>${post.Username}</strong></span>
                        <span>On: ${postDate}</span>
                    </div>
                    <div class="post-body">
                        <pre>${post.Body}</pre>
                    </div>
                </article>
            `;

        } catch (error) {
            postContainer.innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
        }
    }

    fetchPost();

    // We also need to check the login state for the navbar
    // You can copy/paste the `checkLoginState()` function from main.js
    // or (better) move it to a shared auth.js file.
    // For now, let's just do a simple check.

    const token = localStorage.getItem('token');
    if (token) {
        document.querySelector('#auth-links').style.display = 'none';
        document.querySelector('#user-info').style.display = 'flex';
        // (You'd also fetch /api/auth/me here to get the username)
    }
});