"use strict";
let model = require('./model');



let processText = (req, res) => {

    let match;
    let result = '';
    var output = new Object();
    let text = req.query.query;
    match = text.match(/help/i);
    if (match) {
        result =
        `You can ask me things like:
         Tell me the engagement stage of xyz@abc
         Tell me the Last 3 conversations with xyz@abc`;
        output.value = result;
        res.json(output);
    }
    match = text.match(/engagement stage of (.*)/i);
    if (match) {
        model.findEngagements(match[1]).then(function (engagement) {
            result = 'STAGE     : ' + engagement[0].STAGE + '\n' +
                'SCORE     : ' + engagement[0].SCORE + '\n' +
                'CONTACT   : ' + engagement[0].CONTACT + '\n' +
                'NAME      : ' + engagement[0].NAME;
            output.value = result;
            res.json(output);
        });

    }
    match = text.match(/Last (.*) conversations with (.*)/i);
    if (match) {
        model.findConversations(match[2], match[1]).then(function (conversation) {


            for (var i = 0; i < conversation.length; i++) {
                let value = conversation[i].CONVERSTAION.length;
                let conv = conversation[i].CONVERSTAION;
                conv = conv.replace(/<p>/gm, "");
                conv = conv.replace(/<br>/gm, " ");
                conv = conv.replace(/<\/p>/gm, "");
                conv = conv.replace(/<\/br>/gm, " ");
                result = result + conv + "  ";
            }
            output.value = result;
            res.json(output);
        });
    }
    return result;
}
exports.processText = processText;