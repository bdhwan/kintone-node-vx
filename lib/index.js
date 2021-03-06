'use strict';

var request = require('request');
var fs = require('fs');
var path = require('path');
var apis = require('./apis').loadDefault();

function authFromOption(options) {
    var header = {};
    var usernamePassword, base64;

    if (options.hasOwnProperty('basic')) {
        var basic = options.basic;

        if (typeof basic === 'string') {
            header['Authorization'] = 'Basic ' + basic;

        } else if (typeof basic === 'object') {
            if (basic.hasOwnProperty('username') && basic.hasOwnProperty('password')) {
                usernamePassword = basic.username + ':' + basic.password;
                base64 = new Buffer(usernamePassword).toString('base64');

                header['Authorization'] = 'Basic ' + base64;

            }
        }
    }

    if (options.hasOwnProperty('token')) {
        header['X-Cybozu-API-Token'] = options.token;
    } else if (options.hasOwnProperty('authorization')) {
        var authorization = options.authorization;

        if (typeof authorization === 'string') {
            header['X-Cybozu-Authorization'] = authorization;
        } else if (typeof authorization === 'object') {
            if (authorization.hasOwnProperty('username') && authorization.hasOwnProperty('password')) {
                usernamePassword = authorization.username + ':' + authorization.password;
                base64 = new Buffer(usernamePassword).toString('base64');

                header['X-Cybozu-Authorization'] = base64;
            }
        }
    }

    if (!header.hasOwnProperty('X-Cybozu-API-Token') && !header.hasOwnProperty('X-Cybozu-Authorization')) {
        throw new TypeError('Specify "token" or "authorization"');
    }
    return header;
}

function merge(source, target) {

    Object.keys(source).forEach(function(key) {
        target[key] = source[key];
    });
    return target;
}

function kintone(domain, authorization) {
    var authOption = authFromOption(authorization);

    // Add .cybozu.com if only sub-domain is specified.
    if (!domain.match('\\.')) {
        domain += '.cybozu.com';
    }

    function requestBase(link, data, callback) {
        var clonedLink = link.slice(0);
        var method = clonedLink.pop();

        clonedLink.unshift(domain, 'k', 'v1');

        var options = {
            url: 'https://' + clonedLink.join('/') + '.json',
            method: method.toUpperCase(),
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        };

        merge(authOption, options.headers);

        request(options, function(err, response, body) {
            callback(err, JSON.parse(body));
        });
    }

    for (var i = 0; i < apis.length; ++i) {
        var link = apis[i].split('/');
        var head = kintone.prototype;

        while (link.length !== 0) {
            var key = link.shift();

            if (!head.hasOwnProperty(key)) {
                head[key] = {};
            }
            if (link.length !== 0) {
                head = head[key];
            } else {
                head[key] = (function(linkStr) {
                    Object.freeze(linkStr);
                    return function(data, callback) {
                        return requestBase(linkStr, data, callback);
                    };
                }(apis[i].split('/')));
            }
        }
    }

    kintone.prototype.file.post = function(filename, callback) {
        var options = {
            url: 'https://' + domain + '/k/v1/file.json',
            headers: {},
            method: 'POST',
            formData: {
                file: {
                    value: fs.createReadStream(filename),
                    options: {
                        filename: path.basename(filename),
                        contentType: 'text/plain'
                    }
                }
            }
        };

        merge(authOption, options.headers);

        request(options, function(err, response, body) {
            callback(err, JSON.parse(body));
        });
    };

    kintone.prototype.file.get = function(fileKey, savePath, callback) {
        var options = {
            url: 'https://' + domain + '/k/v1/file.json?fileKey=' + fileKey,
            headers: {},
            method: 'GET'
        };

        merge(authOption, options.headers);
        var file = fs.createWriteStream(savePath);
        request(options).pipe(file);
        file.on('finish', function() {
            file.close(function() {
                callback(null, savePath);
            }); // close() is async, call callback after close completes.
        });
        file.on('error', function(err) {
            callback(err);
        });

    };


}

module.exports = kintone;