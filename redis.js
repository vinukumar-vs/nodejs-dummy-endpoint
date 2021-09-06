const redis = require("redis");
var express    = require('express');
var app        = express();

/**
 * Sample redis database config object
 * Reference: https://www.npmjs.com/package/redis
 */ 
// var database = {
//     "host": "portal-redis.redis.cache.windows.net",
//     "port": 6379,
//     "username": "",
//     "password": "MyR7oB+2nmDYrMACIx0gFJVZULlxFSyBMjFl9loRBlc=",
//     "db": 11
// }

let config = {
    "port": 4050,
    "database": {
            "host": "localhost",
            "port": 6379,
            "password": "",
            "db": 0
        },
    "keys": ["category:6"],
    "loop": 10
}

const client = redis.createClient(config.database.port, config.database.host, config.database);
client.on("error", function(error) {
    console.error("Redis connection failed", error);
});
var port = process.env.PORT || config.port;
var loopCount = 0;

app.post('/dummy', function(req, res) {
    res.json({ message: 'success' });   
});


async function runCommand(keyName) {
    // console.log('Running command HGETALL: ', config.key)
    config.key = keyName; //config.keys[getKeyIndex()];
    var result = await client.hgetall(config.key, function(err, res) {
        if(res)
            console.log(`Key:"${config.key}" Result: `, JSON.stringify(res));
        else 
            console.error(`Key: ${config.key} Result: No data`)

        loopCount++;
        if(loopCount < config.loop) {
            runCommand(config.key);
        } else {
            loopCount = 0;
            loadNextKey();
        }
    });
    // console.log(result);
 }

function loadNextKey() {
    var keyName = getKeyIndex();
    if(keyName) {
        runCommand(keyName);
    }
}

function getKeyIndex() {
    if(!config.key) return config.keys[0];

    var keyIndex = config.keys.indexOf(config.key) + 1;

    return config.keys[keyIndex]
}

app.listen(port); 

console.log('server is running on port ' + port);

 // Now call above function after 2 seconds
// setTimeout(redisCommand, 1000);
loadNextKey();
