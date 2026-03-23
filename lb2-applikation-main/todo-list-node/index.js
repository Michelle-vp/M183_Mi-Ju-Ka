const db = require('./fw/db');

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function getHtml(req) {
    const userId = req.session.user.userid;
    const username = req.session.user.username;

    const tasks = await db.executeStatement(
        'SELECT ID, title, state FROM tasks WHERE userID = ? ORDER BY ID DESC',
        [userId]
    );

    let html = `
<div class="container">
    <h1>Tasks</h1>
    <p class="welcome">Welcome, ${escapeHtml(username)}!</p>

    <a href="/edit" class="btn primary">+ Create Task</a>
`;

    if (!tasks || tasks.length === 0) {
        html += `<p>No tasks yet.</p>`;
        return html;
    }

    html += `
    <table class="task-table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Title</th>
                <th>State</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
    `;

    for (const task of tasks) {
        html += `
        <tr>
            <td>${escapeHtml(task.ID)}</td>
            <td>${escapeHtml(task.title)}</td>
            <td><span class="badge">${escapeHtml(task.state)}</span></td>
            <td>
                <a href="/edit?id=${encodeURIComponent(task.ID)}" class="btn small">Edit</a>
            </td>
        </tr>
    `;
    }

    html += `
            </tbody>
        </table>
    `;

    return html;
}

module.exports = {
    html: getHtml
};