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
    let title = '';
    let state = '';
    let taskId = '';
    let html = '';
    const options = ['open', 'in progress', 'done'];

    if (req.query.id) {
        taskId = Number(req.query.id);

        if (!Number.isInteger(taskId) || taskId <= 0) {
            return `<span class='info info-error'>Invalid task ID</span>`;
        }

        const result = await db.executeStatement(
            'SELECT ID, title, state FROM tasks WHERE ID = ? AND userID = ?',
            [taskId, req.session.user.userid]
        );

        if (result.length > 0) {
            title = result[0].title;
            state = result[0].state;
        }

        html += `<h1>Edit Task</h1>`;
    } else {
        html += `<h1>Create Task</h1>`;
    }

    html += `
    <form id="form" method="post" action="/savetask">
        <input type="hidden" name="id" value="${escapeHtml(taskId)}" />
        <div class="form-group">
            <label for="title">Description</label>
            <input type="text" class="form-control size-medium" name="title" id="title" value="${escapeHtml(title)}">
        </div>
        <div class="form-group">
            <label for="state">State</label>
            <select name="state" id="state" class="size-auto">`;

    for (const option of options) {
        const selected = state === option ? 'selected' : '';
        html += `<option value="${escapeHtml(option)}" ${selected}>${escapeHtml(option)}</option>`;
    }

    html += `
            </select>
        </div>
        <div class="form-group">
            <label for="submit"></label>
            <input id="submit" type="submit" class="btn size-auto" value="Submit" />
        </div>
    </form>`;

    return html;
}

module.exports = { html: getHtml };