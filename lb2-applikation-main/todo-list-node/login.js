const db = require('./fw/db');

async function handleLogin(req) {
    let msg = '';
    let user = { username: '', userid: 0 };

    if (typeof req.body.username !== 'undefined' && typeof req.body.password !== 'undefined') {
        const username = String(req.body.username).trim();
        const password = String(req.body.password);

        const result = await validateLogin(username, password);

        if (result.valid) {
            user.username = result.username;
            user.userid = result.userId;
            msg = result.msg;
        } else {
            msg = result.msg;
        }
    }

    return { html: msg + getHtml(), user };
}

function startUserSession(req, res, user) {
    console.log('login valid... start user session now for userid ' + user.userid);

    req.session.user = {
    userid: user.userid,
    username: user.username,
    roleid: user.username === 'admin1' ? 1 : 2
};

    res.redirect('/');
}

async function validateLogin(username, password) {
    const result = { valid: false, msg: '', userId: 0, username: '' };
    let dbConnection;

    try {
        dbConnection = await db.connectDB();

        const sql = 'SELECT id, username, password FROM users WHERE username = ?';
        const [results] = await dbConnection.execute(sql, [username]);

        if (results.length > 0) {
            const dbUser = results[0];

            if (password === dbUser.password) {
                result.userId = dbUser.id;
                result.username = dbUser.username;
                result.valid = true;
                result.msg = 'Login successful';
            } else {
                result.msg = 'Invalid username or password';
            }
        } else {
            result.msg = 'Invalid username or password';
        }
    } catch (err) {
        console.log(err);
        result.msg = 'An error occurred during login';
    } finally {
        if (dbConnection) {
            await dbConnection.end();
        }
    }

    return result;
}

function getHtml() {
    return `
    <h2>Login</h2>

    <form id="form" method="post" action="/login">
        <div class="form-group">
            <label for="username">Username</label>
            <input type="text" class="form-control size-medium" name="username" id="username" required>
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" class="form-control size-medium" name="password" id="password" required>
        </div>
        <div class="form-group">
            <label for="submit"></label>
            <input id="submit" type="submit" class="btn size-auto" value="Login" />
        </div>
    </form>`;
}

module.exports = {
    handleLogin,
    startUserSession
};