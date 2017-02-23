// ==UserScript==
// @name         newPowerUp
// @namespace    fifth26.com
// @version      1.0.0
// @description  friends powerup ver2.0
// @author       fifth
// @include      /^https?://(bgm\.tv|chii\.in|bangumi\.tv)/subject/\d+$/
// @encoding     utf-8
// ==/UserScript==

const ACTIONS = [
    'wishes',
    'collections',
    'doings',
    'on_hold',
    'dropped'
];

let allNum = {
    wishes: 0,
    collections: 0,
    doings: 0,
    on_hold: 0,
    dropped: 0
};

let friendsNum = {
    wishes: 0,
    collections: 0,
    doings: 0,
    on_hold: 0,
    dropped: 0
};

let allInfo = '';
let friendsInfo = '';
let flag = false;

function getQueryInfo() {
    let queryInfo = {
        filter: '',
        page: 1
    };
    if (location.search) {
        location.search.slice(1).split('&').forEach(function (elem) {
            queryInfo[elem.split('=')[0]] = elem.split('=')[1];
        });
    }
    return queryInfo;
}

function getCurrentPathInfo() {
    let info = location.pathname.split('/');
    let sid = info[2] || -1;
    // let action = info[3] || 'collections';
    // let queryInfo = getQueryInfo();
    return {
        sid: sid,
        // action: action,
        // filter: queryInfo.filter,
        // page: queryInfo.page
    };
}

function countAllNum() {
    $('div.SimpleSidePanel').eq(1).find('a.l').each(function (index) {
        allNum[ACTIONS[index]] = $(this).html().match(/\d+/)[0];
    });
}

function countFriendsNum(sid, action, page) {
    let urlWithFilter = location.origin + '/subject/' + currentPathInfo.sid + '/' + action + '?filter=friends&page=' + page;
    $.get(urlWithFilter, function (data) {
        let itemNum = $('ul#memberUserList', $(data)).find('li').length;
        if (itemNum >= 20) {
            friendsNum[action] += 20;
            countFriendsNum(sid, action, page + 1);
        }
        else {
            friendsNum[action] += itemNum;
            updatePageInfo(action);
        }
    });
}

function updatePageInfo(action) {
    let a_l = $('div.SimpleSidePanel').eq(1).find('[href="/subject/' + currentPathInfo.sid + '/' + action + '"]');
    a_l.html(a_l.html().replace(allNum[action], friendsNum[action]));
    a_l.attr('href', '/subject/' + currentPathInfo.sid + '/' + action +'?filter=friends');
}

let currentPathInfo = getCurrentPathInfo();
countAllNum();
function switchToFriendsOnly() {
    for (let action of ACTIONS) {
        countFriendsNum(currentPathInfo.sid, action, 1);
    }
    let url = location.origin + '/subject/' + currentPathInfo.sid + '/collections?filter=friends';
    let top5 = [];
    $.get(url, function (data) {
        let friendsInfo = $('ul#memberUserList', $(data)).find('li:lt(5)');
        friendsInfo.each(function () {
            top5.push({
                uid: $(this).find('a').attr('href').split('/')[2],
                img: $(this).find('img').attr('src').replace('/m/', '/s/'),
                name: $(this).find('a').text().split(' ')[1],
                time: $(this).find('p.info').text(),
                star: $(this).find('span.starstop').attr('class').split(' ')[0]
            });
        });
        $('div.SimpleSidePanel').eq(1).find('li.clearit').each(function (index) {
            let info = top5[index];
            $(this).find('a.avatar').attr('href', '/user/' + info.uid);
            $(this).find('span.avatarNeue').attr('style', 'background-image:url(\'' + info.img + '\')');
            $(this).find('div.innerWithAvatar a.avatar').text(info.name);
            if ($(this).find('div.innerWithAvatar span').length > 0) {
                $(this).find('div.innerWithAvatar span').attr('class', 's' + info.star + ' starsinfo');
            }
            else {
                $('<span class="s' + info.star + ' starsinfo"></span>').insertAfter($(this).find('div.innerWithAvatar a.avatar'));
            }
            $(this).find('small').text(info.time);
        });
        cacheFriendsInfo();
    });
}
function cacheAllInfo() {
    allInfo = $('div.SimpleSidePanel').eq(1).html();
}
function cacheFriendsInfo() {
    friendsInfo = $('div.SimpleSidePanel').eq(1).html();
}
cacheAllInfo();
function addSwitchBtn() {
    $('div.SimpleSidePanel').eq(1).prepend('<div class="rr"><a href="" class="chiiBtn" style="display: inline;"><span>只看好友</span></a></div>');
    $('div.SimpleSidePanel .chiiBtn').click(function (event) {
        event.preventDefault();
        switchToFriendsOnly();
        // flag = !flag;

    });
}
addSwitchBtn();
