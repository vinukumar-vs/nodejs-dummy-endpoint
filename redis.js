// const redis = require("redis");
var express    = require('express');
var log    = require('loglevel');
var app        = express();

var redisDB = require('./database/redis')
var nconf = require('nconf');

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
        "host": "127.0.0.1",
        "port": "6379",
        "password": "",
        "database": "0"
        },
    "keys": ["category:1","category:2","category:3","category:4"],
    "loop": 10,
    "logLevel": "info" 
}

// nconf.set('redis', {'host': '127.0.0.1', 'port': '6379', 'database': 0, 'password': ""})

// Direct connection to redis
// const client = redis.createClient(config.database.port, config.database.host, config.database);
// client.on("error", function(error) {
//     log.error("Redis connection failed", error);
// });

log.setLevel(config.logLevel);
var port = process.env.PORT || config.port;
var loopCount = 0;

app.post('/dummy', function(req, res) {
    res.json({ message: 'success' });   
});


async function runCommand(keyName) {
    try {
        config.key = keyName; //config.keys[getKeyIndex()];
        var result = await redisDB.getObject(config.key);
        log.info(`Key:${config.key}, Result: ${JSON.stringify(result)}`);
        log.info(`Loop: ${loopCount} Key:"${config.key}" Result: success`);
        loopCount++;
        if(loopCount < config.loop) {
            runCommand(config.key);
        } else {
            loopCount = 0;
            loadNextKey();
        }
    } catch(err) {
        log.error(`Loop: ${loopCount} Key: ${config.key} Result: No data, ${JSON.stringify(err.message)}`)
    }
   
    // var result = await client.hgetall(config.key, function(err, res) {
    //     if(res) {
    //         console.log('data---', res)
    //         log.debug(`Key:"${config.key}" Result: `, JSON.stringify(res));
    //         log.info(`Loop: ${loopCount} Key:"${config.key}" Result: success`);
    //     }
    //     else {
    //         log.error(`Loop: ${loopCount} Key: ${config.key} Result: No data`)
    //     }

    //     loopCount++;
    //     if(loopCount < config.loop) {
    //         runCommand(config.key);
    //     } else {
    //         loopCount = 0;
    //         loadNextKey();
    //     }
    // });
    // log.info(result);
 }

async function loadNextKey() {
    await redisDB.init();
    var keyName = getKeyIndex();
    if(keyName) {
        log.info(`Get data for key: ${keyName}`);
        runCommand(keyName);
    }
}

function getKeyIndex() {
    if(!config.key) return config.keys[0];

    var keyIndex = config.keys.indexOf(config.key) + 1;

    return config.keys[keyIndex]
}

app.listen(port); 

log.info('server is running on port ' + port);

 // Now call above function after 2 seconds
// setTimeout(redisCommand, 1000);
loadNextKey();
