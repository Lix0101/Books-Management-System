'use strict';
const HTM = {
    success: '<html><body><div id=\'result\' style=\'display:none\'>0</div>成功</body></html>',
    readerNotFound: '<html><body><div id=\'result\' style=\'display:none\'>1</div>该证号不存在</body></html>',
    paramError: (message) => `<html><body><div id='result' style='display:none'>2</div>提交的参数有误：${message}</body></html>`
};
const db = require("../coSqlite3");
const { 
    isValidReaderID, 
    isValidReaderName, 
    isValidReaderSex, 
    isValidDept, 
    isValidGrade 
} = require("./validator");

exports.ur = function* (req, res) {
    // 使用构造赋值提取请求中的数据
    let { rID = '', rName, rSex, rDept, rGrade } = req.body;

    // 验证证号 rID 是否有效
    if (!isValidReaderID(rID)) {
        return res.end(HTM.paramError('证号不能为空且不能超过8个字符'));
    }

    // 验证其他可修改的字段
    if (rName && !isValidReaderName(rName)) {
        return res.end(HTM.paramError('姓名不能超过10个字'));
    }

    if (rSex && !isValidReaderSex(rSex)) {
        return res.end(HTM.paramError('性别应为“男”或“女”'));
    }

    if (rDept && !isValidDept(rDept)) {
        return res.end(HTM.paramError('系名不能超过10个字'));
    }

    if (rGrade && !isValidGrade(rGrade)) {
        return res.end(HTM.paramError('年级必须为正整数'));
    }

    try {
        // 查询证号是否存在
        let existingReader = yield db.execSQL(`SELECT * FROM reader WHERE readerID = ?`, [rID]);
        if (existingReader.length === 0) {
            return res.end(HTM.readerNotFound);  // 如果读者不存在
        }

        // 动态构建 SQL 更新语句
        let updates = [];
        let params = [];

        if (rName) {
            updates.push("readerName = ?");
            params.push(rName);
        }
        if (rSex) {
            updates.push("readerSex = ?");
            params.push(rSex);
        }
        if (rDept) {
            updates.push("readerDept = ?");
            params.push(rDept);
        }
        if (rGrade) {
            updates.push("readerGrade = ?");
            params.push(parseInt(rGrade));
        }

        // 如果有要更新的字段，执行更新
        if (updates.length > 0) {
            let sql = `UPDATE reader SET ${updates.join(', ')} WHERE readerID = ?`;
            params.push(rID);
            yield db.execSQL(sql, params);
        }

        // 返回成功信息
        res.end(HTM.success);
    } catch (error) {
        console.error("修改读者信息时出错:", error);
        res.statusCode = 500;
        res.end(HTM.paramError('数据库操作失败'));
    }
};
