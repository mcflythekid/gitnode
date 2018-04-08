/**
 * @author McFly the Kid
 * @date Apr 7 2018
 * */
var app = require('express')();
var bodyParser = require('body-parser');
var fs = require('fs');
var randomstring = require("randomstring");
var touch = require("touch");
var CronJob = require('cron').CronJob;

var job = require('./component/job');
var config = require('./conf/config');
var validate = require('./component/validate');

app.use(bodyParser.json());
app.post(config.MAPPING, (req, res)=> {
    // Get repository from request
    var repository = validate(req, res);
    if (typeof repository === 'string'){
        res.end(repository);
        return;
    }

    // Schedule job
    var jobFile ='.job/' + repository.name + '.' + randomstring.generate(7) + '.job';
    touch(jobFile,{"force":true});
    res.end('Build scheduled');
});

// Register Job
if (!fs.existsSync(config.DIR_JOB)) fs.mkdirSync(config.DIR_JOB);
new CronJob('* * * * * *', function() {
    job.run(config.DIR_JOB);
}, null, true, 'America/Los_Angeles');

app.listen(config.PORT);