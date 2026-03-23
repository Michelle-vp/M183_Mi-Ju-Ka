const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const header = require('./fw/header');
const footer = require('./fw/footer');
const waf = require('./fw/waf');
const login = require('./login');
const index = require('./index');
const adminUser = require('./admin/users');
const editTask = require('./edit');
const saveTask = require('./savetask');
const search = require('./search');
const searchProvider = require('./search/v2/index');

const app = express();
const PORT = 3000;

app.use(session({
    secret: process.env.SESSION_SECRET || 'change-this-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'strict',
        secure: false
    }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.'
});

app.use(limiter);
app.use(waf);

function activeUserSession(req) {
    return !!req.session?.user;
}

function requireLogin(req, res, next) {
    if (!activeUserSession(req)) {
        return res.redirect('/login');
    }
    next();
}

function requireAdmin(req, res, next) {
    if (!req.session?.user || req.session.user.roleid !== 1) {
        return res.status(403).send('Access denied');
    }
    next();
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

app.get('/', requireLogin, async (req, res) => {
    const html = await wrapContent(await index.html(req), req);
    res.send(html);
});

app.post('/', requireLogin, async (req, res) => {
    const html = await wrapContent(await index.html(req), req);
    res.send(html);
});

app.get('/edit', requireLogin, async (req, res) => {
    const html = await wrapContent(await editTask.html(req), req);
    res.send(html);
});

app.post('/savetask', requireLogin, async (req, res) => {
    const html = await wrapContent(await saveTask.html(req), req);
    res.send(html);
});

app.get('/admin/users', requireLogin, requireAdmin, async (req, res) => {
    const html = await wrapContent(await adminUser.html(), req);
    res.send(html);
});

app.get('/login', async (req, res) => {
    const content = await login.handleLogin({ body: {} });
    const html = await wrapContent(content.html, req);
    res.send(html);
});

app.post('/login', async (req, res) => {
    const content = await login.handleLogin(req);

    if (content.user.userid !== 0) {
        login.startUserSession(req, res, content.user);
    } else {
        const html = await wrapContent(content.html, req);
        res.send(html);
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

app.get('/profile', requireLogin, (req, res) => {
    res.send(`Welcome, ${escapeHtml(req.session.user.username)}! <a href="/logout">Logout</a>`);
});

app.post('/search', requireLogin, async (req, res) => {
    const html = await search.html(req);
    res.send(html);
});

app.get('/search/v2/', requireLogin, async (req, res) => {
    const result = await searchProvider.search(req);
    res.send(result);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

async function wrapContent(content, req) {
    const headerHtml = await header(req);
    return headerHtml + content + footer;
}