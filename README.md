Node-kintone
============

A Node.js wrapper for kintone API. from original kintone sdk (https://github.com/ueokande/node-kintone)
added upload, download file function


Installation
------------

Install via [npm](https://www.npmjs.com/package/kintone-vx)

```
npm install kintone-vx
```

Usage
-----

The following example fetches the information of an app by API token:

```javascript
var kintone = require('kintone');

var token = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
var api = new kintone('example.cybozu.com', { token: token });
api.app.get({ id: 1 }, function(err, response) {
    console.log(response);
});
```

Authorization by username and password is also allowed:

```javascript
var api = new kintone('example.cybozu.com', {
    authorization: {
      username: "XXXXXXXX",
      password: "XXXXXXXX"
    }
});
```

Authorization with basic authentication:

```javascript
var api = new kintone('example.cybozu.com', {
    authorization: {
      username: "XXXXXXXX",
      password: "XXXXXXXX"
    },
    basic: {
      username: "YYYYYYYY",
      password: "YYYYYYYY",
    }
});
```


Upload file 
```javascript
api.file.post(filePath, function(fileErr, fileRes) {
    if (fileErr) {
      //error upload file                
    } else {
       var fileKey = fileRes.fileKey;
      //complete upload file
    }
});
```



Donwload file 
```javascript
api.file.get(fileKey, savePath, function(err, result) {
    if (err) {
      //error download file                
    } else {
      //complete download file
    }
});
```


API Documentation
-----------------

- [cybozu developer network](https://cybozudev.zendesk.com/)

LICENSE
-------

MIT

