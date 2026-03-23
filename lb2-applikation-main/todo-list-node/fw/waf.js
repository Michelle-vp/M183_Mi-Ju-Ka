function waf(req, res, next) {
    const suspiciousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i,
        /\b(union\s+select|select\s.+\sfrom|insert\s+into|drop\s+table|delete\s+from|update\s+\w+\s+set)\b/i,
        /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
        /(\.\.\/|\.\.\\)/i,
        /(<|%3C).*?(>|%3E)/i
    ];

    const userAgent = req.get('User-Agent') || '';
    const url = req.originalUrl || '';
    const method = req.method || '';

    const requestData = JSON.stringify({
        query: req.query,
        body: req.body,
        params: req.params,
        headers: {
            'user-agent': userAgent,
            'content-type': req.get('Content-Type') || ''
        },
        url,
        method
    });

    for (const pattern of suspiciousPatterns) {
        if (pattern.test(requestData)) {
            console.log(`[WAF] Blocked suspicious request from ${req.ip}: ${method} ${url}`);
            return res.status(403).send('Request blocked by WAF');
        }
    }

    next();
}

module.exports = waf;