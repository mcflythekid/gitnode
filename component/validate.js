/**
 * @author McFly the Kid
 * @date Apr 8 2018
 * */
var repositories = require('../conf/repo');
var githubsign = require('./githubsign');

var validate = function(req, res){
    if (!req.headers['x-github-event'] || req.headers['x-github-event'] !== 'push'){
        return 'PUSH event is required';
    }

    if (!req.body.ref || req.body.ref !== 'refs/heads/master'){
        return 'ORIGINS/MASTER is required';
    }

    if (!req.body.repository || !req.body.repository.full_name){
        return 'REPOSITORY NAME is required';
    }

    var repository = repositories.find(o => o.github_id === req.body.repository.full_name);
    if (!repository){
        return 'REPOSITORY not found';
    }

    if (!req.headers['x-hub-signature'] 
        || !githubsign(req.headers['x-hub-signature'], JSON.stringify(req.body), repository.secret)){
        return 'SIGNATURE is invalid';
    }

    return repository;
};

module.exports = validate;