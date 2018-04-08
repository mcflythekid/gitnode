/**
 * @author McFly the Kid
 * @date Apr 7 2018
 * */
var crypto = require('crypto');

var githubsign = function(signature, payload, secret) {
    const computedSignature = `sha1=${crypto.createHmac("sha1", secret).update(payload).digest("hex")}`;
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computedSignature));
};

module.exports = githubsign;