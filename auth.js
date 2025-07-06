document.addEventListener('DOMContentLoaded', () => {
    const USERS_KEY = 'natsUsers';

    // If on login page
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // If on signup page
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    function handleLogin(event) {
        event.preventDefault();
        const username = event.target.username.value;
        const password = event.target.password.value;

        const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            // Use sessionStorage to store login state for the current session
            sessionStorage.setItem('loggedInUser', username);
            window.location.href = 'Nats.html';
        } else {
            alert('Invalid username or password.');
        }
    }

    function handleSignup(event) {
        event.preventDefault();
        const username = event.target.username.value;
        const password = event.target.password.value;

        const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
        const userExists = users.some(u => u.username === username);

        if (userExists) {
            alert('Username already exists. Please choose another one.');
        } else {
            users.push({ username, password });
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
            alert('Signup successful! Please log in.');
            window.location.href = 'login.html';
        }
    }
});