// returnBook.js

'use strict';

const HTM = exports.html = {
    success: '<html><body><div id=\'result\' style=\'display:none\'>0</div>成功</body></html>',
    readerNotFound: '<html><body><div id=\'result\' style=\'display:none\'>1</div>该证号不存在</body></html>',
    bookNotFound: '<html><body><div id=\'result\' style=\'display:none\'>2</div>该书号不存在</body></html>',
    notBorrowed: '<html><body><div id=\'result\' style=\'display:none\'>3</div>该读者并未借阅该书</body></html>',
    customError: (message) => `<html><body><div id='result' style='display:none'>6</div>${message}</body></html>`
};

const db = require("../coSqlite3");
const moment = require('../moment');  
const { isValidReaderID, isValidBookID } = require('./validator');  // 引入新的验证函数

exports.rb = function* (req, res) {
    const { rID = '', bID = '' } = req.body; // 使用构造赋值

    // 验证证号和书号是否填写
    if (!isValidReaderID(rID)) {  // 使用封装后的验证函数
        return res.end(HTM.readerNotFound);
    }
    if (!isValidBookID(bID)) {  // 使用封装后的验证函数
        return res.end(HTM.bookNotFound);
    }

    try {
        // 检查证号是否存在
        let reader = yield db.execSQL(`SELECT * FROM reader WHERE readerID = ?`, [rID]);
        if (reader.length === 0) {
            return res.end(HTM.readerNotFound);
        }

        // 检查书号是否存在
        let book = yield db.execSQL(`SELECT * FROM books WHERE bookID = ?`, [bID]);
        if (book.length === 0) {
            return res.end(HTM.bookNotFound);
        }

        // 检查该读者是否借阅该书且未归还
        let borrowedBook = yield db.execSQL(`
            SELECT * FROM booksystem 
            WHERE readerID = ? AND bookID = ?
        `, [rID, bID]);
        if (borrowedBook.length === 0) {
            return res.end(HTM.notBorrowed);
        }

        // 获取当前日期作为还书日期
        const returnDate = moment().format('YYYY-MM-DD'); // 使用 moment 格式化日期

        // 更新借阅记录的 returnDate 字段，表示还书完成
        yield db.execSQL(`
           DELETE FROM booksystem WHERE readerID = ? AND bookID = ?
        `, [rID, bID]);

        // 更新书籍库存，增加1
        yield db.execSQL(`UPDATE books SET bookCnt = bookCnt + 1 WHERE bookID = ?`, [bID]);

        // 返回成功信息
        res.end(HTM.success);
    } catch (error) {
        console.error("还书时出错:", error);
        res.statusCode = 500;
        res.end(HTM.customError('数据库操作失败'));
    }
};
