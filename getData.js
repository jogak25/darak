async function fetchTopGames() {

  const gameIds = [];
  const totalGames = 1000; // 가져올 게임 개수
  const delay = 2500; // API 요청 간 딜레이 (1.5초)
  
  document.getElementById("status").innerText = "게임 목록 불러오는 중...";
  
  // 🔹 1. 인기 게임 목록 가져오기 (1000위까지)
  // try {
  //     let response = await fetch(BGG_RANK_API);
  //     let text = await response.text();
  //     let parser = new DOMParser();
  //     let xmlDoc = parser.parseFromString(text, "text/xml");
  //     let items = xmlDoc.querySelectorAll("item");

  //     items.forEach((item, index) => {
  //         if (index < totalGames) {
  //             gameIds.push(item.getAttribute("id"));
  //         }
  //     });

  //     console.log("📌 가져온 게임 ID 목록:", gameIds);
  // } catch (error) {
  //     console.error("❌ 게임 목록 불러오기 실패:", error);
  //     return;
  // }

  document.getElementById("status").innerText = "게임 데이터 가져오는 중...";
  

   let startRank =  1;
    let endRank =  1000;
    let startPage = 1;
    let endPage = 10;

    games = [];
  

    for (let page = startPage; page <= endPage; page++) {
        let url = `https://boardgamegeek.com/browse/boardgame/page/${page}`;
        let response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
        let data = await response.json();
        let parser = new DOMParser();
        let doc = parser.parseFromString(data.contents, "text/html");
        console.log(games)
        let rows = doc.querySelectorAll(".collection_table tr");
        rows.forEach(row => {
            let rankCell = row.querySelector(".collection_rank");
            let titleCell = row.querySelector(".primary") || row.querySelector("td");

            if (rankCell && titleCell) {
                let rank = parseInt(rankCell.innerText.trim());
                if (rank >= startRank && rank <= endRank) { // ✅ 오타 수정: svtartRank → startRank
                    let name = titleCell.innerText.trim();
                    let linkTag = row.querySelector("a.primary"); // 🔹 <a class="primary"> 찾기
                    if (!linkTag) {
                        console.log("No linkTag found in:", row.innerHTML); // 🔹 디버깅용 로그 추가
                    } else {
                        let idMatch = linkTag.href.match(/\/boardgame\/(\d+)\//);
                        if (idMatch && idMatch[1]) {
                            games.push(idMatch[1]);
                        }
                    }
                }
            }
        });
    }
    // console.log(games)
  let gamesData = [];

  // 🔹 2. 개별 게임 데이터 가져오기 (순차 요청)
  for (let i = 0; i < games.length; i++) {
      let game = await fetchGameDetails(games[i]);
      if (game) {
          gamesData.push(game);
          updateProgress(i + 1, totalGames, game.name);
      }else if(game == null){
        console.log(games[i],game)
        i--;
      }
      await new Promise(resolve => setTimeout(resolve, delay)); // 1.5초 딜레이
  }

  // // // 🔹 3. JSON 파일로 저장
  downloadJSON(gamesData, "bgg_top_games.json");
  document.getElementById("status").innerText = "✅ 데이터 수집 완료!";
}

// 🔹 개별 게임 정보 가져오기
async function fetchGameDetails(gameId) {
  const GAME_API = `https://boardgamegeek.com/xmlapi2/thing?id=${gameId}&stats=1`;
  const PROXY_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(GAME_API)}`;

  try {
      let response = await fetch(PROXY_URL);
      let data = await response.json();
      let parser = new DOMParser();
      let xmlDoc = parser.parseFromString(data.contents, "text/xml");
      console.log(xmlDoc)
      
      let name = xmlDoc.querySelector("name[type='primary']").getAttribute("value");
      let imgsrc = xmlDoc.querySelector("image").innerHTML|| "N/A";
      let weight = xmlDoc.querySelector("statistics ratings averageweight")?.getAttribute("value") || "N/A";
      let rank = xmlDoc.querySelector("statistics ratings ranks rank")?.getAttribute("value") || "N/A";
      let bestPlayers = xmlDoc.querySelector("poll-summary[name='suggested_numplayers'] result[name='bestwith']")?.getAttribute("value").split('Best with')[1].split('players')[0] || "N/A";
      let recommendedPlayers = xmlDoc.querySelector("poll-summary[name='suggested_numplayers'] result[name='recommmendedwith']")?.getAttribute("value").split('Recommended with')[1].split('players')[0] || "N/A";
      let mechanisms = [...xmlDoc.querySelectorAll("link[type='boardgamemechanic']")].map(el => el.getAttribute("value")).join(", ") || "N/A";
      let types = [...xmlDoc.querySelectorAll("link[type='boardgamecategory']")].map(el => el.getAttribute("value")).join(", ") || "N/A";
      console.log(imgsrc)
      
      return {
          ID : gameId,
          imgsrc,
          rank,
          name,
          weight: parseFloat(weight).toFixed(2),
          bestPlayers,
          recommendedPlayers,
          mechanisms,
          types,
          link: `https://boardgamegeek.com/boardgame/${gameId}`
      };
  } catch (error) {
      console.error(`❌ ${gameId} 데이터 가져오기 실패:`, error);
      return null;
  }
}

// 🔹 진행 상태 업데이트
function updateProgress(current, total, gameName) {
  let progress = Math.round((current / total) * 100);
  document.getElementById("progress-bar").value = progress;
  // document.getElementById("progress-bar").innerText = progress + "%";
  document.getElementById("status").innerText = `진행 상황: ${current}/${total} - ${gameName}`;
}

// 🔹 JSON 파일로 저장
function downloadJSON(data, filename) {
  let jsonData = JSON.stringify(data, null, 2);
  let blob = new Blob([jsonData], { type: "application/json" });
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
