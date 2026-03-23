const mysql = require('mysql2/promise');
const dbConfig = require('../config');

async function connectDB() {
    try {
        return await mysql.createConnection(dbConfig);
    } catch (error) {
        console.error('Error connecting to database:', error);
        throw error;
    }
}

async function executeStatement(statement, params = []) {
    const conn = await connectDB();
    try {
        const [results] = await conn.execute(statement, params);
        return results;
    } finally {
        await conn.end();
    }
}

module.exports = {
    connectDB,
    executeStatement
};
