const pageNumber = document.querySelectorAll(".js-page-number-button");
const body = document.getElementById('js-index-body');


function getNowPage(){
    const locationData = location.search;
    let pageDataArray = locationData.split("=");
    let nowPage = pageDataArray[1];
    return nowPage;
}

function printSelectedPage(nowPage){
    pageNumber[nowPage-1].classList.add('page-number-selected-color');
}


function init(){
    printSelectedPage(getNowPage());
}

init();
// location.search