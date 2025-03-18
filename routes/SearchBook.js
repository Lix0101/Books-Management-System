'use strict';
const HTM = exports.html = {
    begin: '<html><head><META HTTP-EQUIV="Content-Type" Content="text-html; charset=utf-8"></head><body>',
    successBegin: '<div id=\'result\' style=\'display:none\'>0</div>',
    failureBegin: '<div id=\'result\' style=\'display:none\'>1</div>',
    end: '</body></html>',
    tableStart: `<table border="1" id="result">`,
    tableEnd: `</table>`,
    noResults: `<table border="1" id="result"></table>`,
    paramError: (message) => `<div id='result' style='display:none'>2</div>提交的参数有误：${message}`
};
const db = require("../coSqlite3");

/**
 * 查询书籍
 */
exports.sb = function* (req, res) {
    let body = req.body;

    // 初始化查询条件和参数
    let conditions = [];
    let params = [];

    // 模糊查询条件
    if (body.bID) {
        conditions.push("books.bookID LIKE ?");
        params.push(`%${body.bID}%`);
    }
    if (body.bName) {
        conditions.push("books.bookName LIKE ?");
        params.push(`%${body.bName}%`);
    }
    if (body.bPub) {
        conditions.push("books.bookPub LIKE ?");
        params.push(`%${body.bPub}%`);
    }
    if (body.bAuthor) {
        conditions.push("books.bookAuthor LIKE ?");
        params.push(`%${body.bAuthor}%`);
    }
    if (body.bMem) {
        conditions.push("books.bookMem LIKE ?");
        params.push(`%${body.bMem}%`);
    }

    // 日期范围查询
    if (body.bDate0) {
        conditions.push("books.bookDate >= ?");
        params.push(body.bDate0);
    }
    if (body.bDate1) {
        conditions.push("books.bookDate <= ?");
        params.push(body.bDate1);
    }

    try {
        // 构建查询语句，左连接 booksystem 表以统计借出数量
        let query = `
            SELECT books.bookID, books.bookName, books.bookCnt, books.bookPub, books.bookDate, books.bookAuthor, books.bookMem,
                   COUNT(booksystem.bookID) AS borrow_cnt
            FROM books
            LEFT JOIN booksystem ON books.bookID = booksystem.bookID
        `;
        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }
        query += " GROUP BY books.bookID";

        // 执行查询
        let books = yield db.execSQL(query, params);

        // 如果没有查询到结果，返回空表格
        if (books.length === 0) {
            const html = HTM.begin + HTM.noResults + HTM.end;
            return res.end(html);
        }

        // 构建返回的表格
        let result = HTM.begin + HTM.tableStart;

        for (let book of books) {
            // 确保 borrow_cnt 为数字，如果为 null 则设为 0
            let borrowed = book.borrow_cnt ? parseInt(book.borrow_cnt) : 0;
            let available = book.bookCnt;
            let total = book.bookCnt+borrowed;

            // 确保数量不为负数
            available = available >= 0 ? available : 0;
            total = total >= 0 ? total : 0;

            result += `<tr>
                <td>${book.bookID}</td>
                <td>${book.bookName}</td>
                <td>${total}</td>
                <td>${available}</td>
                <td>${book.bookPub}</td>
                <td>${book.bookDate}</td>
                <td>${book.bookAuthor}</td>
                <td>${book.bookMem || ''}</td>
            </tr>`;
        }
        result += HTM.tableEnd + HTM.end;

        // 返回查询结果
        res.end(result);
    } catch (error) {
        console.error("查询书籍时出错:", error);
        res.statusCode = 500;
        const errorHtml = HTM.begin + HTM.paramError('数据库查询失败') + HTM.end;
        res.end(errorHtml);
    }
};