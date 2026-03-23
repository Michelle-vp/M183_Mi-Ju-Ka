const db = require('../fw/db');

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function getHtml(req) {
    let html = `
    <section id="list">
        <a href="/edit">Create Task</a>
        <table>
            <tr>
                <th>ID</th>
                <th>Description</th>
                <th>State</th>
                <th></th>
            </tr>
    `;

    const result = await db.executeStatement(
        'SELECT ID, title, state FROM tasks WHERE userID = ?',
        [req.session.user.userid]
    );

    result.forEach((row) => {
        html += `
            <tr>
                <td>${escapeHtml(row.ID)}</td>
                <td class="wide">${escapeHtml(row.title)}</td>
                <td>${escapeHtml(ucfirst(row.state))}</td>
                <td>
                    <a href="/edit?id=${encodeURIComponent(row.ID)}">edit</a>
                </td>
            </tr>`;
    });

    html += `
        </table>
    </section>`;

    return html;
}

function ucfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = { html: getHtml };