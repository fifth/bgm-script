var express = require('express');
var superagent = require('superagent');

var app = express();

function findID (e) {
        return e.split('/')[2];
}

app.get(/^\/getFriendsList\/\w+/, function (req, res) {
        var uid = findID(req.url);
        superagent
                .get('http://bangumi.tv/user/' + uid + '/friends')
                .end(function (err, data) {
                        var txt = data.text;
                        var friendsList = [];
                        txt.match(/\<a\shref\=\"\/user\/\w+\"/g).forEach(function (item) {
                                var name = item.match(/\w+/g)[3];
                                if (name != uid) {
                                        friendsList.push(name);
                                }
                        });
                        res.send(friendsList);
                });
});

app.get(/^\/getCollectionsList\/\d+/, function (req, res) {
        var sid = findID(req.url);
        superagent
                .get('http://bangumi.tv/subject/' + sid + '/collections')
                .end(function (err, data) {
                        var txt = data.text;
                });
        res.send('I also want to konw who have done subject ' + sid);
});

app.get(/^\/getDoingsList\/\d+/, function (req, res) {
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
