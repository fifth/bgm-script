/**
 * api usage (unavailable)
 *
 * /getFriendsList/{uid}
 * /getFriendsList/{uid}?fullInfo=0|1
 * fullInfo=1表示取全部的信息，0表示仅取id，fullInfo=0时可忽略不写
 *
 * /getWatchList/{sid}?action=wishes|collections|doings|on_hold|dropped&fullInfo=0|1
 * fullInfo=1表示取全部的信息，0表示仅取id，fullInfo=0时可忽略不写
 * action={action}表示所要获取的列表，分别表示五种状态，默认为collections，默认值可忽略
 */

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

function loopReq (url) {
    return new Promise(function (resolve, reject) {
      superagent
          .get(url)
          .end(function (err, data) {
              if (err || data.error) {
                  errorCode = err ? err.status : data.error.status;
                  if (errorCode == 503) {
                      retryReq(url, resolve, reject);
                  } else {
                      reject(errorCode);
                  }
              } else {
                  resolve(findWatchList(url, data.text));
              }
          });
    });
}

function retryReq (url, onSuccess, onFail) {
    if (totalPage > donepage) {
        superagent
            .get(url)
            .end(function (err, data) {
                if (err || data.error) {
                    errorCode = err ? err.status : data.error.status;
                    if (errorCode == 503) {
                        retryReq(url, onSuccess, onFail);
                    } else {
                        onFail(errorCode);
                    }
                } else {
                    onSuccess(findWatchList(url, data.text));
                }
            });
    }
}

function findWatchList (url, txt) {
    var $ = cheerio.load(txt);
    var tmpList_id = [];
    var tmpList = {};
    $('li.user').each(function () {
        var uid = cheerio.load($(this).html())('a.avatar').attr('href').split('/')[2];
        tmpList_id.push(uid);
        tmpList[uid] = $(this).html();
        // console.log(watchList_id.length);
    });
    return {
        pageId: parseInt(url.split('=')[1], 10),
        idInfo: tmpList_id,
        fullInfo: tmpList
    };
}

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

app.get(/^\/bgm\-api\/getWatchList\/\d+/, function (req, res) {
    var sid = findID(req._parsedUrl.pathname);
    // action in ['wishes', 'collections', 'doings', 'on_hold', 'dropped']
    var action = req.query.action || 'collections';
    var fullInfo = req.query.fullInfo || 0;
    var watchList_id = [];
    var watchList = {};
    superagent
        .get(BGM_PRE + '/subject/' + sid + '/' + action)
        .end(function (err, data) {
            var $ = cheerio.load(data.text);
            if ($('a.p').length > 0) {
                totalPage = 1;
                $('a.p').each(function () {
                    var tmp = parseInt($(this).attr('href').split('=')[1], 10);
                    totalPage = tmp > totalPage ? tmp : totalPage;
                });
                // console.log('total=' + totalPage);
                var totalData = [];

                for (var i = 1; i <= totalPage; i++) {
                    var url = BGM_PRE + '/subject/' + sid + '/' + action + '?page=' + i;
                    loopReq(url).then(function (data) {
                        donepage++;
                        // console.log(data.pageId, donepage);
                        totalData[data.pageId - 1] = data;
                        if (totalPage <= donepage) {
                            apiReturn(totalData, fullInfo, res);
                        }
                    }, function (error) {
                        res.send('oops! error occured!--' + error);
                    });
                }
            } else {
                var url = BGM_PRE + '/subject/' + sid + '/' + action + '?page=1';
                loopReq(url).then(function (data) {
                    apiReturn([data], fullInfo, res);
                }, function (error) {
                    res.send('oops! error occured!--' + error);
                });
            }
        });
});
function apiReturn (data, fullInfo, res) {
    // res.send(data);
    // for (var i = 0; i < data.length; i++) {
    //     data[i].idInfo
    //     data[i].fullInfo
    // }
    console.log(data.length);
    res.send('I\'m fine, thank you.')
    // es6
    // Object.assign({}, [data.values()])

    // if (fullInfo > 0) {
    //     res.send(data.fullInfo);
    // } else {
    //     res.send(data.idInfo);
    // }
}

app.get('/*', function (req, res) {
    res.send('who are you?');
})

app.listen(3000, function () {});
