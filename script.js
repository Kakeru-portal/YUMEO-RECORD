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
       const songYear = song.dataset.date.substring(0, 4);
       const yearMatch =
           selectedYears.length === 0 ||
           selectedYears.includes(songYear);
       const songText = song.textContent.toLowerCase();
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
   /* 検索・フィルター */
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

   /* ミニプレイヤー */
   const miniPlayer =
       document.getElementById('miniPlayer');
   const miniPlayerTitle =
       document.getElementById('miniPlayerTitle');
   const playPauseButton =
       document.getElementById('playPauseButton');
   let currentSong = null;
   let isPlaying = false;

   /* 曲を再生する */
   function playSong(song) {
       const title =
           song.querySelector('h3').textContent.trim();
       const playButton =
           song.querySelector('.play-button');
       const videoId =
           playButton.dataset.video;
       const startTime =
           playButton.dataset.start || 0;

       currentSong = song;
       miniPlayerTitle.textContent = title;
       isPlaying = true;
       playPauseButton.textContent = '⏸';

       let player =
           document.getElementById('youtubePlayer');

       if (!player) {
           player =
               document.createElement('iframe');
player.id = 'youtubePlayer';
           player.width = '1';
           player.height = '1';
           player.frameBorder = '0';
           player.allow =
               'autoplay; encrypted-media';
           player.allowFullscreen = true;
           miniPlayer.appendChild(player);
       }

       player.src =
           'https://www.youtube.com/embed/' +
           videoId +
           '?autoplay=1&start=' +
           startTime +
           '&enablejsapi=1';
   }

   /* 曲カードの再生ボタン */
   document
       .querySelectorAll('.play-button')
       .forEach(button => {
           button.addEventListener('click', function () {
               const song =
                   this.closest('.song');
               playSong(song);
           });
       });

   /* 再生 / 一時停止 */
   playPauseButton.addEventListener(
       'click',
       function () {
           const player =
               document.getElementById('youtubePlayer');

           if (!player || !currentSong) {
               return;
           }

           if (isPlaying) {
               player.contentWindow.postMessage(
                   JSON.stringify({
                       event: 'command',
                       func: 'pauseVideo',
                       args: []
                   }),
                   '*'
               );
               isPlaying = false;
               playPauseButton.textContent = '▶';
           } else {
               player.contentWindow.postMessage(
                   JSON.stringify({
                       event: 'command',
                       func: 'playVideo',
                       args: []
                   }),
                   '*'
               );
               isPlaying = true;
               playPauseButton.textContent = '⏸';
           }
       }
   );
});
alert('JavaScriptは動いています！');
