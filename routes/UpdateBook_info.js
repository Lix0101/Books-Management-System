'use strict';

const HTM = {
    success: '<html><body><div id=\'result\' style=\'display:none\'>0</div>成功</body></html>',
    bookNotFound: '<html><body><div id=\'result\' style=\'display:none\'>1</div>该书不存在</body></html>',
    paramError: (message) => `<html><body><div id='result' style='display:none'>2</div>提交的参数有误：${message}</body></html>`
};

const db = require("../coSqlite3");
const { 
    isValidBookID, 
    isValidBookName, 
    isValidPublisher, 
    isValidAuthor, 
    isValidSummary, 
    isValidDate, 
    isValidDateRange 
} = require("./validator");  // 引用 validator.js 中的验证函数

exports.ub = function* (req, res) {
    const { bID = '', bName, bPub, bAuthor, bMem, bDate } = req.body; // 使用构造赋值

    // 验证书号是否有效
    if (!isValidBookID(bID)) {
        return res.end(HTM.paramError('书号不能为空且不能超过30个字符'));
    }

    // 验证书名是否有效
    if (!isValidBookName(bName)) {
        return res.end(HTM.paramError('书名不能为空且不能超过30个字符'));
    }

    // 验证其他字段的有效性
    if (bPub && !isValidPublisher(bPub)) {
        return res.end(HTM.paramError('出版社名不可超过30个字符'));
    }

    if (bAuthor && !isValidAuthor(bAuthor)) {
        return res.end(HTM.paramError('作者名不可超过20个字符'));
    }

    if (bMem && !isValidSummary(bMem)) {
        return res.end(HTM.paramError('内容摘要不可超过30个字符'));
    }

    // 日期格式和合法性验证
    if (bDate) {
        if (!isValidDate(bDate) || !isValidDateRange(bDate)) {
            return res.end(HTM.paramError('出版日期格式错误或日期不合法'));
        }
    }

    try {
        // 查询书籍是否存在
        let book = yield db.execSQL(`SELECT * FROM books WHERE bookID = ?`, [bID]);
        if (book.length === 0) {
            return res.end(HTM.bookNotFound);  // 书籍不存在
        }

        // 动态构建 SQL 更新语句
        let updates = [];
        let params = [];

        // 根据输入的字段修改相应内容
        if (bName) {
            updates.push("bookName = ?");
            params.push(bName);
        }
        if (bPub) {
            updates.push("bookPub = ?");
            params.push(bPub);
        }
        if (bDate) {
            updates.push("bookDate = ?");
            params.push(bDate);
        }
        if (bAuthor) {
            updates.push("bookAuthor = ?");
            params.push(bAuthor);
        }
        if (bMem) {
            updates.push("bookMem = ?");
            params.push(bMem);
        }

        if (updates.length > 0) {
            // 构建最终的 SQL 更新语句
            let sql = `UPDATE books SET ${updates.join(', ')} WHERE bookID = ?`;
            params.push(bID);
            yield db.execSQL(sql, params);
        }

        // 返回成功信息
        res.end(HTM.success);
    } catch (error) {
        console.error("修改书籍信息时出错:", error);
        res.statusCode = 500;
        res.end(HTM.paramError('数据库操作失败'));
    }
};
