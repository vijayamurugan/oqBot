var express = require('express'),
    bodyParser = require('body-parser'),
    webhook = require('./modules/webhook'),
    restapi = require('./modules/restapi'),
    app = express();

app.set('port', process.env.PORT || 5000);

app.use(bodyParser.json());

app.get('/webhook', webhook.handleGet);
app.post('/webhook', webhook.handlePost);
app.get('/api', restapi.processText);

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

