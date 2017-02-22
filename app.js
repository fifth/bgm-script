var express = require('express');
var superagent = require('superagent');
var cheerio = require('cheerio');

var BGM_PRE = 'https://bgm.tv';
// var BGM_PRE = 'http://bangumi.tv';
// var BGM_PRE = 'http://chii.in';

var app = express();

var totalPage = 0;
var donepage = 0;
var tmptmp = [];

function findID (e) {
    return e.split('/')[3];
}

/**
 * /getFriendsList/{uid}?fullInfo=0|1|2
 * fullInfo=1表示取全部的信息，0表示仅取id，fullInfo=0时可忽略不写
 * fullInfo=2表示取包含id-list和full-list的对象，其中属性分别为object.idInfo和object.fullInfo
 */
app.get(/^\/bgm\-api\/getFriendsList\/\w+/, function (req, res) {
    var uid = findID(req._parsedUrl.pathname);
    var fullInfo = req.query.fullInfo || 0;
    var friendsList_id = [];
    var friendsList = {};
    superagent
        .get(BGM_PRE + '/user/' + uid + '/friends')
        .end(function (err, data) {
            var $ = cheerio.load(data.txt);
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

/**
 * /getWatchList/{sid}?action=wishes|collections|doings|on_hold|dropped&fullInfo=0|1|2
 * fullInfo=1表示取全部的信息，0表示仅取id，fullInfo=0时可忽略不写
 * fullInfo=2表示取包含id-list和full-list的对象，其中属性分别为object.idInfo和object.fullInfo
 * action={action}表示所要获取的列表，分别表示五种状态，默认为collections，默认值可忽略
 */
app.get(/^\/bgm\-api\/getWatchList\/\d+/, function (req, res) {
    var sid = findID(req._parsedUrl.pathname);
    // action in ['wishes', 'collections', 'doings', 'on_hold', 'dropped']
    var action = req.query.action || 'collections';
    var fullInfo = req.query.fullInfo || 0;
    var watchList_id = [];
    var watchList = {};
    superagent
        .get(BGM_PRE + '/subject/' + sid + '/' + action)
        .query('filter=friends')
        .end(function (err, data) {

            var $ = cheerio.load(data.text);
            console.log($('ul#memberUserList').html());
            // res.send(BGM_PRE + '/subject/' + sid + '/' + action + '?filter=friends');
            res.send(data.text);
        });
});

app.get('/*', function (req, res) {
    res.send('who are you?');
})

app.listen(3000, function () {});
