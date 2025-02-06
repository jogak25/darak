let currentPage = 1;
let gameList = [];
function loadgame() {
    console.log('start');
    fetch('./bgg_top_games.json')
    .then(response => response.json())
    .then(gameData => {
        gameList = gameData;
        let cardCount = 0;
        let startIndex = (currentPage - 1) * 10;
        let endIndex = startIndex + 10;
        let gamesToDisplay = gameData.slice(startIndex, endIndex);
        for (let i=0; i<gamesToDisplay.length; i++) {

            if (cardCount >= 20) {


                console.log("카드 생성이 20개를 초과하여 중단됩니다.");
                break;
            }
            createCards(gamesToDisplay[i]);
            cardCount++;
        }
        const maxPageSize = gameList.length/10;
        calcPage(1,maxPageSize);
    })
    .catch(error => console.error('Error fetching the file:', error));

}


// document.getElementById('fileInput').addEventListener('change', function(event) {
//     let test = document.querySelector('#test')
//     const file = event.target.files[0];
//     test.innerText = '1'
//     if (file) {
//         test.innerText = '2'
//         const reader = new FileReader();
//         reader.onload = function(e) {
//             test.innerText = '2'
//             const gameData = JSON.parse(e.target.result);
//             gameList = gameData;
//             let cardCount = 0;
//             let startIndex = (currentPage - 1) * 10;
//             let endIndex = startIndex + 10;
//             let gamesToDisplay = gameData.slice(startIndex, endIndex);
            
//             for (let i=0; i<gamesToDisplay.length; i++) {
    
//                 if (cardCount >= 20) {
    
//                     alert("카드 생성이 20개를 초과하여 중단됩니다.")
//                     // console.log("카드 생성이 20개를 초과하여 중단됩니다.");
//                     break;
//                 }
//                 createCards(gamesToDisplay[i]);
//                 cardCount++;
//             }
//             //const maxPageSize = gameList.length/10;
//             //calcPage(1,maxPageSize);
//         };
//         reader.readAsText(file);
//     }
// });

function filterBoardgame(e){
    
}


function loadGameList(gameList) {
    const cardContainer = document.getElementById('gameCardContainer');
    cardContainer.innerHTML='';
    console.log(gameList)
    for (let i=0; i<gameList.length; i++) {    
        createCards(gameList[i]);
      
    }

}
function cratePageBtn(num) {
    const cardContainer = document.getElementById('pageContainer');
    
    const pageBtn = document.createElement('button');
    pageBtn.className = "pageBtn";
    pageBtn.value = num;
    pageBtn.innerText = num;
    pageBtn.onclick=loadGamePage;
    cardContainer.appendChild(pageBtn);
}
function calcPage(startPage, maxPage) {  
    console.log(startPage,maxPage)
    for(i =startPage;i<maxPage;i++){
        console.log(i,startPage)
        if(i>(Number(startPage)+4)) {
            if(i!=maxPage) {
                cratePageBtn(maxPage);
            }
            break;
        }
        cratePageBtn(i);
    }
    
}
function loadGamePage(e){
    console.log(e.target.value);

    const pageContainer = document.getElementById('pageContainer');
    let startPage = e.target.value;
    pageContainer.innerHTML = '';
    console.log(startPage,gameList.length)
    let list = gameList.slice((startPage-1)*10,startPage*10)
    console.log(list)
    loadGameList(list)
    if(startPage<3) {
        startPage = 1;
    }else {
        startPage = startPage -2;
    }
    calcPage(startPage,gameList.length/10);
    
    // cratePageBtn
}


// // JSON 데이터를 카드로 추가하는 함수

function createCards(gameData) {
    const cardContainer = document.getElementById('gameCardContainer');

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <div class="topInfo">
          <img src="${gameData.imgsrc}" class="image"></src>
          <div>
            <div class="title">${gameData.name}</div>
            <div>
            <span class="tag">R: ${gameData.rank}</span>
            <span class="tag">W: ${gameData.weight}</span>
            <span class="tag">Best: ${gameData.bestPlayers}</span>
            <span class="tag">추천: ${gameData.recommendedPlayers}</span>
            </div>
            <p class="info"><strong>Mechanisms:</strong> ${gameData.mechanisms}</p>
        <p class="info"><strong>Types:</strong> ${gameData.types}</p>
        <p class="info"><strong>Link:</strong> <a href="${gameData.link}" target="_blank">BoardGameGeek</a></p>
          </div>
        </div>                 
        `;
    cardContainer.appendChild(card);
}
console.log('begin');
loadgame();
