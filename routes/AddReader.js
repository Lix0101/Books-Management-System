'use strict';

const HTM = {
    success: '<html><body><div id=\'result\' style=\'display:none\'>0</div>成功</body></html>',
    readerExists: '<html><body><div id=\'result\' style=\'display:none\'>1</div>该证号已经存在</body></html>',
    paramError: (message) => `<html><body><div id='result' style='display:none'>2</div>提交的参数有误：${message}</body></html>`
};

const db = require("../coSqlite3");
const { 
    isValidReaderID, 
    isValidReaderName, 
    isValidReaderSex, 
    isValidDept, 
    isValidGrade 
} = require("./validator");  // 引用 validator.js 中的验证函数

exports.ar = function* (req, res) {

    let { rID = '', rName = '', rSex = '', rDept = '', rGrade = '' } = req.body;

    // 验证证号 rID 是否有效
    if (!isValidReaderID(rID)) {
        return res.end(HTM.paramError('证号不能为空且不能超过8个字符'));
    }

    // 验证姓名 rName 是否有效
    if (!isValidReaderName(rName)) {
        return res.end(HTM.paramError('姓名不能为空且不能超过10个字'));
    }

    // 验证性别 rSex 是否有效
    if (!isValidReaderSex(rSex)) {
        return res.end(HTM.paramError('性别应为“男”或“女”'));
    }

    // 验证院系 rDept 是否有效
    if (rDept && !isValidDept(rDept)) {
        return res.end(HTM.paramError('院系名不能超过10个字'));
    }

    // 验证年级 rGrade 是否有效
    if (rGrade && !isValidGrade(rGrade)) {
        return res.end(HTM.paramError('年级必须为正整数'));
    }

    try {
        // 检查证号是否已经存在
        let existingReader = yield db.execSQL(`SELECT * FROM reader WHERE readerID = ?`, [rID]);
        if (existingReader.length > 0) {
            return res.end(HTM.readerExists);  // 证号已存在
        }

        // 插入新的读者信息
        yield db.execSQL(`
            INSERT INTO reader (readerID, readerName, readerSex, readerDept, readerGrade) 
            VALUES (?, ?, ?, ?, ?)
        `, [rID, rName, rSex, rDept, parseInt(rGrade)]);

        // 返回成功信息
        res.end(HTM.success);
    } catch (error) {
        console.error("添加读者时出错:", error);
        res.statusCode = 500;
        res.end(HTM.paramError('数据库操作失败'));
    }
};
