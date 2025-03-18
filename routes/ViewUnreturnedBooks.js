'use strict';
const HTM = {
    tableStart: `<html><head><META HTTP-EQUIV="Content-Type" Content="text-html;charset=utf-8"></head><body><table border=1 id='result'>`,
    tableEnd: `</table></body></html>`,
    noResults: `<html><head><META HTTP-EQUIV="Content-Type" Content="text-html;charset=utf-8"></head><body><table border=1 id='result'></table></body></html>`,
    readerNotFound: '<html><body><div id=\'result\' style=\'display:none\'>1</div>该证号不存在</body></html>',
    paramError: (message) => `<html><body><div id='result' style='display:none'>2</div>提交的参数有误：${message}</body></html>`
};

const db = require("../coSqlite3");
const moment = require('../moment');
const { isValidReaderID } = require("./validator");

exports.v = function* (req, res) {
    // 使用构造赋值提取请求中的数据
    let { rID = '' } = req.body;

    // 验证证号是否有效
    if (!isValidReaderID(rID)) {
        return res.end(HTM.paramError('证号不能为空且不能超过8个字符'));
    }

    try {
        // 查询证号是否存在
        let reader = yield db.execSQL(`SELECT * FROM reader WHERE readerID = ?`, [rID]);
        if (reader.length === 0) {
            return res.end(HTM.readerNotFound);  // 如果证号不存在
        }

        // 查询该读者所有未归还的书籍信息
        let unreturnedBooks = yield db.execSQL(`
            SELECT books.bookID, books.bookName, booksystem.borrowdate
            FROM booksystem
            JOIN books ON booksystem.bookID = books.bookID
            WHERE booksystem.readerID = ?
        `, [rID]);

        // 如果没有未还书籍，返回空表格
        if (unreturnedBooks.length === 0) {
            return res.end(HTM.noResults);
        }

        // 构建返回的表格
        let result = HTM.tableStart;
        for (let book of unreturnedBooks) {
            // 解析日期
            let borrowDate = moment(book.borrowdate).format('YYYY-MM-DD');
            let deadlineDate = moment(book.borrowdate).add(60, 'days').format('YYYY-MM-DD');

            // 判断是否超期
            let isOverdue = moment().isAfter(deadlineDate) ? '是' : '否';

            result += `<tr><td>${book.bookID}</td><td>${book.bookName}</td><td>${borrowDate}</td><td>${deadlineDate}</td><td>${isOverdue}</td></tr>`;
        }
        result += HTM.tableEnd;

        // 返回查询结果
        res.end(result);
    } catch (error) {
        console.error("查询未还书籍时出错:", error);
        res.statusCode = 500;
        res.end(`<html><body><div id='result' style='display:none'>6</div>数据库操作失败：${error.message}</body></html>`);
    }
};
