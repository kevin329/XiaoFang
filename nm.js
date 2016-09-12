const loginBtn		= document.getElementById('login');
const searchBtn		= document.getElementById('search');
const researchBtn	= document.getElementById('search_again');
const saveBtn		= document.getElementById('save_button');
const User_IdIpt	= document.getElementById('User_Id');
const User_PWIpt	= document.getElementById('User_PW');
const Nurse_IdIpt	= document.getElementById('Nurse_Id');
const YearSlt		= document.getElementById('year');
const MonthSlt		= document.getElementById('month');
const LengthSlt		= document.getElementById('length');
const Station_2Chk	= document.getElementById('Station_2');
const Car_NoIpt		= document.getElementById('Car_No');
const ipc			= require('electron').ipcRenderer;
var User_Id, User_PW, Nurse_Id, input_year, input_month, input_length, STATION_2_MODE = false, CAR_NO;
var cookie, count_item = 1, target_year1, target_year2, target_month1, target_month2, table_length, table_cur, page_length, page_cur, page_next_start;
var a_date = [], a_time1 = [], a_time2 = [], a_car_no = [], a_duration = [];
var cheerio		= require('cheerio');
var Nightmare	= require('nightmare');
var nightmare	= Nightmare({ show: false, typeInterval: 20, switches: {
		'ignore-certificate-errors': true
	} });
loginBtn.addEventListener('click', function (event) {
	User_Id		= User_IdIpt.value;
	User_PW		= User_PWIpt.value;
	WEB_01();
	run_NM_1();
})
searchBtn.addEventListener('click', function (event) {
	Nurse_Id		= Nurse_IdIpt.value;
	input_year		= YearSlt.value;
	input_month		= MonthSlt.value;
	input_length	= LengthSlt.value;
	if (STATION_2_MODE) {
		CAR_NO		= Car_NoIpt.value;
	}
	target_dates();
	WEB_03();
})
researchBtn.addEventListener('click', function (event) {
	WEB_02(true);
	var num = document.getElementById("table_result").rows.length;
	for (var i = 1; i < num; i++) {
		document.getElementById("table_result").deleteRow(-1);
	}
	a_date = [], a_time1 = [], a_time2 = [], a_car_no = [], a_duration = [];
	count_item = 1;
})
Station_2Chk.addEventListener('change', function(event) {
	if (document.getElementById('Station_2').checked == true) {
		document.getElementById('Car_No').disabled = false;
		document.getElementById('Table_S2').style.display = '';
		STATION_2_MODE	= true;
		console.log('s2 mode ON');
	} else {
		document.getElementById('Car_No').disabled = true;
		document.getElementById('Table_S2').style.display = 'none';
		STATION_2_MODE = false;
		console.log('s2 mode OFF');
	}
})
saveBtn.addEventListener('click', function (event) {
	ipc.send('save-dialog')
})
ipc.on('saved-file', function (event, path) {
	if (path) {
		CALC(path);
	}
})
var WEB_01 = function () {
	document.getElementById('div_login').style.display = 'none';
	document.getElementById('div_login_text').style.display = '';
}
var WEB_02 = function (tf) {
	if (tf) {
		var cur_month = new Date();
		cur_month = cur_month.getMonth();
		cur_month++;
		document.getElementById('div_login_text').style.display = 'none';
		document.getElementById('div_search').style.display = '';
		document.getElementById('div_search_result').style.display = 'none';
		document.getElementById('Nurse_Id').focus();
		document.querySelector('select#month option[value=\'' + cur_month + '\']').selected = true;
	} else {
		document.getElementById('msg').innerHTML = 'Login failed, please try again.';
		document.getElementById('div_login_text').style.display = 'none';
		document.getElementById('div_login').style.display = '';
		document.getElementById('div_msg').style.display = '';
	}
}
var WEB_03 = function () {
	document.getElementById('div_search').style.display = 'none';
	document.getElementById('div_search_text').style.display = '';
}
var WEB_04 = function (i, j) {
	document.getElementById('div_search_text').style.display = 'none';
	document.getElementById('div_search_result').style.display = '';

	var num	= document.getElementById('table_result').rows.length;
	var tr	= document.getElementById('table_result').insertRow(num);
	var td;
	td = tr.insertCell(-1);
	td.innerHTML = (i + 1);
	td = tr.insertCell(-1);
	td.innerHTML = a_date[i];
	td = tr.insertCell(-1);
	td.innerHTML = a_time1[i];
	td = tr.insertCell(-1);
	td.innerHTML = a_time2[i];
	td = tr.insertCell(-1);
	td.innerHTML = CALC_E(i);
	td = tr.insertCell(-1);
	td.innerHTML = CALC_F2(i);
	td = tr.insertCell(-1);
	td.innerHTML = CALC_H2(i);
	if (STATION_2_MODE) {
		td = tr.insertCell(-1);
		td.innerHTML = CALC_I(i);
	}
	if (CALC_H2(i) > 0) {
		document.querySelector('tr:nth-child(' + (num+1) + ')').className += 'info';
	}
}
var WEB_05_NO_RESULT = function () {
	document.getElementById('div_search_text').style.display = 'none';
	document.getElementById('div_search_result').style.display = '';
	var tr = document.getElementById('table_result').insertRow(1);
	var td;
	td = tr.insertCell(-1);
	td.innerHTML = 'No case found.';
	document.querySelector('tr:nth-child(2) td').colSpan = '9';
}
var WEB_06_RESET = function () {
	document.getElementById('div_login').style.display = '';
	document.getElementById('div_login_text').style.display = 'none';
	document.getElementById('div_search').style.display = 'none';
	document.getElementById('div_search_text').style.display = 'none';
	document.getElementById('div_search_result').style.display = 'none';
	run_NM_1();
}
var run_NM_1 = function () {
	nightmare
	.goto('https://220.228.12.173/')
	.cookies.get()
	.then(function (cookies) {
		cookie = cookies[1]['value'];
		run_NM_1_2();
	})
	.catch(function (error) {
		console.error('Search failed:', error);
		WEB_06_RESET();
	});
}
var run_NM_1_2 = function () {
	nightmare
	.wait('#User_Id')
	.type('input[name=User_Id]', User_Id)
	.type('input[name=User_PW]', User_PW)
	.type('input[name=txtChkCode]', '')
	.type('input[name=txtChkCode]', cookie)
	.click('input[name=btn_LogOk]')
	.wait(2000)
	.then(function () {
		run_NM_1_3();
	})
	.catch(function (error) {
		console.error('Search failed:', error);
	});
}
var run_NM_1_3 = function () {
	nightmare
	.url()
	.then(function (url) {
		if (url == 'http://ems.mohw.gov.tw/pagemain.jsp') {
			WEB_02(true);
		} else {
			WEB_02(false);
		}
	})
	.catch(function (error) {
		console.error('Search failed:', error);
	});
}
var run_NM_2 = function () {
	nightmare
	.goto('http://ems.mohw.gov.tw/AidCase/AidCaseMT.jsp?start=1')
	.wait('table.EmsFormTable')
	.select('select[name="aid_start_year"]',	target_year1)
	.select('select[name="aid_start_month"]',	target_month1)
	.select('select[name="aid_start_day"]',		'01')
	.select('select[name="aid_end_year"]',		target_year2)
	.select('select[name="aid_end_month"]',		target_month2)
	.select('select[name="aid_end_day"]',		'31')
	.select('select[name="nurse_code"]',		Nurse_Id)
	.click('input[type="submit"]')
	.then(function (result) {
		run_NM_2_1();
	})
	.catch(function (error) {
		console.error('Search failed:', error);
	});
}
var run_NM_2_1 = function () { /******************* CHECK IF NO RESULT **********************/
	nightmare
	.wait('table.EmsDataTable')
	.evaluate(function () {
		return document.querySelector('table.EmsDataTable').getElementsByTagName('tr').length;
	})
	.then(function (result) {
		if (result == 1) {
			WEB_05_NO_RESULT();
		} else {
			run_NM_3();
		}
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
		console.log('page_length:\t' + page_length);
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
			WEB_04(count_item - 1, page_cur);
			
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
			console.log('DONE!');
			// run_NM_7();
		} else {
			run_NM_5();
		}
	})
	.catch(function (error) {
		console.error('Search failed:', error);
	});
}
// var run_NM_7 = function () {
	// CALC();
	// console.log('DONE! PLEEASE CHECK THE FILE');
	// nightmare
	// .end()
	// .then(function () {
	// });
// }
var target_dates = function () {
	target_month1	= input_month;
	target_year1	= input_year;
	target_month2	= parseInt(input_month) + parseInt(input_length) - 1;
	target_year2	= target_year1;
	if (target_month2 > 12) {
		target_month2	-= 12;
		target_year2	+= 1;
	}
	target_month1	= ('0' + target_month1).slice(-2);
	target_month2	= ('0' + target_month2).slice(-2);
	target_year1	= ('0' + target_year1).slice(-3);
	target_year2	= ('0' + target_year2).slice(-3);
	run_NM_2();
}
var CALC = function (path) {
	var output_data = ['No.','Date','Out','In','Times','Duration','Overtime','If N.S.\r\n'].join('\t');
	for (var i = 0; i < a_date.length; i++) {
		output_data = output_data + [(i + 1), a_date[i], a_time1[i], a_time2[i], CALC_E(i), CALC_F2(i), CALC_H2(i), CALC_I(i)].join('\t') + "\r\n";
	}
	var fs = require('fs');
	fs.writeFile(path, output_data, function(error){ 
		if(error){
			console.log('檔案寫入錯誤');
		}
	});
}
var CALC_E = function (i) {
	var e_time1 = new Date('1992/08/30 ' + a_time1[i] + ':00').getTime();
	var e_time2 = new Date('1992/08/30 ' + a_time2[i] + ':00').getTime();
	var e_time3 = new Date();
	if (e_time2 > e_time1) {
		e_time3.setTime(e_time2 - e_time1);
		return e_time3.getUTCHours() + ':' + e_time3.getUTCMinutes();
	} else {
		e_time3.setTime(e_time2 + 86400000 - e_time1);
		return e_time3.getUTCHours() + ':' + e_time3.getUTCMinutes();
	}
}
var CALC_F2 = function (i) {
	var e_time1		= new Date('1992/08/30 ' + a_time1[i] + ':00').getTime();
	var e_time2		= new Date('1992/08/30 ' + a_time2[i] + ':00').getTime();
	var e_time3		= new Date();
	var e_time08	= new Date('1992/08/30 08:00:00').getTime();
	var e_time18	= new Date('1992/08/30 18:00:00').getTime();
	if (STATION_2_MODE == true && a_car_no[i] == CAR_NO) {
		if (e_time1 < e_time08 || e_time2 < e_time08) {
			if (e_time1 > e_time08 && e_time2 <= e_time08) {
				e_time3.setTime(e_time2);
				a_duration[i] = e_time3.getHours() + ':' + e_time3.getMinutes();
				return e_time3.getHours() + ':' + e_time3.getMinutes();
			} else if (e_time1 < e_time08 && e_time2 <= e_time08) {
				e_time3.setTime(e_time2 - e_time1);
				a_duration[i] = e_time3.getUTCHours() + ':' + e_time3.getUTCMinutes();
				return e_time3.getUTCHours() + ':' + e_time3.getUTCMinutes();
			} else if (e_time1 < e_time08 && e_time2 > e_time08) {
				e_time3.setTime(e_time08 - e_time1);
				a_duration[i] = e_time3.getUTCHours() + ':' + e_time3.getUTCMinutes();
				return e_time3.getUTCHours() + ':' + e_time3.getUTCMinutes();
			}
		}else {
			a_duration[i] = '';
			return a_duration[i];
		}
	} else {
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
			a_duration[i] = e_time3.getUTCHours() + ':' + e_time3.getUTCMinutes();
			return a_duration[i];
		} else {
			a_duration[i] = '';
			return a_duration[i];
		} 
	}
}
var CALC_H2 = function (i) {
	if (a_duration[i] != '') {
		return a_duration[i].split(':')[0];
	} else {
		return '';
	}
}
var CALC_I = function (i) {
	if (a_car_no[i] == CAR_NO) {
		return 'V';
	} else {
		return '';
	}
}
