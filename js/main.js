var myApp = new Framework7(
{
	onPageInit : function(page){},
	onPageAfterAnimation : function(page){},
	onPageBeforeAnimation : function(page){}
});

var mainView = myApp.addView('.view-main', {
    dynamicNavbar : true
});

var $$ = myApp.$;
$$('.panel-left').on('open', function ()
{
    $$('.statusbar-overlay').addClass('with-panel-left');
});
$$('.panel-left, .panel-right').on('close', function ()
{
    $$('.statusbar-overlay').removeClass('with-panel-left with-panel-right');
});

var uri = "http://172.18.86.101/~user/Change_json.php?class=";

if (typeof localStorage == 'undefined') {
	myApp.alert('お使いのブラウザはlocalStorageに対応していないため、「授業変更」は動作しません。');
}

var storage = localStorage;
$(function() {
	if (storage.myClass != null && storage.myClass != '0') {
		$('#class-selector').val(storage.myClass);
		refresh();
	} else {
		myApp.openPanel('left');
		myApp.alert('クラスを選択してください');
	}
});

$(document).on('change', '#class-selector', function(){
	if ($(this).val() != '0') {
		var selectedClass = $(this).val();
		storage.myClass = $(this).val();
		$('#class-selector').val(selectedClass);
		refresh();
	}
});

// 更新時の描画およびデータ取得
function refresh(){
	// $('div.page .content-block-title').remove();
	// $('div.page .content-block').remove();
	// $('div.page .list-block').remove();
	myApp.showPreloader('取得中...');
	fetchJson(storage.myClass);
}

// JSONの取得及びエラー処理
function fetchJson(cls) {

	// タイムアウト時のエラー表示
	var timer = setTimeout(function(){
		myApp.hidePreloader();
		if (storage.myData == null) {
			myApp.alert('授業変更データが保存されていません。学内で一度データを取得してください。');
			$('#main-content *').remove();
			$('i.fa-cloud-download').remove();
			$('p.notice').remove();
			$('.view-main .page-content').append('<i class="fa fa-cloud-download"></i><br><p class="notice">授業変更を表示するには学内でデータを取得してください。</p>');
		} else {
			myApp.alert('学内ネットワークに接続できないため，情報の更新に失敗しました。');
			$('#class-selector').val(storage.lastClass);
			show(false);
		}
	}, 2000);

	$.getJSON(uri+cls, function(json) {
		clearTimeout(timer);
		storage.lastClass = storage.myClass;
		storage.myData = '';
		var temp = JSON.stringify(json);
		storage.myData = temp;
		myApp.hidePreloader();
		show(true);
	});
}

// 取得したデータの表示
function show(isConnected) {
	$('ul#info-list .page-content > *').remove();
	if (storage.myData == '["nodata"]') {
		$('#class-change').remove();
		$('i.fa-bullhorn').remove();
		$('p.notice').remove();
		$('div#main-content').prepend('<i class="fa fa-bullhorn"></i><br><p class="notice">授業変更はありません</p>');
	} else {
		var data = JSON.parse(storage.myData);
		$('ul#info-list *').remove();
		for (var i=0; i<data.length; i++) {
			$('ul#info-list').append('<li><div class="item-inner"><div class="item-title-row"><div class="item-title"></div><div class="item-after"></div></div><div class="item-subtitle"></div></div></li>');

			// 月の取得
			var monthStr;
			if (data[i].month.substr(0,1) == '0') {
				monthStr = data[i].month.substr(1,1);
			} else {
				monthStr = data[i].month;
			}

			// 曜日の取得
			myDate = new Date(data[i].date.substr(0,4), data[i].month-1, data[i].day);
			myWeek = new Array('日','月','火','水','木','金','土');
			var dayStr = myWeek[myDate.getDay()];
			
			// 変更前の取得
			var from;
			if (data[i].from == '&nbsp;') {
				from = '授業なし';
			} else {
				from = data[i].from.split('（')[0];
			}

			// 変更後の取得
			var to;
			if (data[i].to == '&nbsp;') {
				to = '休講';
			} else {
				to = data[i].to.split('（')[0];
			}

			moment.lang('ja');
			var daysLeft = moment(data[i].year+data[i].month+data[i].day, "YYYYMMDD").fromNow();

			$('#info-list .item-title').eq(i).append('<span class="class-name">'+data[i].class+'</span>'+monthStr+'/'+data[i].day+' ('+dayStr+') '+'<span class="class-time">'+data[i].time.substr(0,1)+'·'+data[i].time.substr(1,1)+'限</span>');
			$('#info-list .item-after').eq(i).append(daysLeft);
			$('#info-list .item-subtitle').eq(i).append(from+' <i class="fa fa-hand-o-right"></i> '+to);

			if (data[i].etc != "&nbsp;") {
				$('#info-list .item-subtitle').eq(i).append('<div class="item-etc">' + data[i].etc + '</div>');
			}
		}
	}
	$('div.page .content-block-title').show();
	$('div.page .content-block').show();
	$('div.page .list-block').show();

	if (isConnected) {
		showDate(true);
	} else {
		showDate(false);
	}		
}

// 最終更新時刻の更新または表示
function showDate(isConnected){
	if (isConnected) {
		var now = new Date();
		var dd, hh, mm;
		if(now.getDate()<10){
			dd = '0'+String(now.getDate());
		}else{
			dd = String(now.getDate());
		}
		if(now.getHours()<10){
			hh = '0'+String(now.getHours());
		}else{
			hh = String(now.getHours());
		}
		if(now.getMinutes()<10){
			mm = '0'+String(now.getMinutes());
		}else{
			mm = String(now.getMinutes());
		}
		storage.updatedAt = String(now.getMonth()+1)+'月'+dd+'日 '+hh+':'+mm;
		$('div#footer').html('<i class="fa fa-refresh"></i> '+storage.updatedAt);
	} else {
		$('div#footer').html('<i class="fa fa-refresh"></i> '+storage.updatedAt);
	}
		$('div#footer').fadeIn(5000);
}