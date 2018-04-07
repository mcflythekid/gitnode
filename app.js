const { spawn } = require('child_process');
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var app = express();
app.use(bodyParser.json());

app.post("/test", (req, res)=> {
    if (!req.body.ref || req.body.ref !== 'refs/heads/master') {
        res.end("Require refs/heads/master");
        return;
    }
    if (!/^[a-z0-9-]+$/i.test(req.body.repository.name)){
        res.end("Require valid repository name");
        return;
    }

    var script = req.body.repository.name + '.sh';
    if (fs.existsSync(script)) {
        var logStream = fs.createWriteStream(req.body.repository.name + '.log', {flags: 'a'});
        var proc = spawn('bash', [script]);
        proc.stdout.pipe(logStream);
        proc.stderr.pipe(logStream);
        proc.on('close', function (code) {
            logStream.end();
        });
        res.end('Done');
    }
    res.end('Repository not found');
});

app.listen(9000);
