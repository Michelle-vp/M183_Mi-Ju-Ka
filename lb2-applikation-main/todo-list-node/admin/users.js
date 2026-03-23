const db = require('../fw/db');

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function getHtml() {
    let conn;
    let html = '';

    try {
        conn = await db.connectDB();

        const sql = `
            SELECT users.ID, users.username, roles.title
            FROM users
            INNER JOIN permissions ON users.ID = permissions.userID
            INNER JOIN roles ON permissions.roleID = roles.ID
            ORDER BY username
        `;

        const [result] = await conn.execute(sql);

        html += `
        <h2>User List</h2>

        <table>
            <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Role</th>
            </tr>`;

        result.forEach((record) => {
            html += `
            <tr>
                <td>${escapeHtml(record.ID)}</td>
                <td>${escapeHtml(record.username)}</td>
                <td>${escapeHtml(record.title)}</td>
            </tr>`;
        });

        html += `
        </table>`;

        return html;
    } catch (error) {
        console.error('Error loading users:', error);
        return `<span class="info info-error">Could not load users.</span>`;
    } finally {
        if (conn) {
            await conn.end();
        }
    }
}

module.exports = { html: getHtml };