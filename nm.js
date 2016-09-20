const loginBtn      = document.getElementById('login');
const searchBtn     = document.getElementById('search');
const researchBtn   = document.getElementById('search_again');
const saveBtn       = document.getElementById('save_button');
const User_IdIpt    = document.getElementById('User_Id');
const User_PWIpt    = document.getElementById('User_PW');
const Nurse_IdSlt   = document.getElementById('Nurse_Id');
const YearSlt       = document.getElementById('year');
const MonthSlt      = document.getElementById('month');
const LengthSlt     = document.getElementById('length');
const Station_2Chk  = document.getElementById('Station_2');
const Car_NoIpt     = document.getElementById('Car_No');
const ipc           = require('electron').ipcRenderer;
var USER_ID, USER_PW, NURSE_ID, INPUT_YEAR, INPUT_MONTH, INPUT_LENGTH, STATION_2_MODE = false, CAR_NO, NURSE_NAME;
var cookie, COUNT_ITEM = 1, TARGET_YEAR1, TARGET_YEAR2, TARGET_MONTH1, TARGET_MONTH2, TABLE_LENGTH, TABLE_CUR, PAGE_LENGTH, PAGE_CUR, PAGE_NEXT_START;
var A_DATE = [], A_TIME1 = [], A_TIME2 = [], A_CAR_NO = [], A_OVERTIME = [], A_PARTNER = [];
var cheerio     = require('cheerio');
var Nightmare   = require('nightmare');
var nightmare   = Nightmare({ show: false, typeInterval: 20, switches: {
        'ignore-certificate-errors': true
    } });
loginBtn.addEventListener('click', function (event) {
    USER_ID     = User_IdIpt.value;
    USER_PW     = User_PWIpt.value;
    WEB_01();
    run_NM_1();
})
searchBtn.addEventListener('click', function (event) {
    NURSE_ID        = Nurse_IdSlt.value;
    INPUT_YEAR      = YearSlt.value;
    INPUT_MONTH     = MonthSlt.value;
    INPUT_LENGTH    = LengthSlt.value;
    if (STATION_2_MODE) {
        CAR_NO      = Car_NoIpt.value.substr(7);
    }
    target_dates();
    WEB_03();
})
researchBtn.addEventListener('click', function (event) {
    WEB_02();
    var num = document.getElementById("table_result").rows.length;
    for (var i = 1; i < num; i++) {
        document.getElementById("table_result").deleteRow(-1);
    }
    A_DATE = [], A_TIME1 = [], A_TIME2 = [], A_CAR_NO = [], A_OVERTIME = [], A_PARTNER = [];
    COUNT_ITEM = 1;
})
Station_2Chk.addEventListener('change', function(event) {
    if (document.getElementById('Station_2').checked == true) {
        document.getElementById('Car_No').disabled = false;
        document.getElementById('Table_S2').style.display = '';
        STATION_2_MODE  = true;
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
        ipc.send('print-to-pdf', path);
    }
})
var WEB_01 = function () {
    document.getElementById('div_login').style.display = 'none';
    document.getElementById('div_login_text').style.display = '';
}
var WEB_02 = function () {
    var cur_month = new Date();
    cur_month = cur_month.getMonth();
    cur_month++;
    document.getElementById('div_login_text').style.display = 'none';
    document.getElementById('div_search').style.display = '';
    document.getElementById('div_search_result').style.display = 'none';
    document.getElementById('Nurse_Id').focus();
    document.querySelector('select#month option[value=\'' + cur_month + '\']').selected = true;
}
var WEB_03 = function () {
    document.getElementById('div_search').style.display = 'none';
    document.getElementById('div_search_text').style.display = '';
}
var WEB_04 = function (i, j) {
    document.getElementById('div_search_text').style.display = 'none';
    document.getElementById('div_search_result').style.display = '';

    var num = document.getElementById('table_result').rows.length;
    var tr  = document.getElementById('table_result').insertRow(num);
    var td;
    td = tr.insertCell(-1);
    td.innerHTML = (i + 1);
    td = tr.insertCell(-1);
    td.innerHTML = A_DATE[i];
    td = tr.insertCell(-1);
    td.innerHTML = A_TIME1[i];
    td = tr.insertCell(-1);
    td.innerHTML = A_TIME2[i];
    td = tr.insertCell(-1);
    td.innerHTML = CALC_E(i);
    td = tr.insertCell(-1);
    td.innerHTML = CALC_F2(i);
    td = tr.insertCell(-1);
    td.innerHTML = CALC_H2(i);
    td = tr.insertCell(-1);
    td.innerHTML = A_PARTNER[i];
    if (STATION_2_MODE) {
        td = tr.insertCell(-1);
        td.innerHTML = CALC_I(i);
    }
    if (CALC_H2(i) > 0) {
        document.querySelector('tr:nth-child(' + (num+1) + ')').style.backgroundColor = '#3393df';
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
var WEB_06_RESET = function (msg) {
    document.getElementById('div_login').style.display = '';
    document.getElementById('div_login_text').style.display = 'none';
    document.getElementById('div_search').style.display = 'none';
    document.getElementById('div_search_text').style.display = 'none';
    document.getElementById('div_search_result').style.display = 'none';
    if (msg == 'fail') {
        document.getElementById('msg').innerHTML = 'Login failed, please try again.';
        document.getElementById('div_msg').style.display = '';
    }
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
    .type('input[name=User_Id]', USER_ID)
    .type('input[name=User_PW]', USER_PW)
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
            run_NM_1_4();
        } else {
            WEB_06_RESET('fail');
        }
    })
    .catch(function (error) {
        console.error('Search failed:', error);
    });
}
var run_NM_1_4 = function () {
    nightmare
    .goto('http://ems.mohw.gov.tw/AidCase/AidCaseMT.jsp?start=1')
    .wait('table.EmsFormTable')
    .evaluate(function () {
        return document.querySelector('html').innerHTML;
    })
    .then(function (result) {
        var $       = cheerio.load(result);
        var temp    = $('select[name=dept_no1] option').text();//
        var nurse_code   = $('select[name=nurse_code]').html();
        var car_no2   = $('select[name=ambu_no]').html();
        // console.log('temp:\t' + temp + temp3);
        document.getElementById('Nurse_Id').innerHTML = nurse_code;
        document.getElementById('Car_No').innerHTML = car_no2;

        var num = document.getElementById('Car_No').options.length;
        document.getElementById('Car_No').options.remove(0);
        document.getElementById('Car_No').options[num-2].selected = true;
        WEB_02();
    })
    .catch(function (error) {
        console.error('Search failed:', error);
    });
}
var run_NM_2 = function () {
    nightmare
    .goto('http://ems.mohw.gov.tw/AidCase/AidCaseMT.jsp?start=1')
    .wait('table.EmsFormTable')
    .select('select[name="aid_start_year"]',    TARGET_YEAR1)
    .select('select[name="aid_start_month"]',   TARGET_MONTH1)
    .select('select[name="aid_start_day"]',     '01')
    .select('select[name="aid_end_year"]',      TARGET_YEAR2)
    .select('select[name="aid_end_month"]',     TARGET_MONTH2)
    .select('select[name="aid_end_day"]',       '31')
    .select('select[name="nurse_code"]',        NURSE_ID)
    .click('input[type="submit"]')
    .evaluate(function () {
        return document.querySelector('html').innerHTML;
    })
    .then(function (result) {
        var $       = cheerio.load(result);
        NURSE_NAME  = $('select[name=nurse_code] option[value=\"' + NURSE_ID + '\"]').text();//name
        console.log(NURSE_NAME);
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
        PAGE_LENGTH = result;
        PAGE_CUR    = 1;
        console.log('PAGE_LENGTH:\t' + PAGE_LENGTH);
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
        TABLE_LENGTH    = result;
        TABLE_CUR       = 2;
        console.log('TABLE_LENGTH:\t' + TABLE_LENGTH);
        run_NM_5();
    })
    .catch(function (error) {
        console.error('Search failed:', error);
    });
}
var run_NM_5 = function () {
    if (TABLE_CUR < TABLE_LENGTH + 1) {
        console.log('TABLE_CUR\t' + TABLE_CUR);
        nightmare
        .click('form[name=form1] table tr:nth-child(' + TABLE_CUR + ') input[name=code_id]')
        .click('form[name=form1] input[type=button][value="明細"]')
        .wait('table.EmsDataTable1')
        .evaluate(function () {
            return document.querySelector('html').innerHTML;
        })
        .then(function (result) {
            var $       = cheerio.load(result);
            var date    = $('table.EmsDataTable1:nth-child(1) tr:nth-child(2) td:nth-child(2) font').text();
            var time1   = $('table.EmsDataTable1:nth-child(1) tr:nth-child(4) td:nth-child(2) font').text();
            var time2   = $('table.EmsDataTable1:nth-child(1) tr:nth-child(5) td:nth-child(6) font').text();
            var car_no  = $('form[name=form1] > table.EmsDataTable1 tr:nth-child(1) td:nth-child(2) font').text();
            var partner = $('table.EmsDataTable1:nth-child(3) tr:nth-child(3) td:nth-child(2) font').text();
            time1       = time1.split(':')[0].substr(time1.split(':')[0].length - 2) + ':' + time1.split(':')[1].substr(0 ,2);
            time2       = time2.split(':')[0].substr(time2.split(':')[0].length - 2) + ':' + time2.split(':')[1].substr(0 ,2);
            car_no      = car_no.substr(0 ,3);
            A_DATE[COUNT_ITEM - 1]      = date;
            A_TIME1[COUNT_ITEM - 1]     = time1;
            A_TIME2[COUNT_ITEM - 1]     = time2;
            A_CAR_NO[COUNT_ITEM - 1]    = car_no;
            
            if (NURSE_NAME != '%') {
                partner = partner.replace(NURSE_NAME, '');
            }
            partner = partner.replace(/\s\s+/g, ' ');
            A_PARTNER[COUNT_ITEM - 1]   = partner;

            console.log('date:\t' + date + '\ntime1:\t' + time1 + '\ntime2:\t' + time2 + '\ncar_no:\t' + car_no + '\n' + partner);

            WEB_04(COUNT_ITEM - 1, PAGE_CUR);
            
            COUNT_ITEM++;
            TABLE_CUR++;
            if (TABLE_CUR == 12 && PAGE_CUR != PAGE_LENGTH) {
                PAGE_CUR++;
            }
            PAGE_NEXT_START = ((PAGE_CUR - 1) * 10) + 1;
            run_NM_6();
        })
        .catch(function (error) {
            console.error('Search failed:', error);
        });
    }
}
var run_NM_6 = function () { /******************* GO BACK ***************************/
    nightmare
    .goto('http://ems.mohw.gov.tw/AidCase/AidCaseMTSelect.jsp?start=' + PAGE_NEXT_START)
    .then(function () {
        if (TABLE_CUR == 12 && !(PAGE_CUR > PAGE_LENGTH)) { //change page
            run_NM_4();
        } else if(TABLE_CUR == (TABLE_LENGTH + 1) && PAGE_CUR == PAGE_LENGTH) {
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
    TARGET_MONTH1   = INPUT_MONTH;
    TARGET_YEAR1    = INPUT_YEAR;
    TARGET_MONTH2   = parseInt(INPUT_MONTH) + parseInt(INPUT_LENGTH) - 1;
    TARGET_YEAR2    = TARGET_YEAR1;
    if (TARGET_MONTH2 > 12) {
        TARGET_MONTH2   -= 12;
        TARGET_YEAR2    += 1;
    }
    TARGET_MONTH1   = ('0' + TARGET_MONTH1).slice(-2);
    TARGET_MONTH2   = ('0' + TARGET_MONTH2).slice(-2);
    TARGET_YEAR1    = ('0' + TARGET_YEAR1).slice(-3);
    TARGET_YEAR2    = ('0' + TARGET_YEAR2).slice(-3);
    run_NM_2();
    // run_NM_1_4();
}
var CALC_E = function (i) {
    var e_time1 = new Date('1992/08/30 ' + A_TIME1[i] + ':00').getTime();
    var e_time2 = new Date('1992/08/30 ' + A_TIME2[i] + ':00').getTime();
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
    var e_time1     = new Date('1992/08/30 ' + A_TIME1[i] + ':00').getTime();
    var e_time2     = new Date('1992/08/30 ' + A_TIME2[i] + ':00').getTime();
    var e_time3     = new Date();
    var e_time08    = new Date('1992/08/30 08:00:00').getTime();
    var e_time18    = new Date('1992/08/30 18:00:00').getTime();
    if (STATION_2_MODE == true && A_CAR_NO[i] == CAR_NO) {
        if (e_time1 < e_time08 || e_time2 < e_time08) {
            if (e_time1 > e_time08 && e_time2 <= e_time08) {
                e_time3.setTime(e_time2);
                A_OVERTIME[i] = e_time3.getHours() + ':' + e_time3.getMinutes();
            } else if (e_time1 < e_time08 && e_time2 <= e_time08) {
                e_time3.setTime(e_time2 - e_time1);
                A_OVERTIME[i] = e_time3.getUTCHours() + ':' + e_time3.getUTCMinutes();
            } else if (e_time1 < e_time08 && e_time2 > e_time08) {
                e_time3.setTime(e_time08 - e_time1);
                A_OVERTIME[i] = e_time3.getUTCHours() + ':' + e_time3.getUTCMinutes();
            }
        }else {
            A_OVERTIME[i] = '';
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
            A_OVERTIME[i] = e_time3.getUTCHours() + ':' + e_time3.getUTCMinutes();
        } else {
            A_OVERTIME[i] = '';
        }
    }
    if (A_OVERTIME[i] != '') {
        A_OVERTIME[i] = A_OVERTIME[i].split(':')[0] + ':' + (0 + A_OVERTIME[i].split(':')[1]).slice(-2);
    }
    return A_OVERTIME[i];
}
var CALC_H2 = function (i) {
    if (A_OVERTIME[i] != '') {
        return A_OVERTIME[i].split(':')[0];
    } else {
        return '';
    }
}
var CALC_I = function (i) {
    if (A_CAR_NO[i] == CAR_NO) {
        return 'V';
    } else {
        return '';
    }
}
