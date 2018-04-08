/**
 * @author McFly the Kid
 * @date Apr 7 2018
 * */
var spawn = require('child_process').spawn;
var app = require('express')();
var bodyParser = require('body-parser');
var fs = require('fs');
var moment = require('moment');

var config = require('./conf/config');
var githubsign = require('./component/githubsign');
var repo = require('./conf/repo');

const BRANCH_MASTER = 'refs/heads/master';
const GITHUB_SIGN_HEADER = 'x-hub-signature';
const GITHUB_PUSH_HEADER = 'x-github-event';
const PUSH_EVENT = 'push';
const GITHUB_PREFIX = 'https://github.com';
const LOG_DIR = "log";
const BUILD_DIR = "build";
const SCRIPT_DEFAULT = "component/default.sh";

var getRepository = function(req, res){
    if (!req.headers[GITHUB_PUSH_HEADER] || req.headers[GITHUB_PUSH_HEADER] !== PUSH_EVENT){
        return 'PUSH event is required';
    }

    if (!req.body.ref || req.body.ref !== BRANCH_MASTER){
        return 'ORIGINS/MASTER is required';
    }

    if (!req.body.repository || !req.body.repository.full_name){
        return 'REPOSITORY NAME is required';
    }

    var repository =repo.find(o => o.github_id === req.body.repository.full_name);
    if (!repository){
        return 'REPOSITORY not found';
    }

    if (!req.headers[GITHUB_SIGN_HEADER] 
        || !githubsign(req.headers[GITHUB_SIGN_HEADER], JSON.stringify(req.body), repository.secret)){
        return 'SIGNATURE is invalid';
    }

    return repository;
};

app.use(bodyParser.json());

app.post(config.MAPPING, (req, res)=> {

    var repository = getRepository(req, res);
    if (typeof repository === 'string'){
        res.end(repository);
        return;
    }

    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);
    var logStream = fs.createWriteStream(LOG_DIR + "/" + repository.name + '.log', {flags: 'a'});
    logStream.write("\ngitnode-build [" + moment().format("YYYY-MM-DD HH:mm:ss") + "]\n");
    var proc = spawn('bash', 
        [
            SCRIPT_DEFAULT, 
            GITHUB_PREFIX + '/' + repository.github_id, 
            BUILD_DIR + '/' + repository.name
        ]
    );
    proc.stdout.pipe(logStream);
    proc.stderr.pipe(logStream);
    proc.on('close', function (code) {
        logStream.end();
    });

    res.end('OK');
});

app.listen(config.PORT);

