const db = require('./fw/db');

async function getHtml(req) {
    let html = '';
    let taskId = null;

    if (!req.body.title || !req.body.state) {
        return "<span class='info info-error'>No update was made</span>";
    }

    const title = String(req.body.title).trim();
    const state = String(req.body.state).trim();
    const userid = req.session.user.userid;

    const allowedStates = ['open', 'in progress', 'done'];
    if (!allowedStates.includes(state)) {
        return "<span class='info info-error'>Invalid state</span>";
    }

    if (req.body.id) {
        taskId = Number(req.body.id);

        if (!Number.isInteger(taskId) || taskId <= 0) {
            return "<span class='info info-error'>Invalid task ID</span>";
        }

        const existing = await db.executeStatement(
            'SELECT ID FROM tasks WHERE ID = ? AND userID = ?',
            [taskId, userid]
        );

        if (existing.length === 0) {
            return "<span class='info info-error'>Task not found</span>";
        }
    }

    if (!taskId) {
        await db.executeStatement(
            'INSERT INTO tasks (title, state, userID) VALUES (?, ?, ?)',
            [title, state, userid]
        );
    } else {
        await db.executeStatement(
            'UPDATE tasks SET title = ?, state = ? WHERE ID = ? AND userID = ?',
            [title, state, taskId, userid]
        );
    }

    html += "<span class='info info-success'>Update successful</span>";
    return html;
}

module.exports = { html: getHtml };