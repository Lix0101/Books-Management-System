'use strict';

const HTM = exports.html = {
    begin: '<html><head><META HTTP-EQUIV="Content-Type" Content="text-html; charset=utf-8"></head><body>',
    successBegin: '<html><body><div id=\'result\' style=\'display:none\'>0</div>',
    failureBegin: '<html><body><div id=\'result\' style=\'display:none\'>1</div>',
    end: '</body></html>'
};

const db = require("../coSqlite3");


exports.tableinit = function* (req, res) {
    try {
        
        yield db.execSQL(`
            CREATE TABLE IF NOT EXISTS books (
                bookID VARCHAR(255) PRIMARY KEY,              -- 主键约束
                bookName VARCHAR(255) NOT NULL,               -- NOT NULL 约束
                bookPub VARCHAR(255),
                bookDate VARCHAR(255),
                bookAuthor VARCHAR(255),
                bookMem VARCHAR(255),
                bookCnt INTEGER
            );
        `);
        console.log("books 表创建成功或已存在。");
        
        yield db.execSQL(`
            CREATE TABLE IF NOT EXISTS reader (
                readerID VARCHAR(255) PRIMARY KEY,           -- 主键约束
                readerName VARCHAR(255) NOT NULL,            -- NOT NULL 约束
                readerSex VARCHAR(50),
                readerDept VARCHAR(100),
                readerGrade INTEGER
            );
        `);
        console.log("reader 表创建成功或已存在。");
        
        yield db.execSQL(`
           CREATE TABLE IF NOT EXISTS booksystem (
                readerID VARCHAR(255),                       -- 外键约束
                bookID VARCHAR(255),                         -- 外键约束
                borrowdate DATE,
                PRIMARY KEY (readerID, bookID),              -- 组合主键，readerID 和 bookID 作为主键
                FOREIGN KEY (readerID) REFERENCES reader(readerID) ON DELETE CASCADE,  -- 外键约束
                FOREIGN KEY (bookID) REFERENCES books(bookID) ON DELETE CASCADE  -- 外键约束
            );

        `);
        console.log("Booksystem 表创建成功或已存在。");

        // 返回成功响应
        res.end(HTM.successBegin + '成功' + HTM.end);
    } catch (error) {
        console.error("初始化数据库表时出错:", error);
        res.statusCode = 500;
        res.end(HTM.failureBegin + '数据库表初始化失败：' + error.message + HTM.end);
    }
};
