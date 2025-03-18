// updateBookCount.js

'use strict';
const HTM = {
    success: '<html><body><div id=\'result\' style=\'display:none\'>0</div>成功</body></html>',
    bookNotFound: '<html><body><div id=\'result\' style=\'display:none\'>1</div>该书不存在</body></html>',
    paramError: (message) => `<html><body><div id='result' style='display:none'>2</div>提交的参数有误：${message}</body></html>`
};

const db = require("../coSqlite3");
const { isValidBookID, isValidBookCount, isValidDate, isValidDateRange } = require("./validator");

exports.abc = function* (req, res) {
    let { bID = '', bCnt = '', bDate = '' } = req.body;

    // 验证书号是否合法
    if (!isValidBookID(bID)) {
        return res.end(HTM.paramError('书号不能为空且不能超过30个字符'));
    }

    // 验证书本数量是否合法
    if (!isValidBookCount(bCnt)) {
        return res.end(HTM.paramError('数量不能为空且必须是大于0的整数'));
    }


    try {
        // 查询书籍是否存在
        let book = yield db.execSQL(`SELECT * FROM books WHERE bookID = ?`, [bID]);
        if (book.length === 0) {
            // 书籍不存在
            return res.end(HTM.bookNotFound);
        }

        // 更新书籍数量
        let newCount = parseInt(book[0].bookCnt) + parseInt(bCnt);
        yield db.execSQL(`UPDATE books SET bookCnt = ? WHERE bookID = ?`, [newCount, bID]);

        // 返回成功信息
        res.end(HTM.success);
    } catch (error) {
        console.error("更新书籍数量时出错:", error);
        res.statusCode = 500;
        res.end(HTM.paramError('数据库操作失败'));
    }
};
