'use strict';

const HTM = {
    success: '<html><body><div id=\'result\' style=\'display:none\'>0</div>成功</body></html>',
    alreadyExists: '<html><body><div id=\'result\' style=\'display:none\'>1</div>该书已经存在</body></html>',
    paramError: (message) => `<html><body><div id='result' style='display:none'>2</div>提交的参数有误：${message}</body></html>`
};

const db = require("../coSqlite3");
const { isValidBookID, isValidBookCount, isValidDate, isValidDateRange, isValidBookName } = require("./validator");  // 引用 validator.js 中的验证函数

// 添加书籍的处理函数
exports.ab = function* (req, res) {
    let { 
        bID = '', 
        bName = '', 
        bPub = '', 
        bDate = '', 
        bAuthor = '', 
        bMem = '', 
        bCnt = '' 
    } = req.body;

    // 校验字段
    if (!isValidBookID(bID)) {
        return res.end(HTM.paramError('书本编号不能为空且不能超过30个字符'));
    }
    if(!isValidBookName(bName)){
        return res.end(HTM.paramError('书名不能为空且不能超过30个字符'));
    }
    
    if (!isValidBookCount(bCnt)) {
        return res.end(HTM.paramError('书本数量不能为空且必须是大于0的整数'));
    }
    if (bDate && !isValidDate(bDate)) {
        return res.end(HTM.paramError('出版日期格式应为 yyyy-mm-dd'));
    }
    if (bDate && !isValidDateRange(bDate)) {
        return res.end(HTM.paramError('出版日期不合法，日期范围错误'));
    }

    // 检查必填字段是否为空
    if (!bID || !bName || !bCnt) {
        return res.end(HTM.paramError('书本编号、书名和数量不能为空'));
    }

    if(bAuthor && bAuthor.length>=20){
        return res.end(HTM.paramError('作者名最多20个字符'))
    }

    if(bMem && bMem.length>=30){
        return res.end(HTM.paramError('内容摘要最多30个字符'))
    }

    try {
        // 查询书本是否已存在
        let existingBook = yield db.execSQL(`SELECT * FROM books WHERE bookID = ?`, [bID]);
        if (existingBook.length > 0) {
            return res.end(HTM.alreadyExists);  // 书籍已存在时返回
        }

        // 插入新书籍
        yield db.execSQL(`
            INSERT INTO books (bookID, bookName, bookPub, bookDate, bookAuthor, bookMem, bookCnt) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [bID, bName, bPub, bDate, bAuthor, bMem, parseInt(bCnt)]);

        res.end(HTM.success);  // 返回成功信息
    } catch (error) {
        console.error("添加新书时出错:", error);
        res.statusCode = 500;
        res.end(HTM.paramError('添加新书失败，数据库错误'));  // 数据库错误时返回
    }
};
