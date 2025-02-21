let currentPage = 1;
let gameList = [];
let currentList = [];
function loadgame() {
    console.log('start');
    fetch('./bgg_top_games.json')
    .then(response => response.json())
    .then(gameData => {
        gameList = gameData;
        currentList = gameData;
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

function filterByBestPlayers(games, input) {
      // 유효성 검사: 숫자 또는 "X-Y" 형식만 허용
      if (!/^\d+(-\d+)?$/.test(input)) {
        document.querySelector('.log').innerText = "❌ 올바른 형식이 아닙니다. 숫자 또는 'X-Y' 형식만 입력하세요.";
        return [];
    }
    
    const inputRange = input.includes("-") ? input.split("-").map(Number) : [Number(input), Number(input)];
    
    return games.filter(game => {
        const bestPlayers = game.bestPlayers.trim(); // 공백 제거

        if (bestPlayers.includes("–")) { // 범위 값 처리
            const [min, max] = bestPlayers.split("–").map(Number);
            return !(max < inputRange[0] || min > inputRange[1]); // 범위가 겹치는 경우
        }
        return inputRange.includes(Number(bestPlayers)); // 단일 숫자 비교
    });
}
function filterByCommunityPlayers(games, input) {
    // 유효성 검사: 숫자 또는 "X-Y" 형식만 허용
    if (!/^\d+(-\d+)?$/.test(input)) {
      document.querySelector('.log').innerText = "❌ 올바른 형식이 아닙니다. 숫자 또는 'X-Y' 형식만 입력하세요.";
      return [];
  }
  
  const inputRange = input.includes("-") ? input.split("-").map(Number) : [Number(input), Number(input)];
  
  return games.filter(game => {
      const recommendedPlayers = game.recommendedPlayers.trim(); // 공백 제거

      if (recommendedPlayers.includes("–")) { // 범위 값 처리
          const [min, max] = recommendedPlayers.split("–").map(Number);
          return !(max < inputRange[0] || min > inputRange[1]); // 범위가 겹치는 경우
      }
      return inputRange.includes(Number(recommendedPlayers)); // 단일 숫자 비교
  });
}
function filterByWeight(games, input) {
    // 유효성 검사: 숫자 또는 "X-Y" 형식만 허용
    if (!/^\d+(\.\d+)?(-\d+(\.\d+)?)?$/.test(input)) {
        console.error("❌ 올바른 형식이 아닙니다. 숫자 또는 'X-Y' 형식만 입력하세요.");
        return [];
    }

    let minWeight, maxWeight;

    if (input.includes("-")) { // 범위 입력 처리 (예: "2-3")
        [minWeight, maxWeight] = input.split("-").map(Number);
    } else { // 단일 숫자 입력 처리 (예: "3")
        minWeight = 0;
        maxWeight = Number(input);
    }

    return games.filter(game => {
        const weight = parseFloat(game.weight); // weight 값을 숫자로 변환
        return weight >= minWeight && weight <= maxWeight;
    });
}
function loadData(database) {
    let buf=[];
    if(database== 'own') {
        gameList.forEach((game)=>{
            if (game.owns=='1') {
                buf.push(game);                
            }
        })
    }else if(database == 'all') {
        gameList.forEach((game)=>{
            
            buf.push(game);
                
            
        })
    }
    currentList = buf;
    console.log(buf);
    loadGameList(buf);
}
function filterBoardgame(e){
    let value = document.querySelector("#searchBox").value;
    let type =  document.querySelector(".searchOption").value;
    let buf=[];
    if(type== 'title') {
        gameList.forEach((game)=>{
            if (game.name.toLowerCase().includes(value.toLowerCase())) {
                buf.push(game);
                
            }
        })
    }else if(type == 'best') {
        buf = filterByBestPlayers(gameList,value);
        if(buf.length == 0) {
            return;
        }
    }else if(type == 'community') {
        buf = filterByCommunityPlayers(gameList,value);
        if(buf.length == 0) {
            return;
        }
    }else if(type=='weight'){
        buf = filterByWeight(gameList,value);
        if(buf.length == 0) {
            return;
        }
    }
    currentList = buf;
    console.log(buf);
    loadGameList(buf);

    const maxPageSize = buf.length/10;
    calcPage(1,maxPageSize);
    closePopup();
}



function loadGameList(gameList) {
    const cardContainer = document.getElementById('gameCardContainer');
    cardContainer.innerHTML='';
    console.log(gameList)
    for (let i=0; i<gameList.length; i++) {    
        createCards(gameList[i]);
      
    }

}
function cratePageBtn(pageNumber, currentPage) {
    console.log(pageNumber,currentPage);
    const pageContainer = document.getElementById('pageContainer');
    let btn = document.createElement("button");
    btn.innerText = pageNumber;
    btn.value = pageNumber;

    // 기본 스타일 적용
    btn.style.margin = "2px";
    // btn.style.padding = "8px 12px";
    btn.style.border = "1px solid #ddd";
    btn.style.borderRadius = "5px";
    btn.style.cursor = "pointer";
    btn.style.backgroundColor = pageNumber == currentPage ? "#007bff" : "#f8f9fa"; // 선택된 페이지는 파란색
    btn.style.color = pageNumber == currentPage ? "#fff" : "#000"; // 글씨 색상 변경

    btn.addEventListener("click", loadGamePage);
    pageContainer.appendChild(btn);
}

function calcPage(startPage, maxPage, currentPage) {  
    console.log(startPage, maxPage,currentPage);

    const pageContainer = document.getElementById('pageContainer');
    pageContainer.innerHTML = ''; // 기존 버튼 삭제 후 다시 생성

    // 항상 페이지 1 버튼 생성
    cratePageBtn(1, currentPage);

    for (let i = startPage; i < maxPage; i++) {
        // console.log(i, startPage);
        
        if (i > (Number(startPage) + 4)) { // 최대 5개까지만 표시
            if (i != maxPage) {
                cratePageBtn(maxPage, currentPage);
            }
            break;
        }
        
        if (i !== 1) { // 페이지 1은 이미 생성했으므로 제외
            cratePageBtn(i, currentPage);
        }
    }
}



function loadGamePage(e) {
    console.log(e.target.value);

    const pageContainer = document.getElementById('pageContainer');
    let startPage = Number(e.target.value);
    pageContainer.innerHTML = '';

    console.log(startPage, gameList.length);
    
    let list = currentList.slice((startPage - 1) * 10, startPage * 10);
    console.log(list);
    
    loadGameList(list);

    // startPage 조정 (3 이하일 경우 1로 설정)
    currentP = startPage;
    startPage = startPage < 3 ? 1 : startPage - 2;

    calcPage(startPage, Math.ceil(currentList.length / 10), currentP);
}
// // JSON 데이터를 카드로 추가하는 함수
function loadGameData(gameData){
    openDetail(gameData);
}
function createCards(gameData) {
    const cardContainer = document.getElementById('gameCardContainer');

    const card = document.createElement('button');
    card.className = 'card';
    card.onclick = ()=>loadGameData(gameData);
    card.innerHTML = `
        <div class="topInfo">     
            <img src="${gameData.imgsrc}" class="image"></src>
            <div class="shortInfo-top">
                <span class="rank">No. ${gameData.rank}</span>
                <span class="title">${gameData.name}</span>     
                <span class="material-symbols-outlined">
                ${gameData.owns === '1' ? '<span class="material-symbols-outlined owns">book_2</span>' : ''}
            </div>
       
            </div>
            <div class="shortInfo-btm">
                <span class="tag">W: ${gameData.weight}</span>
                <span class="tag">Best: ${gameData.bestPlayers}</span>
                <span class="tag">추천: ${gameData.recommendedPlayers}</span>
            </div>            
        </div>                 
        `;
    cardContainer.appendChild(card);
}

// 팝업 열기
function openPopup() {
    document.getElementById("popup").style.display = "block";
    document.getElementById("overlay").style.display = "block";
}

// 팝업 닫기
function closePopup() {
    document.getElementById("popup").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}
function openDetail(data) {
    document.getElementById("gameDetail").style.display = "block";
    document.querySelector(".title-image").src=data.imgsrc;
    document.querySelector("#detail-rank").innerText=data.rank;
    document.querySelector("#detail-title").innerText=data.name;
    document.querySelector("#detail-player").innerText = data.minPlayer + "-"+data.maxPlayer;
    document.querySelector("#detail-time").innerHTML = data.minplayTime+"-"+ data.maxplayTime;
    document.querySelector("#detail-community").innerHTML = data.recommendedPlayers;
    document.querySelector("#detail-best").innerHTML = data.bestPlayers;
    document.querySelector("#detail-weight").innerHTML = data.weight;
    if(data.owns ==1) {
        document.querySelector("#own").classList.remove('disable');
    }else{
        document.querySelector("#own").classList.add('disable');
    }
    
    console.log(data);
}
function closeDetail() {
    document.getElementById("gameDetail").style.display = "none";
    
}

console.log('begin');
loadgame();
