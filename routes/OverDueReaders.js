'use strict';

const HTM = {
    tableStart: `<html><head><META HTTP-EQUIV="Content-Type" Content="text-html;charset=utf-8"></head><body><table border=1 id='result'>`,
    tableEnd: `</table></body></html>`,
    noResults: `<html><head><META HTTP-EQUIV="Content-Type" Content="text-html;charset=utf-8"></head><body><table border=1 id='result'></table></body></html>`
};

const db = require("../coSqlite3");

exports.o = function* (req, res) {
    try {
        // 查询所有超期的读者信息
        let overdueReaders = yield db.execSQL(`
            SELECT DISTINCT reader.readerID, reader.readerName, reader.readerSex, reader.readerDept, reader.readerGrade
            FROM reader
            JOIN booksystem ON reader.readerID = booksystem.readerID
            WHERE julianday('now') - julianday(booksystem.borrowdate) > 60
        `);

        // 如果没有查询到结果，返回空表格
        if (overdueReaders.length === 0) {
            return res.end(HTM.noResults);
        }

        // 构建返回的表格
        let result = HTM.tableStart;
        overdueReaders.forEach(reader => {
            let grade = reader.readerGrade ? reader.readerGrade : '';  // 处理 null 或 undefined 的情况
            result += `<tr><td>${reader.readerID}</td><td>${reader.readerName}</td><td>${reader.readerSex}</td><td>${reader.readerDept}</td><td>${grade}</td></tr>`;
        });
        result += HTM.tableEnd;

        // 返回查询结果
        res.end(result);
    } catch (error) {
        console.error("查询超期读者时出错:", error);
        res.statusCode = 500;
        res.end(`<html><body><div id='result' style='display:none'>6</div>数据库操作失败：${error.message}</body></html>`);
    }
};
