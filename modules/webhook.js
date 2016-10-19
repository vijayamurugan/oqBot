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
    Search account Acme
    Search Acme in accounts
    Search contact Smith
    What are my top 3 opportunities?
        `}, sender);
        return;
    }

    match = text.match(/engagement (.*)/i);
    if (match) {
        console.log(match[1]);
        sendMessage({ text: `Here are your engagements for ${match[1]}` }, sender);
        model.findEngagements(match[1]).then(function (engagement) {
            sendMessage({
                text:
                'STAGE     : ' + engagement[0].STAGE +
                'SCORE     : ' + engagement[0].SCORE +
                'CONTACT   : ' + engagement[0].CONTACT +
                'NAME      : ' + engagement[0].NAME
            }, sender);
        });

        return;
    }

    match = text.match(/Last (.*) conversations for (.*)/i);
    if (match) {
        let text = '';
        sendMessage({ text: `Here are your top ${match[1]} converstions for ${match[2]}` }, sender);
        model.findConversations(match[2], match[1]).then(function (conversation) {
            console.log(conversation.length);

            for (var i = 0; i < conversation.length; i++) {
               text = text + conversation[i].CONVERSTAION + "<br>";
               sendMessage({ text: ''+ conversation[i].CONVERSTAION }, sender);
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