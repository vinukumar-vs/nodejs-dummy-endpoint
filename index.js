var express    = require('express');
var app        = express();

var port = process.env.PORT || 4050;

app.post('/dummy', function(req, res) {
    res.json({ message: 'success' });   
});

app.listen(port);
console.log('server is running on port ' + port);