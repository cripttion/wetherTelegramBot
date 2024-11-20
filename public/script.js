document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKeyInput');
    const updateApiKeyBtn = document.getElementById('updateApiKeyBtn');
    const fetchUsersBtn = document.getElementById('fetchUsersBtn');
    const usersTableBody = document.getElementById('usersTable').querySelector('tbody');

    // Update API Key
    updateApiKeyBtn.addEventListener('click', () => {
        const apiKey = apiKeyInput.value;
        if (!apiKey) {
            alert('Please enter an API key.');
            return;
        }

        fetch('/api/update-settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey })
        })
        .then(response => response.json())
        .then(data => alert(data.message))
        .catch(() => alert('Failed to update API key.'));
    });

    // Fetch Users
    fetchUsersBtn.addEventListener('click', () => {
        fetch('/api/users')
            .then(response => response.json())
            .then(users => {
                usersTableBody.innerHTML = '';
                users.forEach(user => {
                    const row = document.createElement('tr');
                    const actions = user.blocked === 1
                        ? `<button onclick="unblockUser(${user.chat_id})">Unblock</button>`
                        : `<button onclick="blockUser(${user.chat_id})">Block</button>`;

                    const deleteAction = `<button onclick="deleteUser(${user.chat_id})">Delete</button>`;

                    row.innerHTML = `
                        <td>${user.id}</td>
                        <td>${user.username}</td>
                        <td>${user.chat_id}</td>
                        <td>${user.blocked === 0 ? 'Active' : 'Blocked'}</td>
                        <td>
                            ${actions} ${deleteAction}
                        </td>
                    `;
                    usersTableBody.appendChild(row);
                });
            })
            .catch(() => alert('Failed to fetch users.'));
    });
});

// Block User
function blockUser(chatId) {
    fetch('/api/block-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        // location.reload(); // Refresh the users list to show updated status
    })
    .catch(() => alert('Failed to block user.'));
}

// Unblock User
function unblockUser(chatId) {
    fetch('/api/unblock-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        // location.reload(); // Refresh the users list to show updated status
    })
    .catch(() => alert('Failed to unblock user.'));
}

// Delete User
function deleteUser(chatId) {
    fetch('/api/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        // location.reload(); // Refresh the users list to show updated status
    })
    .catch(() => alert('Failed to delete user.'));
}
