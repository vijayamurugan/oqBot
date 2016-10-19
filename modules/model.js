"use strict";

let connection = require('./connection');

function model() {

    this.findEngagements = (emailID) => {
        return new Promise((resolve, reject) => {
            connection.acquire(function (err, connection) {
                connection.query('SELECT IQ_ENGAGEMENT_STAGE STAGE, IQ_ENGAGEMENT_SCORE SCORE, IQ_LEAD_CONTACT CONTACT, IQ_LEAD_NAME NAME FROM `owe`.`IQ_LEAD` WHERE IQ_LEAD_EMAIL = ? ORDER BY IQ_LEAD_LASTMODIFIED_DATE DESC LIMIT 1', [emailID], function (err, rows, fields) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    else {
                        resolve(rows);
                    }

                });
            });
        });

    };


    this.findConversations = function (emailID, limit) {
        return new Promise((resolve, reject) => {
            connection.acquire(function (err, connection) {
                connection.query('SELECT IQ_DIALOGUE_RAW_MESSAGE CONVERSTAION FROM `owe`.`IQ_DIALOGUE` WHERE IQ_TO_ADDRESS = ? ORDER BY IQ_LAST_UPDATED_DATE DESC LIMIT ' + limit, [emailID], function (err, rows, fields) {
                    if (err) {
                        console.log(err);
                         return;
                    }
                    else {
                          resolve(rows);
                    }

                });
            });
        });
    };



}

module.exports = new model();
