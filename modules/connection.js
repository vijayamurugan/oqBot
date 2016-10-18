"use strict";

let mysql = require('mysql');

function connection() {
    this.pool = null;
    
    this.pool = mysql.createPool({
        connectionLimit: 100,
        host: 'owe.czq31meskx6y.ap-southeast-1.rds.amazonaws.com',
        user: 'vijay',
        password: 'vijay123',
        database: 'owe'
    });
    
    this.acquire = function(callback) {
        this.pool.getConnection(function(err, connection) {
            if(err) {
                console.log('Connection not established');
            }
            callback(err,connection);
        });
    }
}

module.exports = new connection();
