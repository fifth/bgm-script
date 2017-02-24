// ==UserScript==
// @name         friendsPowerup
// @namespace    com.kitakamikaini
// @version      1.0
// @description  friends powerup
// @author       fifth
// @include      /^https?://(bgm\.tv|chii\.in|bangumi\.tv)/subject/\d+/(wishes|collections|doings|on_hold|dropped)/
// @encoding     utf-8
// ==/UserScript==

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
    let action = info[3] || 'collections';
    let queryInfo = getQueryInfo();
    return {
        sid: sid,
        action: action,
        filter: queryInfo.filter,
        page: queryInfo.page
    };
}

function countAllNum() {
    let secTab = $('ul.secTab.clearit');
    secTab.find('li').each(function () {
        allNum[$(this).find('a').attr('href').split('/')[3]] = $(this).find('small').html().match(/\d+/)[0];
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
    let secTab = $('div#SecTab [href="/subject/' + currentPathInfo.sid + '/' + action + '"]');
    if (friendsNum[action] === 0) {
        secTab.unwrap();
        secTab.remove();
        return;
    }
    secTab.find('small').text('(' + friendsNum[action] + ')');
    let oldHref = secTab.attr('href');
    secTab.attr('href', oldHref + '?filter=friends');
    if (action == currentPathInfo.action) {
        if (friendsNum[action] <= 20) {
            $('div#multipage').html('');
        }
        else {
            let totalPages = Math.floor((friendsNum[action] - 1) / 20 + 1);
            setNewPages(totalPages, currentPathInfo.page);
        }
    }
}

function setNewPages(pageNum, currentPage) {
    if (pageNum <= 1) {
        return;
    }
    let pageInner = [];
    if (pageNum <= 10) {
        for (let i = 1; i <= pageNum; i++) {
            if (i == currentPage) {
                pageInner.push('<strong class="p_cur">' + i + '</strong>');
            }
            else {
                pageInner.push('<a href="' + buildHref(currentPathInfo.sid, currentPathInfo.action, i, currentPathInfo.filter) + '" class="p">' + i + '</a>');
            }
        }
    }
    else {
        for (let i = 1; i <= 10; i++) {
            if (i == currentPage) {
                pageInner.push('<strong class="p_cur">' + i + '</strong>');
            } else {
                pageInner.push('<a href="' + buildHref(currentPathInfo.sid, currentPathInfo.action, i, currentPathInfo.filter) + '" class="p">' + i + '</a>');
            }
        }
        pageInner.push('<a href="' + buildHref(currentPathInfo.sid, currentPathInfo.action, currentPage + 1, currentPathInfo.filter) + '" class="p">››</a>');
    }
    if (currentPage > 1) {
        pageInner.unshift('<a href="' + buildHref(currentPathInfo.sid, currentPathInfo.action, currentPage - 1, currentPathInfo.filter) + '" class="p">‹‹</a>');
    }
    if (currentPage < pageNum) {
        pageInner.push('<a href="' + buildHref(currentPathInfo.sid, currentPathInfo.action, currentPage + 1, currentPathInfo.filter) + '" class="p">››</a>');
    }
    if (pageNum > 10) {
        pageInner.push('<a href="' + buildHref(currentPathInfo.sid, currentPathInfo.action, pageNum, currentPathInfo.filter) + '" class="p">›|</a>');
        pageInner.push('<a class="p_pages" style="padding: 0px">' + $('a.p_pages').html() + '</a>');
        pageInner.push('<span class="p_edge">(&nbsp;' + currentPage + '&nbsp;/&nbsp;' + pageNum + '&nbsp;)</span>');
    }
    $('div#multipage').html(pageInner.join(''));
}

function buildHref(sid, action, page = 1, filter = '') {
    return '/subject/{sid}/{action}?filter={filter}&amp;page={page}'
        .replace('{sid}', sid)
        .replace('{action}', action)
        .replace('{page}', page)
        .replace('{filter}', filter);
}

function setSwitchButton() {
    $('#header').append('<ul class="secTab" style="display: inline-flex;padding-left: 10px;height: 20px;"></ul>');
    $('#header ul').append('<li><a href="" id="switchBotton0" style="padding: 0px 6px;"><span>查看全部</span></a></li>');
    $('#header ul').append('<li><a href="" id="switchBotton1" style="padding: 0px 6px;"><span>仅看好友</span></a></li>');
    $('#header a').eq(currentPathInfo.filter == 'friends' ? 1 : 0).addClass('selected');
}

let switchCache = ['', ''];


function cache() {
    let status = currentPathInfo.filter == 'friends' ? 1 : 0;
    switchCache[status] = $('div#columnInSubjectA').html();
    $.get(buildHref(currentPathInfo.sid, currentPathInfo.action, currentPathInfo.page, currentPathInfo.filter == 'friends' ? '' : 'friends'), function(data) {
        switchCache[1 -status] = $('div#columnInSubjectA', $(data)).html();
    });
    $('#header a').click(function (event) {
        event.preventDefault();
        let clickedBtn = parseInt($(this).attr('id').slice(-1), 10);
        if (clickedBtn == status) {
            return;
        }
        $('#switchBotton' + clickedBtn).addClass('selected');
        $('#switchBotton' + (1 - clickedBtn)).removeClass('selected');
    });
}

let currentPathInfo = getCurrentPathInfo();
countAllNum();
setSwitchButton();

if (currentPathInfo.filter) {
    let newTitle = $('div#header h1').text().replace('成员', '好友');
    $('div#header h1').text(newTitle);
    for (let action in friendsNum) {
        countFriendsNum(currentPathInfo.sid, action, 1);
    }
}

// cache();
