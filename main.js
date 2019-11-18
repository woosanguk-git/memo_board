const http = require("http");
const url = require("url");
const qs = require("querystring");
const fs = require("fs");
const ejs = require("ejs");
const pageProcess = require("./lib/pageProcess");

//db 연결
const mysql_dbc = require("./lib/db_con")();
const db = mysql_dbc.init();

mysql_dbc.db_open(db);

const app = http.createServer(function(request, response) {
  const _url = request.url;
  console.log(`_url = ${_url}`);
  const queryData = url.parse(_url, true).query;

  const pathname = url.parse(_url, true).pathname;
  console.log(queryData);
  console.log(queryData.page);
  console.log(`pathname = ${pathname}`);
  if (pathname != "/favicon.ico") {
    if (pathname === "/") {
      let body = "";
      const pageUnit = 10;
      let nowPage = 1;
      let totalPage = 0;
      let startPage = 1;
      let endPage = totalPage;
      // 메인에 들어오자 마자 1페이지를 보여준다.
      if (queryData.page) {
        nowPage = parseInt(queryData.page);
        console.log("현재 페이지 " + nowPage);
      } else {
        response.writeHead(302, { Location: "/?page=1" });
        response.end();
      }

      // query
      const totalPageQuery = `SELECT COUNT(*) AS ct FROM board`;
      let pageQuery = `SELECT * FROM board ORDER BY modidate DESC
      LIMIT ${(parseInt(nowPage) - 1) * 10}, 10`;

      const indexHTML = fs.readFileSync(__dirname + "/index.ejs", "utf-8");

      db.query(totalPageQuery, function(error, dbTotalPage) {
        // console.log("쿼리 " + pageQuery);
        // 여기서 토탈페이지랑 시작페이지 끝페이지 계산
        totalPage = parseInt(dbTotalPage[0].ct / pageUnit + 1);
        const result = pageProcess.pageProcessF(nowPage, totalPage);
        startPage = result.startPage;
        endPage = result.endPage;
        nowPage = pageProcess.mediateNowPage(nowPage, totalPage);
        pageQuery = `SELECT * FROM board ORDER BY modidate DESC
          LIMIT ${(nowPage - 1) * 10}, 10`;
        db.query(pageQuery, function(error, pageData) {
          response.writeHead(200, { "context-type": "text/html" });
          // console.log(pageData);
          response.write(
            ejs.render(indexHTML, {
              memo: pageData,
              totalPageCount: totalPage,
              currentPage: nowPage,
              startPage: startPage,
              endPage: endPage
            })
          );
          response.end();
        });
      });
    } else if (pathname.indexOf(".css") != -1) {
      // css file apply
      fs.readFile(__dirname + pathname, function(error, cssFile) {
        if (error) {
          console.log(`pathname.indexOf('.css') error : ${error}`);
        }
        response.writeHead(200, { "context-type": "text/css" });
        response.write(cssFile);
        response.end();
      });
    } else if (pathname.indexOf(".js") != -1) {
      // css file apply
      fs.readFile(__dirname + pathname, "utf-8", function(error, jsFile) {
        if (error) {
          console.log(`pathname.indexOf('.js') error : ${error}`);
        }
        response.writeHead(200, { "context-type": "text/javascript" });
        response.write(ejs.render(jsFile));
        response.end();
      });
    } else if (pathname === "/create") {
      fs.readFile(__dirname + "/create.ejs", "utf-8", function(
        error,
        htmlFile
      ) {
        response.writeHead(200, { "context-type": "text/html" });
        response.write(ejs.render(htmlFile));
        response.end();
      });
    } else if (pathname === "/create_process") {
      let createData = "";
      request.on("data", function(data) {
        createData += data;
        // console.log(createData);
      });
      request.on("end", function() {
        const inputData = qs.parse(createData);
        const dataInsertQuery = `
      INSERT INTO board (title, content, credate, modidate)
      VALUES('${inputData.title}', '${inputData.content}', NOW(),NOW())`;
        db.query(dataInsertQuery, function(error, result) {
          if (error) {
            throw error;
          }
          response.writeHead(302, { Location: "/" });
          response.end();
        });
      });
    } else if (pathname === "/delete_process") {
      let deleteData = "";
      request.on("data", function(data) {
        deleteData += data;
      });
      request.on("end", function() {
        const deleteMemoData = qs.parse(deleteData);
        // console.log(deleteMemoData.memo_id);
        const deleteQuery = `DELETE FROM board where id =${deleteMemoData.memo_id}`;
        db.query(deleteQuery, function(error, result) {
          if (error) {
            throw error;
          }
          response.writeHead(302, { Location: `/` });
          response.end();
        });
      });
    } else if (pathname === "/update") {
      let updateData = "";
      request.on("data", function(data) {
        updateData += data;
      });
      request.on("end", function() {
        const updateMemoData = qs.parse(updateData);
        console.log(updateMemoData.memo_id);
        const query = `SELECT * FROM board WHERE id = ${updateMemoData.memo_id}`;
        db.query(query, function(error, data) {
          fs.readFile(__dirname + "/update.ejs", "utf-8", function(
            error,
            updateHTML
          ) {
            response.writeHead(200, { "context-type": "text/html" });
            response.write(ejs.render(updateHTML, { memoData: data }));
            response.end();
          });
        });
      });
    } else if (pathname === "/update_process") {
      let updateData = "";
      request.on("data", function(data) {
        updateData += data;
      });
      request.on("end", function() {
        const updateMemoData = qs.parse(updateData);
        console.log(updateMemoData);
        const updateQuery = `UPDATE board SET title ='${updateMemoData.title}', content = '${updateMemoData.content}', modidate = NOW() WHERE id = ${updateMemoData.memo_id}`;
        db.query(updateQuery, function(error, data) {
          response.writeHead(302, { Location: "/?page=1" });
          response.end();
        });
      });
    } else {
      const memoId = pathname.replace("/", "");
      const memoListQeury = `SELECT * FROM board`;
      const query = `SELECT id,title,content, DATE_FORMAT(credate, '%Y-%m-%d') as credate, DATE_FORMAT(modidate, '%Y-%m-%d') as modidate FROM board where id = '${memoId}'`;
      fs.readFile(__dirname + "/memo.ejs", "utf-8", function(error, memoHTML) {
        db.query(query, function(error, data) {
          response.writeHead(200, { "context-type": "text/html" });
          response.write(ejs.render(memoHTML, { memoData: data }));
          // console.log(`------\n${memoData[0].id}`);
          response.end();
        });
      });
    }
  }
});
// pahthname  = /2 게시글 아이디가 패스로 들어오는걸 이용.
app.listen(3000);
