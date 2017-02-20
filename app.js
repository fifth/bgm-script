var express = require('express');
var superagent = require('superagent');
var cheerio = require('cheerio');

var BGM_PRE = 'https://bgm.tv';

var app = express();

function findID (e) {
    return e.split('/')[3];
}

function loopReq(e) {
    console.log(e)
    return e;
}

app.get(/^\/bgm\-api\/getFriendsList\/\w+/, function (req, res) {
    var uid = findID(req._parsedUrl.pathname);
    var fullInfo = req.query.fullInfo || 0;
    superagent
        .get(BGM_PRE + '/user/' + uid + '/friends')
        .end(function (err, data) {
            var $ = cheerio.load(data.txt);
            var friendsList_id = [];
            var friendsList = {};
            $('li.user a').each(function () {
                var fid = $(this).attr('href').match(/\w+/g)[1];
                var name = $(this).text().replace(/\s+/g,'');
                var img = cheerio.load($(this).html())('img').attr('src');
                friendsList_id.push(fid);
                //maybe store the original htmltext
                friendsList[fid] = {
                    name: name,
                    img: img
                }
            });
            if (fullInfo > 0) {
                res.send(friendsList);
            }
            else {
                res.send(friendsList_id);
            }
        });
});

app.get(/^\/bgm\-api\/getWatchList\/\d+/, function (req, res) {
    var sid = findID(req._parsedUrl.pathname);
    // action in ['wishes', 'collections', 'doings', 'on_hold', 'dropped']
    var action = req.query.action || 'collections';
    var fullInfo = req.query.fullInfo || 0;
    superagent
        .get(BGM_PRE + '/subject/' + sid + '/' + action)
        .end(function (err, data) {
            var $ = cheerio.load(data.text);
            var watchList_id = [];
            var watchList = {};
            if ($('a.p').length > 0) {
                var pageNum = 1;
                $('a.p').each(function () {
                    var tmp = parseInt($(this).attr('href').split('=')[1], 10);
                    pageNum = tmp > pageNum ? tmp : pageNum;
                });
                console.log(pageNum);
                for (var i = 1; i <= pageNum; i++) {
                    var url = BGM_PRE + '/subject/' + sid + '/' + action + '?page=' + i;
                    // loopReq(url);
                    // ！注意异步操作
                    // superagent操作为异步，导致数据较多时不全
                    superagent
                        .get(url)
                        .end(function (err, data) {
                            var $$ = cheerio.load(data.text);
                            $$('li.user').each(function () {
                                var uid = cheerio.load($(this).html())('a.avatar').attr('href').split('/')[2];
                                watchList_id.push(uid);
                                watchList[uid] = $(this).html();
                                console.log(watchList_id.length);
                            });
                        });
                }
            } else {
                // var url = BGM_PRE + '/subject/' + sid + '/' + action + '?page=1';
                // loopReq(url);
                $('li.user').each(function () {
                    var uid = cheerio.load($(this).html())('a.avatar').attr('href').split('/')[2];
                    watchList_id.push(uid);
                    watchList[uid] = $(this).html();
                    console.log(watchList_id.length);
                });
            }      
            if (fullInfo > 0) {
                res.send(watchList);
            } else {
                res.send(watchList_id);
            }
        });
});

app.get('/*', function (req, res) {
    res.send('who are you?');
})

app.listen(3000, function () {});
