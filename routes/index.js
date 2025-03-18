'use strict';
const app =require('../WebApp');
const init=require('./init');
const ab = require('./AddBook');
const abc = require('./AddBook_count');
const dbc = require('./DeleteBook_count');
const ub = require('./UpdateBook_info');
const sb = require('./SearchBook');
const ar = require('./AddReader');
const dr = require('./DeleteReader');
const ur = require('./UpdateReader');
const sr = require('./SearchReader');
const v = require('./ViewUnreturnedBooks');
const bb = require('./BorrowBook');
const rb = require('./ReturnBook');
const o = require('./OverDueReaders');


app.route('/init','post',init.tableinit);
app.route('/AddBook','post', ab.ab);
app.route('/AddBook_count','post',abc.abc);
app.route('/DeleteBook_count','post',dbc.dbc);
app.route('/UpdateBook_info','post',ub.ub);
app.route('/SearchBook','post',sb.sb);
app.route('/AddReader','post',ar.ar);
app.route('/DeleteReader','post',dr.dr);
app.route('/UpdateReader','post',ur.ur);
app.route('/SearchReader','post',sr.sr);
app.route('/ViewUnreturnedBooks','post',v.v);
app.route('/BorrowBook','post',bb.bb);
app.route('/ReturnBook','post',rb.rb);
app.route('/OverDueReaders','post',o.o);


