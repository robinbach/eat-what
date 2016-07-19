// Store the menu choices, default length is 3 in release 1.0
var Menus = null
const NQUES = 5;
const NMENUS = 3;
const SEQUENCE = [[0, 1], [1, 2], [2, 0]];
var QuestionLeft = null;
var QuestionLoaded = null;
var NextEmptyIdx = 0;

$(document).ready(function(){
	console.log('eat-what 1.0 lauching...');
	fetchMenuHistory();
	$('#title .link-forward').click(getMenus);
	$('#result .link-back').click(fetchMenuHistory);
	QuestionLoaded = 0;
	loadBasicQuestions();
	loadCustomQuestions();
});

function fetchMenuHistory(){
	var menu = getCookieMenu();
	if(menu.length == 0)
	{
		return;
	}
	$('.previous-menu').html('');
	for(var id = 0; id < menu.length; id++){
		element = menu[id];
		$('<a href="#" class="btn btn-sm btn-default">'
			+ element.toString() + '</a>')
			.appendTo('.previous-menu')
			.on('click', function(){
				// fill the title inputs with button choices
				var $form = $('#title .choice-form');
				$form.find('input').eq(NextEmptyIdx).val( $(this).html() );
				NextEmptyIdx = (NextEmptyIdx + 1) % $form.find('input').size();
			});
	}
}

function getCookieMenu(){
	var menu = new Array();
	if($.cookie('menu') != null){
		var menu = $.cookie('menu').split(',');
		menu = $.unique(menu);
		while(menu.length > 12){
			menu.shift();
		}
	}
	return menu;
}


function loadBasicQuestions(){
	for(var qid = 1; qid <= 3; qid++){
		$('<div></div>')
			.insertAfter( "#title" )
			.addClass("tab-pane")
			.attr('role', "tabpanel")
			.attr('id', "basic-question-" + qid)
			.load( "pages/eat-text.html #basic-question-content", function(){
				QuestionLoaded++;
				$(this)
					.find('.basic-question-content')
						.attr('id', '.basic-question-content-' + QuestionLoaded);
				if(QuestionLoaded == NQUES){
					linkFormPages();
				}
			});
	}
};

function loadCustomQuestions(){
	var extraques = 2;
	for(var qid = 1; qid <= extraques; qid++){
		$('<div></div>')
			.insertBefore( "#result" )
			.addClass("tab-pane")
			.attr('role', "tabpanel")
			.attr('id', "extra-question-" + qid)
			.load( "pages/eat-text.html #extra-question-content-" + qid, function(){
				QuestionLoaded++;
				$(this)
					.find('.extra-question-content')
						.attr('id', '.extra-question-content-' + QuestionLoaded);
				if(QuestionLoaded == NQUES){
					linkFormPages();
				}
			});
	}
};

function setAppetite(){
	var $form = $(this).closest('.question-of-appetite').find('form');
	var multiplier = parseFloat($form.find('input:checked').val());
	for(var mid = 0; mid < Menus.length; mid++){
		Menus[mid].score *= multiplier;
	}

	QuestionLeft--;
	console.log('question left:' + QuestionLeft)
	if(QuestionLeft == 0){
		showResult();
	}
}

function getMenus(){
	Menus = new Array();
	var menu_cookie = getCookieMenu();
	QuestionLeft = NQUES;
	var $form = $('#title .choice-form');
	$form.find('input').each(function(){
		var item = $(this).val();
		if(item.length == 0){
			item = $(this).attr('placeholder');
		}
		Menus.push({'name': item, 'score': 0});
		menu_cookie.push(item);
	});

	for(var mid = 0; mid < Menus.length; mid++){
		Menus[mid].score += (Menus.length - mid - 1) * 0.2;
	}

	$.cookie('menu', menu_cookie);
	updateBasicQuestions();
};

function updateBasicQuestions(){
	var pos = 0;
	$('.basic-question-form').each(function(){
		var $this = $(this);

		pos = (pos + 1) % SEQUENCE.length;
		var op_0 = SEQUENCE[pos][0],
			op_1 = SEQUENCE[pos][1];

		$this
			.find('input:eq(0)')
				.attr('value', op_0)
				.next()
					.html(Menus[op_0].name)
					.end()
				.end()
			.find('input:eq(1)')
				.attr('value', op_1)
				.next()
					.html(Menus[op_1].name)
					.end()
				.end()
			.find('input:eq(2)')
				.attr('value', NMENUS)
	})
};

function linkFormPages(){
	$('.link-forward a').not('.linked').each(function(){
		var $this = $(this);

		var next_tab = $this.closest('.tab-pane').next(),
			next_id = next_tab.attr('id');

		$this
			.attr('href', '#' + next_id)
			.attr('aria-controls', next_id)
			.addClass('linked');

	})
	$('.basic-question-content .link-forward').click(makeChoice);
	$('.question-of-appetite .link-forward').click(setAppetite);
	loadDescription();

};

function makeChoice(){
	var $form = $(this).closest('.basic-question-content').find('form');
	var checked_id = parseInt($form.find('input:checked').val());
	console.log(checked_id);
	if(checked_id < NMENUS)
	{
		Menus[checked_id].score++;
	}
	QuestionLeft--;
	console.log('question left:' + QuestionLeft)
	if(QuestionLeft == 0){
		showResult();
	}
};

function loadDescription(){
	$('.basic-question-content .description-text').each(function(){
		var desId = Math.floor(Math.random() * 10);
		$(this)
			.load("pages/eat-text.html #question-description span:eq(" + desId +")");
	})
}

function showResult(){
	var max_id = 0;
	for(var id = 0; id < Menus.length; id++){
		max_id = Menus[max_id].score > Menus[id].score ? max_id : id
		console.log('scores: ' + Menus[id].score);
	}

	var desPos = evaluateResult(Menus[max_id].score);

	$('#result .description-text')
		.load( "pages/eat-text.html #description p:eq(" + desPos +")");

	$('#result .result-text').html(Menus[max_id].name);
	var miss = Math.random();
	if(miss > Menus[max_id].score)
	{
		$('#result .result-text')
			.load("pages/eat-text.html #air-result .result-text-air");
		$('#result .description-text')
			.load("pages/eat-text.html #air-result .description-text-air");
	}
	loadDescription();
};

function evaluateResult(maxScore){
	var desPos = Math.random() * 3 + maxScore * 1.6 + Math.max(Math.random() * (maxScore - 2.5) * 3, 0);
	console.log('clause: ' + desPos);
	desPos = Math.min(Math.floor(desPos), 14);
	return desPos
}