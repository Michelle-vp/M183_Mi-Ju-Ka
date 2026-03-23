const db = require('../../fw/db');

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function search(req) {
    if (!req.session?.user?.userid || req.query.terms === undefined) {
        return 'Not enough information to search';
    }

    const userid = req.session.user.userid;
    const terms = String(req.query.terms).trim();
    let result = '';

    const stmt = await db.executeStatement(
        'SELECT ID, title, state FROM tasks WHERE userID = ? AND title LIKE ?',
        [userid, `%${terms}%`]
    );

    if (stmt.length > 0) {
        stmt.forEach((row) => {
            result += `${escapeHtml(row.title)} (${escapeHtml(row.state)})<br />`;
        });
    } else {
        result = 'No results found!';
    }

    return result;
}

module.exports = { search };