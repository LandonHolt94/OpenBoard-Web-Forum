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

    // Survey Modal Elements
    const surveyModal = document.querySelector('#survey-modal');
    const surveyForm = document.querySelector('#survey-form');
    const skipSurveyBtn = document.querySelector('#skip-survey-btn');


    // --- 1.5. CHECK FOR NEW USER SURVEY ---
    const params = new URLSearchParams(window.location.search);
    if (params.get('new_user') === 'true') {
        if (surveyModal) {
            surveyModal.style.display = 'flex';
        }
        window.history.replaceState(null, '', '/');
    }


    // --- 2. CHECK LOGIN STATE & UPDATE UI ---
    async function checkLoginState() {
        if (token) {
            try {
                const response = await fetch('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error('Token is invalid');
                }

                loggedInUser = await response.json();

                // --- Update UI for LOGGED-IN user ---
                authLinks.style.display = 'none';
                userInfo.style.display = 'flex';

                //
                // --- THIS IS THE FIX ---
                // Changed back to 'loggedInUser.Username' (UPPERCASE)
                //
                usernameDisplay.textContent = `Welcome, ${loggedInUser.username}`;
                createPostSection.style.display = 'block';

            } catch (error) {
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
        await fetchAndDisplayPosts();
    }

    // --- 4. FUNCTION TO FETCH & DISPLAY POSTS ---
    async function fetchAndDisplayPosts() {
        try {
            const response = await fetch('/api/posts');
            if (!response.ok) throw new Error('Failed to fetch posts');

            const posts = await response.json();
            postsContainer.innerHTML = '';

            if (posts.length === 0) {
                postsContainer.innerHTML = '<p>No posts yet. Be the first!</p>';
                return;
            }

            posts.forEach(post => {
                const postElement = document.createElement('article');
                postElement.className = 'post-card card';

                const postDate = new Date(post.CreatedAt).toLocaleString();

                //
                // --- FIX: Use UPPERCASE for post properties ---
                //
                postElement.innerHTML = `
                    <h3>${post.Title}</h3>
                    <p>${post.Body}</p>
                    <div class="post-meta">
                        <span>Posted by: <strong>${post.Username}</strong></span>
                        <span>On: ${postDate}</span>
                    </div>
                `;

                //
                // --- FIX: Use UPPERCASE for post properties ---
                //
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
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                postElement.remove();
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
        localStorage.removeItem('token');
        window.location.reload();
    });

    // Create Post Form
    createPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.querySelector('#post-title').value;
        const content = document.querySelector('#post-content').value;

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, body: content })
            });

            const result = await response.json();

            if (response.ok) {
                postMessage.textContent = 'Post created!';
                postMessage.style.color = 'green';
                createPostForm.reset();
                await fetchAndDisplayPosts();
            } else {
                postMessage.textContent = `Error: ${result.error}`;
                postMessage.style.color = 'red';
            }
        } catch (err) {
            postMessage.textContent = 'An network error occurred.';
            postMessage.style.color = 'red';
        }
    });


    // --- SURVEY MODAL LISTENERS (This part is correct) ---
    //
    if (surveyForm) {
        surveyForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(surveyForm);
            const referral = formData.get('referral');

            if (!token) {
                console.error("No token found, can't submit survey.");
                surveyModal.style.display = 'none';
                return;
            }

            try {
                const response = await fetch('/api/survey', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ referral: referral })
                });

                if (!response.ok) {
                    throw new Error('Failed to submit survey');
                }
                console.log('Survey submitted successfully!');
                //
                // --- THIS IS THE SYNTAX FIX ---
                // Changed the '.' to a '{'
                //
            } catch (err) {
                console.error('Error submitting survey:', err);
            }

            surveyModal.style.display = 'none';
        });
    }

    if (skipSurveyBtn) {
        skipSurveyBtn.addEventListener('click', () => {
            console.log('Survey skipped.');
            surveyModal.style.display = 'none'; // Hide modal
        });
    }
    //
    // --- END SURVEY LISTENERS ---
    //

    // --- 7. INITIALIZE THE APP ---
    checkLoginState();
});