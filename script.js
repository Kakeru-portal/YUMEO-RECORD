function filterSongs() {
   const selectedCounts = Array.from(
       document.querySelectorAll('input[name="memberCount"]:checked')
   ).map(item => item.value);
   const selectedTypes = Array.from(
       document.querySelectorAll('input[name="songType"]:checked')
   ).map(item => item.value);
   const selectedUnits = Array.from(
       document.querySelectorAll('input[name="unit"]:checked')
   ).map(item => item.value);
   const selectedYears = Array.from(
       document.querySelectorAll('input[name="year"]:checked')
   ).map(item => item.value);
   const searchText = document
       .getElementById('songSearch')
       .value
       .toLowerCase()
       .trim();
   document.querySelectorAll('.song').forEach(song => {
       const countMatch =
           selectedCounts.length === 0 ||
           selectedCounts.includes(song.dataset.count);
       const typeMatch =
           selectedTypes.length === 0 ||
           selectedTypes.includes(song.dataset.type);
       const unitMatch =
           selectedUnits.length === 0 ||
           selectedUnits.includes(song.dataset.unit);
       const songYear =
           song.dataset.date.substring(0, 4);
       const yearMatch =
           selectedYears.length === 0 ||
           selectedYears.includes(songYear);
       const songText =
           song.textContent.toLowerCase();
       const textMatch =
           searchText === '' ||
           songText.includes(searchText);
       song.style.display =
           countMatch &&
           typeMatch &&
           unitMatch &&
           yearMatch &&
           textMatch
               ? ''
               : 'none';
   });
}

document.addEventListener('DOMContentLoaded', () => {
   /* =========================
      検索・フィルター
      ========================= */
   document.querySelectorAll(
       'input[name="memberCount"], ' +
       'input[name="songType"], ' +
       'input[name="unit"], ' +
       'input[name="year"]'
   ).forEach(checkbox => {
       checkbox.addEventListener('change', filterSongs);
   });
   document
       .getElementById('searchButton')
       .addEventListener('click', filterSongs);

   /* =========================
      ミニプレイヤー
      ========================= */
   const miniPlayer =
       document.getElementById('miniPlayer');
   const miniPlayerTitle =
       document.getElementById('miniPlayerTitle');
   const miniPlayerImage =
       document.getElementById('miniPlayerImage');
   const playPauseButton =
       document.getElementById('playPauseButton');
   const previousButton =
       document.getElementById('previousButton');
   const nextButton =
       document.getElementById('nextButton');

   let currentSong = null;
   let currentVideoId = null;
   let isPlaying = false;

   /* =========================
      ポップアップを作成
      ========================= */
   const popup =
       document.createElement('div');
popup.id = 'musicPopup';
   popup.innerHTML = `
<div id="musicPopupOverlay"></div>
<div id="musicPopupContent">
<button
               type="button"
               id="musicPopupClose">
               ×
</button>
<div id="popupVideoContainer"></div>
<div id="popupSongTitle"></div>
<div id="popupControls">
<button
                   type="button"
                   id="popupPlayPause">
                   ⏸️
</button>
</div>
<div id="popupActions">
<button
                   type="button"
                   id="popupFavorite">
                   ♡ お気に入り登録
</button>
<a
                   id="popupOriginal"
                   href="#"
                   target="_blank"
                   rel="noopener">
                   ↗ 元動画を見る
</a>
</div>
</div>
   `;
   document.body.appendChild(popup);

   /* =========================
      ポップアップ用YouTube iframe
      ========================= */
   let popupPlayer = null;

   function createYouTubePlayer(videoId, startTime) {
       const container =
           document.getElementById('popupVideoContainer');
       container.innerHTML = '';
       const iframe =
           document.createElement('iframe');
iframe.id = 'popupYouTubePlayer';
       iframe.width = '100%';
       iframe.height = '100%';
       iframe.frameBorder = '0';
       iframe.allow =
           'autoplay; encrypted-media; picture-in-picture';
       iframe.allowFullscreen = true;
       iframe.src =
           'https://www.youtube.com/embed/' +
           videoId +
           '?autoplay=1' +
           '&start=' +
           startTime +
           '&enablejsapi=1' +
           '&playsinline=1';
       container.appendChild(iframe);
       popupPlayer = iframe;

       /*
        * iframeの読み込みが終わってから
        * 再生命令を送る
        */
       iframe.addEventListener('load', () => {
           iframe.contentWindow.postMessage(
               JSON.stringify({
                   event: 'command',
                   func: 'playVideo',
                   args: []
               }),
               '*'
           );
       });
   }

   /* =========================
      曲を再生
      ========================= */
   function playSong(song) {
       const playButton =
           song.querySelector('.play-button');
       if (!playButton) {
           return;
       }
       const title =
           song.querySelector('h3')
               .textContent
               .trim();
       const videoId =
           playButton.dataset.video;
       const startTime =
           Number(playButton.dataset.start || 0);

       currentSong = song;
       currentVideoId = videoId;

       /* ミニプレイヤーの曲名 */
       miniPlayerTitle.textContent =
           title;

       /* YouTubeサムネイル */
       miniPlayerImage.src =
           'https://img.youtube.com/vi/' +
           videoId +
           '/hqdefault.jpg';
       miniPlayerImage.alt =
           title;

       /* ポップアップの曲名 */
       document.getElementById(
           'popupSongTitle'
       ).textContent = title;

       /* 元動画リンク */
       document.getElementById(
           'popupOriginal'
       ).href =
           'https://www.youtube.com/watch?v=' +
           videoId;

       /* ポップアップを表示 */
       popup.classList.add('active');

       /* YouTubeを読み込む */
       createYouTubePlayer(
           videoId,
           startTime
       );

       isPlaying = true;
       playPauseButton.textContent =
           '⏸️';
   }

   /* =========================
      曲カードの再生ボタン
      ========================= */
   document.querySelectorAll(
       '.play-button'
   ).forEach(button => {
       button.addEventListener(
           'click',
           function () {
               const song =
                   this.closest('.song');
               playSong(song);
           }
       );
   });

   /* =========================
      ミニプレイヤーの
      再生 / 一時停止
      ========================= */
   playPauseButton.addEventListener(
       'click',
       () => {
           if (!popupPlayer) {
               return;
           }

           if (isPlaying) {
               popupPlayer.contentWindow.postMessage(
                   JSON.stringify({
                       event: 'command',
                       func: 'pauseVideo',
                       args: []
                   }),
                   '*'
               );
               isPlaying = false;
               playPauseButton.textContent =
                   '▶️';
           } else {
               popupPlayer.contentWindow.postMessage(
                   JSON.stringify({
                       event: 'command',
                       func: 'playVideo',
                       args: []
                   }),
                   '*'
               );
               isPlaying = true;
               playPauseButton.textContent =
                   '⏸️';
           }
       }
   );

   /* =========================
      ポップアップの
      再生 / 一時停止
      ========================= */
   document.getElementById(
       'popupPlayPause'
   ).addEventListener(
       'click',
       () => {
           playPauseButton.click();
       }
   );

   /* =========================
      ポップアップを閉じる
      ========================= */
   document.getElementById(
       'musicPopupClose'
   ).addEventListener(
       'click',
       () => {
           popup.classList.remove(
               'active'
           );
       }
   );

   document.getElementById(
       'musicPopupOverlay'
   ).addEventListener(
       'click',
       () => {
           popup.classList.remove(
               'active'
           );
       }
   );

   /* =========================
      ミニプレイヤーをクリックして
      ポップアップを再表示
      ========================= */
   miniPlayer.addEventListener(
       'click',
       event => {
           /*
            * ボタンを押した場合は
            * ポップアップを開かない
            */
           if (
               event.target.closest('button')
           ) {
               return;
           }
           if (!currentSong) {
               return;
           }
           popup.classList.add(
               'active'
           );
       }
   );

   /* =========================
      前の曲
      ========================= */
   previousButton.addEventListener(
       'click',
       () => {
           if (!currentSong) {
               return;
           }
           const songs =
               Array.from(
                   document.querySelectorAll(
                       '.song'
                   )
               ).filter(song =>
                   song.style.display !== 'none'
               );
           const index =
               songs.indexOf(currentSong);
           if (index > 0) {
               playSong(
                   songs[index - 1]
               );
           }
       }
   );

   /* =========================
      次の曲
      ========================= */
   nextButton.addEventListener(
       'click',
       () => {
           if (!currentSong) {
               return;
           }
           const songs =
               Array.from(
                   document.querySelectorAll(
                       '.song'
                   )
               ).filter(song =>
                   song.style.display !== 'none'
               );
           const index =
               songs.indexOf(currentSong);
           if (
               index >= 0 &&
               index < songs.length - 1
           ) {
               playSong(
                   songs[index + 1]
               );
           }
       }
   );
});
