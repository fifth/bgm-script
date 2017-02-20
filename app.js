var express = require('express');
var superagent = require('superagent');
var cheerio = require('cheerio');

var app = express();

function findID (e) {
    return e.split('/')[3];
}

app.get(/^\/bgm\-api\/getFriendsList\/\w+/, function (req, res) {
    // var uid = findID(req._parsedUrl.pathname);
    var uid = findID(req.url);
    // var fullInfo = req.query.fullInfo || 0;
    var fullInfo = 0;
    superagent
        .get('http://bangumi.tv/user/' + uid + '/friends')
        .end(function (err, data) {
            var txt = data.text;
            var $ = cheerio.load(txt);
            var friendsList = {};
            $('li.user a').each(function (i, elem) {
                var fid = $(this).attr('href').match(/\w+/g)[1];
                var name = $(this).text().replace(/\s+/g,'');
                var img = cheerio.load($(this).html())('img').attr('src');
                friendsList[fid] = {
                    name: name,
                    img: img
                }
            });
            if (fullInfo > 0) {
                res.send(friendsList);
            }
            else {
                res.send(Object.keys(friendsList));
            }
        });
});

app.get(/^\/bgm\-api\/getCollectionsList\/\d+/, function (req, res) {
    // var sid = findID(req._parsedUrl.pathname);
    var sid = findID(req.url);
    superagent
        .get('http://bangumi.tv/subject/' + sid + '/collections')
        .end(function (err, data) {
            var txt = data.text;
        });
    res.send('I also want to konw who have done subject ' + sid);
});

app.get(/^\/bgm\-api\/getDoingsList\/\d+/, function (req, res) {
    // var sid = findID(req._parsedUrl.pathname);
    var sid = findID(req.url);
    superagent
        .get('http://bangumi.tv/subject/' + sid + '/doings')
        .end(function (err, data) {
            var txt = data.text;
        });
    res.send('I also want to konw who are doing subject '+ sid)
});

app.get('/*', function (req, res) {
    res.send('who are you?');
})

app.listen(3000, function () {});
