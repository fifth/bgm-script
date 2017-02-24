// ==UserScript==
// @name         subjectPowerUp
// @namespace    fifth26.com
// @version      1.0.0
// @description  subject page power up ver2.0
// @author       fifth(aslo thanks to everpcpc)
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
let isOnAir = $('div.SimpleSidePanel').eq(1).find('small').first().text().search(/在看/) > 0 ? true : false;

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
    let sid = info[2] || 0;
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
    if (friendsNum[action] > 0) {
        a_l.html(a_l.html().replace(allNum[action], friendsNum[action]));
        a_l.attr('href', '/subject/' + currentPathInfo.sid + '/' + action +'?filter=friends');
    }
    else {
        a_l.html('');
    }
}

function switchToFriendsOnly() {
    if (friendsInfo) {
        $('div.SimpleSidePanel').eq(1).html(friendsInfo);
        addAllBtn();
        return;
    }

    for (let action of ACTIONS) {
        countFriendsNum(currentPathInfo.sid, action, 1);
    }
    let url = location.origin + '/subject/' + currentPathInfo.sid + '/{action}?filter=friends'
        .replace('{action}', isOnAir ? 'doings' : 'collections');
    let tops = [];
    $.get(url, function (data) {
        let info = $('ul#memberUserList', $(data)).find('li:lt(10)');
        info.each(function () {
            tops.push({
                uid: $(this).find('a').attr('href').split('/')[2],
                img: $(this).find('img').attr('src').replace('/m/', '/s/'),
                name: $(this).find('a').text(),
                time: $(this).find('p.info').text(),
                star: $(this).find('span.starstop').attr('class'),
                comment: $(this).find('div.userContainer').html().split('</p>')[1]
            });
        });
        let panel = $('div.SimpleSidePanel').eq(1);
        panel.find('div.rr').detach();
        panel.find('ul').empty();
        tops.forEach(function (item) {
            panel.find('ul').append(buildElement(item));
        });
        if (!friendsInfo) {
            cacheFriendsInfo();
        }
        addAllBtn();
    });
}

function switchToAll() {
    $('div.SimpleSidePanel').eq(1).html(allInfo);
    addFriendsOnlyBtn();
}

function buildElement(info) {
    return '<li class="clearit"><a href="/user/{user_id}" class="avatar"><span class="avatarNeue avatarSize32 ll" style="background-image:url(\'{user_image}\')"></span></a><div class="innerWithAvatar"><a href="/user/{user_id}" class="avatar">{user_name}</a>{user_star}<br><small class="grey">{user_time}</small></div><div style="padding: 0px 5px;">{user_comment}</div></li>'
        .replace('{user_id}', info.uid)
        .replace('{user_name}', info.name)
        .replace('{user_image}', info.img)
        .replace('{user_star}', info.star ? '<span class="s{stars} starsinfo"></span>'.replace('{stars}', info.star.split(' ')[0]) : '')
        .replace('{user_time}', info.time + ' ' + (isOnAir ? '在看' : '看过'))
        .replace('{user_comment}', info.comment);
}

function cacheAllInfo() {
    allInfo = $('div.SimpleSidePanel').eq(1).html();
}

function cacheFriendsInfo() {
    friendsInfo = $('div.SimpleSidePanel').eq(1).html();
}

function addFriendsOnlyBtn() {
    $('div.SimpleSidePanel').eq(1).prepend('<div class="rr"><a href="" class="chiiBtn" style="display: inline;"><span>只看好友</span></a></div>');
    $('div.SimpleSidePanel .chiiBtn').click(function (event) {
        event.preventDefault();
        switchToFriendsOnly();
    });
}

function addAllBtn() {
    $('div.SimpleSidePanel').eq(1).prepend('<div class="rr"><a href="" class="chiiBtn" style="display: inline;"><span>看所有人</span></a></div>');
    $('div.SimpleSidePanel .chiiBtn').click(function (event) {
        event.preventDefault();
        switchToAll();
    });
}

let currentPathInfo = getCurrentPathInfo();
countAllNum();
$('div.SimpleSidePanel').eq(1).append('<br><a class="l" onclick="return false;" href="" style="cursor: default">>>查看更多用户请点击上方相应的链接</a>');
if (!allInfo) {
    cacheAllInfo();
}
addFriendsOnlyBtn();
