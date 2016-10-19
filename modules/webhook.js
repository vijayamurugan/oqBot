"use strict";

let request = require('request'),
    formatter = require('./formatter-messenger'),
    model = require('./model');

let sendMessage = (message, recipient) => {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: process.env.FB_PAGE_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: recipient },
            message: message
        }
    }, (error, response) => {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

let processText = (text, sender) => {
    let match;
    match = text.match(/help/i);
    if (match) {
        sendMessage({
            text:
            `You can ask me things like:
    Tell me the engagement stage of xyz@abc
    Tell me the Last 3 conversations with xyz@abc
       `}, sender);
        return;
    }

    match = text.match(/engagement stage of (.*)/i);
    if (match) {
        console.log(match[1]);
        sendMessage({ text: `Here are your engagements stage of ${match[1]}` }, sender);
        model.findEngagements(match[1]).then(function (engagement) {
            sendMessage({
                text:
                'STAGE     : ' + engagement[0].STAGE + ' ' +
                'SCORE     : ' + engagement[0].SCORE + ' ' +
                'CONTACT   : ' + engagement[0].CONTACT + ' ' +
                'NAME      : ' + engagement[0].NAME
            }, sender);
        });

        return;
    }
    String.prototype.allReplace = function (obj) {
        var retStr = this;
        for (var x in obj) {
            retStr = retStr.replace(new RegExp(x, 'g'), obj[x]);
        }
        return retStr;
    };
    match = text.match(/Last (.*) conversations with (.*)/i);
    if (match) {
        let text = '';
        sendMessage({ text: `Here are your top ${match[1]} conversations for ${match[2]}` }, sender);
        model.findConversations(match[2], match[1]).then(function (conversation) {


            for (var i = 0; i < conversation.length; i++) {
                let value = conversation[i].CONVERSTAION.length;
                console.log('VALUE=' + value)
                let conv = conversation[i].CONVERSTAION;
                conv = conv.replace(/<p>/gm, "");
                conv = conv.replace(/<br>/gm, " ");
                conv = conv.replace(/<\/p>/gm, "");
                conv = conv.replace(/<\/br>/gm, " ");
                if (value <= 300) {
                    sendMessage({ text: '' + conv }, sender);
                }
                else {
                    sendMessage({ text: '' + conv.substring(0, 299) }, sender);
                    sendMessage({ text: '' + conv.substring(300, value - 1) }, sender);
                }
            }
        });
        console.log(text);
        return;
    }
};


let handleGet = (req, res) => {
    if (req.query['hub.verify_token'] === process.env.FB_VERIFY_TOKEN) {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong validation token');
};



let handlePost = (req, res) => {
    let events = req.body.entry[0].messaging;
    for (let i = 0; i < events.length; i++) {
        let event = events[i];
        let sender = event.sender.id;
        if (process.env.MAINTENANCE_MODE && ((event.message && event.message.text) || event.postback)) {
            sendMessage({ text: `Sorry I'm taking a break right now.` }, sender);
        } else if (event.message && event.message.text) {
            processText(event.message.text, sender);
        } else if (event.postback) {
            let payload = event.postback.payload.split(",");
            // if (payload[0] === "view_contacts") {
            //     sendMessage({text: "OK, looking for your contacts at " + payload[2] + "..."}, sender);
            //     salesforce.findContactsByAccount(payload[1]).then(contacts => sendMessage(formatter.formatContacts(contacts), sender));
            // } else if (payload[0] === "close_won") {
            //     sendMessage({text: `OK, I closed the opportunity "${payload[2]}" as "Close Won".`}, sender);
            // } else if (payload[0] === "close_lost") {
            //     sendMessage({text: `I'm sorry to hear that. I closed the opportunity "${payload[2]}" as "Close Lost".`}, sender);
            // }
        }
    }
    res.sendStatus(200);
};

exports.handleGet = handleGet;
exports.handlePost = handlePost;