

// 验证书号是否合法，不能为空且不能超过30个字符
exports.isValidBookID = function(bID) {
    return bID && bID.length <= 30;
}

exports.isValidBookName = function(bName){
    return bName && bName.length<=30;
}
// 验证书本数量是否合法，不能为空且必须是大于0的整数
exports.isValidBookCount = function(bCnt) {
    return bCnt && !isNaN(bCnt) && parseInt(bCnt) > 0;
}

// 验证出版日期格式是否合法，格式应为 yyyy-mm-dd
exports.isValidDate = function(bDate) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(bDate);
}

// 验证日期的合法性（如月份1~12，日期1~31等）
exports.isValidDateRange = function(bDate) {
    const dateParts = bDate.split("-");
    let year = parseInt(dateParts[0], 10);
    let month = parseInt(dateParts[1], 10);
    let day = parseInt(dateParts[2], 10);

    if (month < 1 || month > 12) {
        return false;
    }

    const daysInMonth = [31, (isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return day >= 1 && day <= daysInMonth[month - 1];
}

// 辅助函数：判断是否为闰年
function isLeapYear(year) {
    return ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0));
}

// 验证证号是否合法，不能为空且不能超过8个字符
exports.isValidReaderID = function(rID) {
    return rID && rID.length <= 8;
}

// 验证姓名是否合法，不能为空且不能超过10个字
exports.isValidReaderName = function(rName) {
    return rName && rName.length <= 10;
}

// 验证性别是否合法，应该为“男”或“女”
exports.isValidReaderSex = function(rSex) {
    return ['男', '女'].includes(rSex);
}

// 验证院系名是否合法，不能超过10个字符
exports.isValidDept = function(rDept) {
    return rDept.length <= 10;
}

// 验证年级是否合法，必须为正整数
exports.isValidGrade = function(rGrade) {
    return !isNaN(rGrade) && parseInt(rGrade) > 0;
}

// validators.js

// 验证书籍名称是否合法，不能为空且不能超过50个字符
exports.isValidBookName = function(bookName) {
    return bookName && bookName.length <= 50;
}

// 验证出版社是否合法，不能为空且不能超过30个字符
exports.isValidPublisher = function(publisher) {
    return publisher && publisher.length <= 30;
}

// 验证作者是否合法，不能为空且不能超过20个字符
exports.isValidAuthor = function(author) {
    return author && author.length <= 20;
}

// 验证内容摘要是否合法，不能为空且不能超过100个字符
exports.isValidSummary = function(summary) {
    return summary && summary.length <= 100;
}

