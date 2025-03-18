'use strict';
const HTM = {
    tableStart: `<html><head><META HTTP-EQUIV="Content-Type" Content="text-html;charset=utf-8"></head><body><table border=1 id='result'>`,
    tableEnd: `</table></body></html>`,
    noResults: `<html><head><META HTTP-EQUIV="Content-Type" Content="text-html;charset=utf-8"></head><body><table border=1 id='result'></table></body></html>`,
    paramError: (message) => `<html><body><div id='result' style='display:none'>2</div>提交的参数有误：${message}</body></html>`
};
const db = require("../coSqlite3");

exports.sr = function* (req, res) {
    let body = req.body;

    // 提取并验证参数
    let rID = body.rID || '';
    let rName = body.rName || '';
    let rSex = body.rSex || '';
    let rDept = body.rDept || '';
    let rGrade = body.rGrade || '';

    // 验证证号 rID 是否有效
    if (rID && rID.length > 8) {
        return res.end(HTM.paramError('证号不能为空且不能超过8个字符'));
    }

    // 验证姓名 rName 是否有效
    if (rName && rName.length > 10) {
        return res.end(HTM.paramError('姓名不能为空且不能超过10个字'));
    }

    if (rDept && rDept.length > 10) {
        return res.end(HTM.paramError('院系名不能超过10个字'));
    }

    // 验证性别 rSex 是否为“男”或“女”
    if (rSex && !['男', '女'].includes(rSex)) {
        return res.end(HTM.paramError('性别应为“男”或“女”'));
    }

    // 初始化查询条件和参数
    let conditions = [];
    let params = [];

    // 模糊查询条件
    if (body.rID) {
        conditions.push("readerID LIKE ?");
        params.push(`%${body.rID}%`);
    }
    if (body.rName) {
        conditions.push("readerName LIKE ?");
        params.push(`%${body.rName}%`);
    }
    if (body.rDept) {
        conditions.push("readerDept LIKE ?");
        params.push(`%${body.rDept}%`);
    }

    // 精确查询条件
    if (body.rSex && ['男', '女'].includes(body.rSex)) {
        conditions.push("readerSex = ?");
        params.push(body.rSex);
    }

    // 年级范围查询
    if (body.rGrade0) {
        if (isNaN(body.rGrade0) || parseInt(body.rGrade0) <= 0) {
            return res.end(HTM.paramError('年级必须为正整数'));
        }
        conditions.push("readerGrade >= ?");
        params.push(parseInt(body.rGrade0));
    }
    if (body.rGrade1) {
        if (isNaN(body.rGrade1) || parseInt(body.rGrade1) <= 0) {
            return res.end(HTM.paramError('年级必须为正整数'));
        }
        conditions.push("readerGrade <= ?");
        params.push(parseInt(body.rGrade1));
    }

    try {
        // 构建查询语句
        let query = "SELECT * FROM reader";
        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        // 执行查询
        let readers = yield db.execSQL(query, params);

        // 如果没有查询到结果，返回空表格
        if (readers.length === 0) {
            return res.end(HTM.noResults);
        }

        // 构建返回的表格
        let result = HTM.tableStart;
        for (let reader of readers) {
            result += `<tr>
                <td>${reader.readerID}</td>
                <td>${reader.readerName}</td>
                <td>${reader.readerSex}</td>
                <td>${reader.readerDept}</td>
                <td>${reader.readerGrade || ' '}</td>
            </tr>`;
        }
        result += HTM.tableEnd;

        // 返回查询结果
        res.end(result);
    } catch (error) {
        console.error("查询读者时出错:", error);
        res.statusCode = 500;
        res.end(HTM.paramError('数据库查询失败'));
    }
};