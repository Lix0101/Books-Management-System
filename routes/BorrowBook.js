'use strict';

const HTM = exports.html = {
    success: '<html><body><div id=\'result\' style=\'display:none\'>0</div>成功</body></html>',
    readerNotFound: '<html><body><div id=\'result\' style=\'display:none\'>1</div>该证号不存在</body></html>',
    bookNotFound: '<html><body><div id=\'result\' style=\'display:none\'>2</div>该书号不存在</body></html>',
    overdueBooks: '<html><body><div id=\'result\' style=\'display:none\'>3</div>该读者有超期书未还</body></html>',
    alreadyBorrowed: '<html><body><div id=\'result\' style=\'display:none\'>4</div>该读者已经借阅该书，且未归还</body></html>',
    noBooksAvailable: '<html><body><div id=\'result\' style=\'display:none\'>5</div>该书已经全部借出</body></html>',
    customError: (message) => `<html><body><div id='result' style='display:none'>6</div>${message}</body></html>`
};

const { isValidReaderID, isValidBookID } = require("./validator"); // 引用 validator.js 中的验证函数
const db = require("../coSqlite3");
const moment = require('../moment');  

exports.bb = function* (req, res) {
    let { rID = '', bID = '' } = req.body; // 使用构造赋值提取参数

    // 验证证号 rID 和 书号 bID
    if (!isValidReaderID(rID)) {
        return res.end(HTM.readerNotFound); // 验证证号
    }

    if (!isValidBookID(bID)) {
        return res.end(HTM.bookNotFound); // 验证书号
    }

    try {
        // 检查证号是否存在
        let reader = yield db.execSQL(`SELECT * FROM reader WHERE readerID = ?`, [rID]);
        if (reader.length === 0) {
            return res.end(HTM.readerNotFound);
        }

        let books = yield db.execSQL(`SELECT * FROM books WHERE bookID = ?`, [bID]);
        if (books.length === 0) {
            return res.end(HTM.bookNotFound);
        }

        // 检查该读者是否有超期未还的书籍
        let overdueBooks = yield db.execSQL(`
            SELECT * FROM booksystem 
            WHERE readerID = ? AND julianday('now') > julianday(borrowdate) + 60
        `, [rID]);
        if (overdueBooks.length > 0) {
            return res.end(HTM.overdueBooks);
        }

        // 检查该读者是否已经借阅该书且未归还
        let borrowedBook = yield db.execSQL(`
            SELECT * FROM booksystem 
            WHERE readerID = ? AND bookID = ?
        `, [rID, bID]);
        if (borrowedBook.length > 0) {
            return res.end(HTM.alreadyBorrowed);
        }

        // 检查书号是否存在且有库存可借
        let book = yield db.execSQL(`SELECT * FROM books WHERE bookID = ? AND bookCnt > 0`, [bID]);
        if (book.length === 0) {
            return res.end(HTM.noBooksAvailable);
        }

        // 使用 moment 库设置借书日期和最迟归还日期
        let borrowDate = moment().format('YYYY-MM-DD');  // 当前日期

        // 插入借书记录到 booksystem 表
        yield db.execSQL(`
            INSERT INTO booksystem (readerID, bookID, borrowdate) 
            VALUES (?, ?, ?)
        `, [rID, bID, borrowDate]);

        // 更新书籍库存
        yield db.execSQL(`UPDATE books SET bookCnt = bookCnt - 1 WHERE bookID = ?`, [bID]);

        // 返回成功信息
        res.end(HTM.success);
    } catch (error) {
        console.error("借书时出错:", error);
        res.statusCode = 500;
        res.end(HTM.customError('数据库操作失败'));
    }
};
