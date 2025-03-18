'use strict';

const HTM = {
    success: '<html><body><div id=\'result\' style=\'display:none\'>0</div>成功</body></html>',
    readerNotFound: '<html><body><div id=\'result\' style=\'display:none\'>1</div>该证号不存在</body></html>',
    booksNotReturned: '<html><body><div id=\'result\' style=\'display:none\'>2</div>该读者尚有书籍未归还</body></html>',
    customError: (message) => `<html><body><div id='result' style='display:none'>6</div>${message}</body></html>`
};

const db = require("../coSqlite3");
const { isValidReaderID } = require("./validator"); // 引用验证函数


exports.dr = function* (req, res) {

    let { rID = '' } = req.body;

    // 验证证号
    if (!isValidReaderID(rID)) {
        return res.end(HTM.readerNotFound);
    }

    try {
        // 检查证号是否存在
        let reader = yield db.execSQL(`SELECT * FROM reader WHERE readerID = ?`, [rID]);
        if (reader.length === 0) {
            return res.end(HTM.readerNotFound);
        }

        // 检查该读者是否有未归还的书籍
        let unreturnedBooks = yield db.execSQL(`
            SELECT * FROM booksystem 
            WHERE readerID = ?
        `, [rID]);
        if (unreturnedBooks.length > 0) {
            return res.end(HTM.booksNotReturned);
        }

        // 删除读者记录
        yield db.execSQL(`DELETE FROM reader WHERE readerID = ?`, [rID]);
        yield db.execSQL(`DELETE FROM booksystem WHERE readerID = ?`, [rID]);

        // 返回成功信息
        res.end(HTM.success);
    } catch (error) {
        console.error("删除读者时出错:", error);
        res.statusCode = 500;
        res.end(HTM.customError('数据库操作失败'));
    }
};
