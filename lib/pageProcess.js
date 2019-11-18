function pageProcessF(nowPage, totalPage) {
  let startPage = parseInt(nowPage) - 4;
  let endPage = parseInt(nowPage) + 5;
  if (startPage < 1) {
    startPage = 1;
  }
  if (endPage > totalPage) {
    endPage = totalPage;
  }
  return { startPage: startPage, endPage: endPage };
}

function mediateNowPage(nowPage, totalPage){
    if(nowPage < 1){
        nowPage =1;
    } else if(nowPage >totalPage){
        nowPage = totalPage;
    } 
    return nowPage;

}



module.exports.pageProcessF = pageProcessF;
module.exports.mediateNowPage = mediateNowPage;
