'use strict';

const HTM = {
    success: '<html><body><div id=\'result\' style=\'display:none\'>0</div>成功</body></html>',
    bookNotFound: '<html><body><div id=\'result\' style=\'display:none\'>1</div>该书不存在</body></html>',
    insufficientStock: '<html><body><div id=\'result\' style=\'display:none\'>2</div>减少的数量大于该书目前在库数量</body></html>',
    paramError: (message) => `<html><body><div id='result' style='display:none'>3</div>提交的参数有误：${message}</body></html>`
};

const db = require("../coSqlite3");
const { isValidBookID, isValidBookCount } = require("./validator"); // 引用验证函数

/**
 * 删除或减少书籍数量
 */
exports.dbc = function* (req, res) {
    // 使用构造赋值提取请求体中的 bID 和 bCnt
    let { bID = '', bCnt = '' } = req.body;

    // 书号验证
    if (!isValidBookID(bID)) {
        return res.end(HTM.paramError('书号不能为空且不能超过30个字符'));
    }

    // 数量验证
    if (!isValidBookCount(bCnt)) {
        return res.end(HTM.paramError('数量必须是大于0的整数'));
    }

    let reduceCount = parseInt(bCnt);

    try {
        // 查询书籍是否存在
        let books = yield db.execSQL("SELECT * FROM books WHERE bookID = ?", [bID]);
        if (books.length === 0) {
            return res.end(HTM.bookNotFound);
        }

        let book = books[0];
        let currentAvailable = parseInt(book.bookCnt);

        // 查询当前已借出的数量
        let borrowRecords = yield db.execSQL(
            "SELECT COUNT(*) AS borrow_cnt FROM booksystem WHERE bookID = ?",
            [bID]
        );
        let borrowed = borrowRecords[0].borrow_cnt ? parseInt(borrowRecords[0].borrow_cnt) : 0;

        // 检查减少的数量是否大于当前在库数量
        if (reduceCount > currentAvailable) {
            return res.end(HTM.insufficientStock);
        }

        let newAvailable = currentAvailable - reduceCount;
        let total = newAvailable + borrowed;

        if (total === 0) {
            // 删除该书籍
            yield db.execSQL("DELETE FROM books WHERE bookID = ?", [bID]);
        } else {
            // 更新书籍数量
            yield db.execSQL("UPDATE books SET bookCnt = ? WHERE bookID = ?", [newAvailable, bID]);
        }

        // 返回成功信息
        res.end(HTM.success);
    } catch (error) {
        console.error("减少书籍数量时出错:", error);
        res.statusCode = 500;
        res.end(HTM.paramError('数据库操作失败'));
    }
};
