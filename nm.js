const sendBtn = document.getElementById('send');
const User_IdBtn = document.getElementById('User_Id');
const User_PWBtn = document.getElementById('User_PW');
const Nurse_IdBtn = document.getElementById('Nurse_Id');
var User_Id, User_PW, Nurse_Id;
sendBtn.addEventListener('click', function (event) {
	User_Id = User_IdBtn.value;
	User_PW = User_PWBtn.value;
	Nurse_Id = Nurse_IdBtn.value;
	run_HTML_01();
	run_NM_1();
})
var run_HTML_01 = function () {
	document.getElementById('body').innerHTML = '<h1>TEST</h1>';

}
var run_HTML_02 = function (name) {
	document.getElementById('body').innerHTML = 'Name:' + name;

}
var cookie, count_item = 1, target_year1, target_year2, target_month1, target_month2, table_length, table_cur, page_length, page_cur, page_next_start;
var a_date = [], a_time1 = [], a_time2 = [], a_car_no= [], a_datong = [], a_nanshan = [];
var cheerio = require("cheerio");
var Nightmare = require('nightmare');
var nightmare = Nightmare({ show: true,switches: {
		'ignore-certificate-errors': true
	} });
var run_NM_1 = function () {
	nightmare
	.goto('https://220.228.12.173/')
	.cookies.get()
	.then(function (cookies) {
		cookie = cookies[1]['value'];
		run_NM_1_2();
	});
}
// run_NM_1();
var run_NM_1_2 = function () {
	nightmare
	.wait('#User_Id')
	.type('form[name=form1] [name=User_Id]', User_Id)
	.type('form[name=form1] [name=User_PW]', User_PW)
	.type('form[name=form1] [name=txtChkCode]', '')
	.type('form[name=form1] [name=txtChkCode]', cookie)
	.click('form[name=form1] input[name=btn_LogOk]')
	.wait(2000);
	// .end();
	nightmare.run(function () {
		target_dates();
		run_NM_2();
	});
}
var run_NM_2 = function () {
	nightmare
	.goto('http://ems.mohw.gov.tw/AidCase/AidCaseMT.jsp?start=1')
	.wait('table.EmsFormTable')
	.evaluate(function (id) {
		// return document.querySelector('option[value=' + id + ']').innerHTML;
	},{Nurse_Id})
	.select("select[name='aid_start_year']", target_year1)
	.select("select[name='aid_start_month']", target_month1)
	.select("select[name='aid_start_day']", "01")
	.select("select[name='aid_end_year']", target_year2)
	.select("select[name='aid_end_month']", target_month2)
	.select("select[name='aid_end_day']", "31")
	.select('select[name="nurse_code"]', Nurse_Id)
	.click('input[type="submit"]')
	.then(function (result) {
		run_HTML_02(result);
		run_NM_3();
	})
	.catch(function (error) {
		console.error('Search failed:', error);
	});
}
var run_NM_3 = function () { /******************* GET PAGE LENGTH ***************************/
	nightmare
	.wait('table.EmsDataTable')
	.evaluate(function () {
		return document.querySelector('select[name=select1]').getElementsByTagName('option').length;
	})
	.then(function (result) {
		page_length	= result;
		page_cur	= 1;
		console.log("page_length:\t" + page_length);
		run_NM_4();
	})
	.catch(function (error) {
		console.error('Search failed:', error);
	});
}
var run_NM_4 = function () { /******************* GET TABLE LENGTH ***************************/
	nightmare
	.wait('table.EmsDataTable')
	.evaluate(function () {
		return document.querySelector('table.EmsDataTable').getElementsByTagName('tr').length;
	})
	.then(function (result) {
		table_length	= result;
		table_cur		= 2;
		console.log('table_length:\t' + table_length);
		run_NM_5();
	})
	.catch(function (error) {
		console.error('Search failed:', error);
	});
}
var run_NM_5 = function () {
	if (table_cur < table_length + 1) {
		console.log('table_cur\t' + table_cur);
		nightmare
		.click('form[name=form1] table tr:nth-child(' + table_cur + ') input[name=code_id]')
		.click('form[name=form1] input[type=button][value="明細"]')
		.wait('table.EmsDataTable1')
		.evaluate(function () {
			return document.querySelector('html').innerHTML;
		})
		.then(function (result) {
			var $		= cheerio.load(result);
			var date	= $('table.EmsDataTable1:nth-child(1) tr:nth-child(2) td:nth-child(2) font').text();
			var time1	= $('table.EmsDataTable1:nth-child(1) tr:nth-child(4) td:nth-child(2) font').text();
			var time2	= $('table.EmsDataTable1:nth-child(1) tr:nth-child(5) td:nth-child(6) font').text();
			var car_no	= $('form[name=form1] > table.EmsDataTable1 tr:nth-child(1) td:nth-child(2) font').text();
			time1		= time1.split(':')[0].substr(time1.split(':')[0].length - 2) + ':' + time1.split(':')[1].substr(0 ,2);
			time2		= time2.split(':')[0].substr(time2.split(':')[0].length - 2) + ':' + time2.split(':')[1].substr(0 ,2);
			car_no		= car_no.substr(0 ,3);
			a_date[count_item - 1]		= date;
			a_time1[count_item - 1]		= time1;
			a_time2[count_item - 1]		= time2;
			a_car_no[count_item - 1]	= car_no;
			console.log('date:\t' + date + '\ntime1:\t' + time1 + '\ntime2:\t' + time2 + '\ncar_no:\t' + car_no);

			count_item++;
			table_cur++;
			if (table_cur == 12) {
				page_cur++;
			}
			page_next_start = ((page_cur - 1) * 10) + 1;
			run_NM_6();
		})
		.catch(function (error) {
			console.error('Search failed:', error);
		});
	}
}
var run_NM_6 = function () { /******************* GO BACK ***************************/
	nightmare
	.goto('http://ems.mohw.gov.tw/AidCase/AidCaseMTSelect.jsp?start=' + page_next_start)
	.then(function () {
		if (table_cur == 12 && !(page_cur > page_length)) { //change page
			run_NM_4();
		} else if(table_cur == (table_length + 1) && page_cur == page_length) {
			run_NM_7();
		} else {
			run_NM_5();
		}
	})
	.catch(function (error) {
		console.error('Search failed:', error);
	});
}
var run_NM_7 = function () {
	calc();
	console.log("DONE! PLEEASE CHECK THE FILE");
	nightmare
	.end()
	.then(function () {

	});
}
var target_dates = function () {
	var cur_date	= new Date();
	var cur_month	= cur_date.getMonth();
	var cur_year	= cur_date.getFullYear() - 1911;
	// if (args[1] && args[2]) {
	// 	target_month1	= args[2]	- 1;
	// 	target_year1	= args[1]	- 70;
	// 	if (args[3] && args[3] <= 3) {
	// 		target_month2	= target_month1 + args[3] - 1;
	// 	} else {
	// 		target_month2	= target_month1 + 3;
	// 	}
	// 	target_year2	= target_year1;
	// 	if (target_month2 > 11) {
	// 		target_month2	-= 12;
	// 		target_year2	+= 1;
	// 	}
	// 	return true;
	// } else { //Auto: last 4 month
		target_month1	= cur_month	+ 1 - 1;
		target_year1	= cur_year;
		target_month2	= cur_month + 1;
		target_year2	= cur_year;
		if (target_month1 < 1) {
			target_month1	+= 12;
			target_year1	-= 1;
		}
		target_month1	= ('0' + target_month1).slice(-2);
		target_month2	= ('0' + target_month2).slice(-2);
		target_year1	= ('0' + target_year1).slice(-3);
		target_year2	= ('0' + target_year2).slice(-3);
		// return false;
	// }
}
var calc = function () {
	var output_data_new = ['No.','Date','Out','In','Times','Datong','Nanshan','Overtime','If Nanshan\r\n'].join('\t');
	for (var i = 0; i < a_date.length; i++) {
		output_data_new = output_data_new + [(i + 1), a_date[i], a_time1[i], a_time2[i], calc_E(i), calc_F(i), calc_G(i), calc_H(i), calc_I(i)].join('\t') + "\r\n";
	}
	var fs = require('fs');
	fs.writeFile('output_data_NODE.tsv', output_data_new, function(error){ 
		if(error){
			console.log('檔案寫入錯誤');
		}
	});
	return true;
}
var calc_E = function (i) {
	var e_time1 = new Date('1992/01/01 ' + a_time1[i] + ':00').getTime();
	var e_time2 = new Date('1992/01/01 ' + a_time2[i] + ':00').getTime();
	var e_time3 = new Date();
	if (e_time2 > e_time1) {
		e_time3.setTime(e_time2 - e_time1);
		return e_time3.getUTCHours() + ':' + e_time3.getUTCMinutes();
	} else {
		e_time3.setTime(e_time2 + 86400000 - e_time1);
		return e_time3.getUTCHours() + ':' + e_time3.getUTCMinutes();
	}
}
var calc_F = function (i) {
	var e_time1		= new Date('1992/01/01 ' + a_time1[i] + ':00').getTime();
	var e_time2		= new Date('1992/01/01 ' + a_time2[i] + ':00').getTime();
	var e_time3		= new Date();
	var e_time08	= new Date('1992/01/01 08:00:00').getTime();
	var e_time18	= new Date('1992/01/01 18:00:00').getTime();
	if (a_car_no[i] != '215') {
		if (e_time1 < e_time08 || e_time1 > e_time18 || e_time2 < e_time08 || e_time2 > e_time18) {
			if (e_time1 < e_time18 && e_time2 > e_time18) {
				e_time3.setTime(e_time2 - e_time18);
			} else if (e_time1 >= e_time18 && e_time2 > e_time18) {
				e_time3.setTime(e_time2 - e_time1);
			} else if (e_time1 > e_time18 && e_time2 < e_time08) {
				e_time3.setTime(e_time2 - e_time1 + 86400000);
			} else if (e_time1 < e_time08 && e_time2 < e_time08) {
				e_time3.setTime(e_time2 - e_time1);
			} else if (e_time1 < e_time08 && e_time2 >= e_time08) {
				e_time3.setTime(e_time08 - e_time1);
			}
			a_datong[i] = e_time3.getUTCHours() + ':' + e_time3.getUTCMinutes();
			return a_datong[i];
		} else {
			a_datong[i] = '';
			return a_datong[i];
		} 
	} else {
		a_datong[i] = '';
		return a_datong[i];
	} 
}
var calc_G = function (i) {
	var e_time1		= new Date('1992/01/01 ' + a_time1[i] + ':00').getTime();
	var e_time2		= new Date('1992/01/01 ' + a_time2[i] + ':00').getTime();
	var e_time3		= new Date();
	var e_time08	= new Date('1992/01/01 08:00:00').getTime();
	if (a_car_no[i] == '215') {
		if (e_time1 < e_time08 || e_time2 < e_time08) {
			if (e_time1 > e_time08 && e_time2 <= e_time08) {
				e_time3.setTime(e_time2);
				a_nanshan[i] = e_time3.getHours() + ':' + e_time3.getMinutes();
				return e_time3.getHours() + ':' + e_time3.getMinutes();
			} else if (e_time1 < e_time08 && e_time2 <= e_time08) {
				e_time3.setTime(e_time2 - e_time1);
				a_nanshan[i] = e_time3.getUTCHours() + ':' + e_time3.getUTCMinutes();
				return e_time3.getUTCHours() + ':' + e_time3.getUTCMinutes();
			} else if (e_time1 < e_time08 && e_time2 > e_time08) {
				e_time3.setTime(e_time08 - e_time1);
				a_nanshan[i] = e_time3.getUTCHours() + ':' + e_time3.getUTCMinutes();
				return e_time3.getUTCHours() + ':' + e_time3.getUTCMinutes();
			}
		}else {
			a_nanshan[i] = '';
			return a_nanshan[i];
		}
	} else {
		a_nanshan[i] = '';
		return a_nanshan[i];
	}
}
var calc_H = function (i) {
	if (a_car_no[i] != '215' && a_datong[i] != '') {
		return a_datong[i].split(':')[0];
	} else if (a_car_no[i] == '215' && a_nanshan[i] != '') {
		return a_nanshan[i].split(':')[0];
	} else {
		return '';
	}
}
var calc_I = function (i) {
	if (a_car_no[i] == '215') {
		return 'V';
	} else {
		return '';
	}
}