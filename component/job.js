var touch = require('touch');
var fs = require('fs');
var config = require('../conf/config');
var repositories = require('../conf/repo');
var moment = require('moment');
var spawn = require('child_process').spawn;
var path = require("path");

var job =(function(e){
    var getAJobFileName = function(job_dir){
        var fileName = null;
        fs.readdirSync(job_dir).forEach(file => {
            if (file.endsWith('.job')) {
                fileName = file;
            };
        });
        return fileName;
    };

    e.run = function(job_dir){

        
        // Check lock
        var lockFile = job_dir + "/lock";
        if (fs.existsSync(lockFile)) return;

        // Get repo
        var jobFileName = getAJobFileName(job_dir);
        if (!jobFileName) return; 
        var repoName = jobFileName.split('.')[0];
        var repository = repositories.find(o => o.name === repoName);
        if (!repository){
            fs.unlink(jobFileName);
            return;
        }
        
        // Create lock
        console.log('Building: ' + repository.github_id);
        touch(lockFile, {
            "force": true
        });
        
        // Create log
        if (!fs.existsSync(config.DIR_LOG)) fs.mkdirSync(config.DIR_LOG);
        var logStream = fs.createWriteStream(config.DIR_LOG + "/" + repository.name + '.log', {flags: 'a'});
        logStream.write("\ngitnode-build [" + moment().format("YYYY-MM-DD HH:mm:ss") + "]\n");
        
        // New process
        var scriptFile = config.DIR_SCRIPT + '/' + repoName + '.sh';
        if (!fs.existsSync(scriptFile)) scriptFile = '';
        scriptFile = path.resolve(scriptFile);
        var proc = spawn('bash', 
            [
                config.SCRIPT_DEFAULT, 
                'https://github.com/' + repository.github_id, 
                repository.location ? repository.location : config.DIR_BUILD + '/' + repository.name,
                scriptFile
            ]
        );
        proc.stdout.pipe(logStream);
        proc.stderr.pipe(logStream);

        // On close
        proc.on('close', function (code) {
            logStream.end();
            fs.unlinkSync(job_dir + '/' + jobFileName);
            fs.unlinkSync(lockFile);
        });
    };

    return e;
})({});

module.exports = job;