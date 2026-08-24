/* =========================

   検索・フィルター

   ========================= */
function filterSongs() {
   const selectedCounts = Array.from(document.querySelectorAll('input[name="memberCount"]:checked')).map(item => item.value);
   const selectedTypes = Array.from(document.querySelectorAll('input[name="songType"]:checked')).map(item => item.value);
   const selectedUnits = Array.from(document.querySelectorAll('input[name="unit"]:checked')).map(item => item.value);
   const selectedYears = Array.from(document.querySelectorAll('input[name="year"]:checked')).map(item => item.value);
   const searchText = document.getElementById('songSearch').value.toLowerCase().trim();
   document.querySelectorAll('.song').forEach(song => {
       const countMatch = selectedCounts.length === 0 || selectedCounts.includes(song.dataset.count);
       const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(song.dataset.type);
       const unitMatch = selectedUnits.length === 0 || selectedUnits.includes(song.dataset.unit);
       const songYear = song.dataset.date.substring(0, 4);
       const yearMatch = selectedYears.length === 0 || selectedYears.includes(songYear);
       const songText = song.textContent.toLowerCase();
       const textMatch = searchText === '' || songText.includes(searchText);
       song.style.display = countMatch && typeMatch && unitMatch && yearMatch && textMatch ? '' : 'none';
   });
   const allSongs = document.querySelectorAll('.song');
const visibleSongs = Array.from(allSongs).filter(song => song.style.display !== 'none');
const resultCount = document.getElementById('searchResultCount');
if (resultCount) {
  resultCount.textContent = `全${allSongs.length}曲中 ${visibleSongs.length}曲ヒットしました`;
}
   const searchEmptyMessage = document.getElementById('searchEmptyMessage');
const favoriteEmptyMessage = document.getElementById('favoriteEmptyMessage');
if (searchEmptyMessage) {
   searchEmptyMessage.style.display =
       visibleSongs.length === 0 ? 'block' : 'none';
}
if (favoriteEmptyMessage) {
   favoriteEmptyMessage.style.display = 'none';
}
}
let youtubePlayer = null;
let currentSong = null;
let youtubeReady = false;
let loopMode = 0;
// 0 = OFF
// 1 = 1曲リピート
// 2 = 全体リピート
let shuffleMode = false;
// false = OFF
// true = ON
window.onYouTubeIframeAPIReady = function() {
   youtubeReady = true;
};
function prepareYouTubePlayer() {
  if (!youtubeReady || typeof YT === 'undefined') {
      setTimeout(prepareYouTubePlayer, 100);
      return;
  }
  if (youtubePlayer) return;
  youtubePlayer = new YT.Player('youtubePlayer', {
      width: '100%',
      height: '100%',
      playerVars: {
          playsinline: 1,
          rel: 0
      },
      events: {
          onReady: event => {
              event.target.pauseVideo();
          },
          onStateChange: event => {
              updatePlayButtons(event.data);
              if (event.data === YT.PlayerState.PLAYING) {
                  updateSeekBar();
              }
          }
      }
  });
}
document.addEventListener('DOMContentLoaded', () => {
   document.querySelectorAll(
       'input[name="memberCount"], input[name="songType"], input[name="unit"], input[name="year"]'
   ).forEach(checkbox => {
       checkbox.addEventListener('change', filterSongs);
   });
   const searchButton = document.getElementById('searchButton');
   if (searchButton) {
       searchButton.addEventListener('click', filterSongs);
   }
   const searchToggle = document.getElementById('searchToggle');
const searchArea = document.querySelector('.search-area');
const searchToggleIcon = document.getElementById('searchToggleIcon');
if (searchToggle && searchArea && searchToggleIcon) {
  searchToggle.addEventListener('click', () => {
     searchArea.classList.toggle('open');
     if (searchArea.classList.contains('open')) {
        searchToggleIcon.textContent = '−';
     } else {
        searchToggleIcon.textContent = '＋';
     }
  });
}
   const miniPlayer = document.getElementById('miniPlayer');
   const miniPlayerTitle = document.getElementById('miniPlayerTitle');
   const miniPlayerImage = document.getElementById('miniPlayerImage');
   const playPauseButton = document.getElementById('playPauseButton');
   const previousButton = document.getElementById('previousButton');
   const nextButton = document.getElementById('nextButton');
   const popup = document.createElement('div');
popup.id = 'musicPopup';
   popup.innerHTML = `
<div id="musicPopupOverlay"></div>
<div id="musicPopupContent">
<div id="popupVideoContainer">
<div id="youtubePlayer"></div>
</div>
<div id="popupSongTitle"></div>
<div id="popupSeekArea">
<span id="popupCurrentTime">0:00</span>
<input
       type="range"
       id="popupSeekBar"
       min="0"
       max="100"
       value="0"
       step="0.1"
>
<span id="popupDuration">0:00</span>
</div>
<div id="popupControls">
<button type="button" id="popupLoop" aria-label="ループ再生">🔁</button>
<button type="button" id="popupPrevious" aria-label="前の曲">⏮️</button>
<button type="button" id="popupPlayPause" aria-label="再生">▶️</button>
<button type="button" id="popupNext" aria-label="次の曲">⏭️</button>
<button type="button" id="popupShuffle" aria-label="シャッフル再生">🔀</button>
</div>
<div id="popupActions">
<button type="button" id="popupFavorite">♡ お気に入り登録</button>
<a id="popupOriginal" href="#" target="_blank" rel="noopener">↗ 元動画を見る</a>
<button type="button" id="musicPopupClose">× 閉じる</button>
</div>
</div>
   `;
   document.body.appendChild(popup);
   const popupSongTitle = document.getElementById('popupSongTitle');
const popupSongYear = document.createElement('div');
const popupOriginalArtist = document.createElement('div');
const popupSinger = document.createElement('div');
popupSongYear.id = 'popupSongYear';
popupOriginalArtist.id = 'popupOriginalArtist';
popupSinger.id = 'popupSinger';
popupSongTitle.after(
   popupSongYear,
   popupOriginalArtist,
   popupSinger
);
const popupPlayPause = document.getElementById('popupPlayPause');
   const popupLoop = document.getElementById('popupLoop');
   const popupShuffle = document.getElementById('popupShuffle');
   function updateLoopButton() {
   if (!popupLoop) return;
   if (loopMode === 1) {
       popupLoop.textContent = '🔂';
       popupLoop.classList.add('loop-active');
   } else if (loopMode === 2) {
       popupLoop.textContent = '🔁';
       popupLoop.classList.add('loop-active');
   } else {
       popupLoop.textContent = '🔁';
       popupLoop.classList.remove('loop-active');
   }
}
   if (popupLoop) {
   popupLoop.addEventListener('click', event => {
       event.stopPropagation();
       loopMode++;
       if (loopMode > 2) {
           loopMode = 0;
       }
       updateLoopButton();
   });
}
   if (popupShuffle) {
  popupShuffle.addEventListener('click', event => {
      event.stopPropagation();
      shuffleMode = !shuffleMode;
      if (shuffleMode) {
          popupShuffle.classList.add('shuffle-active');
      } else {
          popupShuffle.classList.remove('shuffle-active');
      }
  });
}
   const popupFavorite = document.getElementById('popupFavorite');
function getFavorites() {
   return JSON.parse(localStorage.getItem('favoriteSongs') || '[]');
}
function saveFavorites(favorites) {
   localStorage.setItem('favoriteSongs', JSON.stringify(favorites));
}
   function updateCardFavoriteButton(song) {
  const favoriteButton = song.querySelector('.favorite-button');
  if (!favoriteButton) return;
  const title = song.querySelector('h3').textContent.trim();
  const favorites = getFavorites();
  if (favorites.includes(title)) {
  favoriteButton.textContent = '♥';
  favoriteButton.classList.add('is-favorite');
  favoriteButton.setAttribute('aria-label', '');
} else {
  favoriteButton.textContent = '♡';
  favoriteButton.classList.remove('is-favorite');
  favoriteButton.setAttribute('aria-label', 'お気に入り登録');
}
}
   document.querySelectorAll('.favorite-button').forEach(button => {
  button.addEventListener('click', event => {
     event.stopPropagation();
     const song = button.closest('.song');
     if (!song) return;
     const title = song.querySelector('h3').textContent.trim();
     const favorites = getFavorites();
     if (favorites.includes(title)) {
        const updatedFavorites = favorites.filter(item => item !== title);
        saveFavorites(updatedFavorites);
     } else {
        favorites.push(title);
        saveFavorites(favorites);
     }
     updateCardFavoriteButton(song);
     if (currentSong === song) {
  updateFavoriteButton(song);
}
  });
});
   function updateFavoriteButton(song) {
  if (!popupFavorite || !song) return;
  const title = song.querySelector('h3').textContent.trim();
  const favorites = getFavorites();
  if (favorites.includes(title)) {
      popupFavorite.textContent = '♥ お気に入り解除';
      popupFavorite.classList.add('is-favorite');
  } else {
      popupFavorite.textContent = '♡ お気に入り登録';
      popupFavorite.classList.remove('is-favorite');
  }
}
popupFavorite.addEventListener('click', event => {
   event.stopPropagation();
   if (!currentSong) return;
   const title = currentSong.querySelector('h3').textContent.trim();
   const favorites = getFavorites();
   if (favorites.includes(title)) {
       const updatedFavorites = favorites.filter(item => item !== title);
       saveFavorites(updatedFavorites);
   } else {
       favorites.push(title);
       saveFavorites(favorites);
   }
   updateFavoriteButton(currentSong);
   updateCardFavoriteButton(currentSong);
});
   function updatePlayButtons(state) {
  if (state === 1) {
      playPauseButton.classList.add('playing');
      popupPlayPause.textContent = '⏸️';
  } else {
      playPauseButton.classList.remove('playing');
      popupPlayPause.textContent = '▶️';
  }
}
   function formatTime(seconds) {
   seconds = Math.floor(seconds || 0);
   const minutes = Math.floor(seconds / 60);
   const remainingSeconds = seconds % 60;
   return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}
function updateSeekBar() {
   if (!youtubePlayer || !currentSong) return;
   const currentPlayButton = currentSong.querySelector('.play-button');
   const startTime = Number(currentPlayButton?.dataset.start || 0);
   const endTime = Number(currentPlayButton?.dataset.end || 0);
   const currentTime = youtubePlayer.getCurrentTime() || 0;
   const seekBar = document.getElementById('popupSeekBar');
   const currentTimeDisplay = document.getElementById('popupCurrentTime');
   const durationDisplay = document.getElementById('popupDuration');
   if (!seekBar || !currentTimeDisplay || !durationDisplay) return;
   // 歌枠など、開始時間と終了時間が指定されている曲
   if (endTime > startTime) {
       const songDuration = endTime - startTime;
       const songCurrentTime = Math.max(0, currentTime - startTime);
       seekBar.min = 0;
       seekBar.max = songDuration;
       seekBar.value = Math.min(songCurrentTime, songDuration);
       currentTimeDisplay.textContent = formatTime(songCurrentTime);
       durationDisplay.textContent = formatTime(songDuration);
       // 曲の終了時間に到達したら停止
       if (currentTime >= endTime) {
   youtubePlayer.pauseVideo();
   handleSongEnded();
   return;
}
   } else {
       // 通常の楽曲
       const duration = youtubePlayer.getDuration() || 0;
       if (duration > 0) {
           seekBar.min = 0;
           seekBar.max = duration;
           seekBar.value = currentTime;
           durationDisplay.textContent = formatTime(duration);
       }
       currentTimeDisplay.textContent = formatTime(currentTime);
   }
   if (youtubePlayer.getPlayerState() === YT.PlayerState.PLAYING) {
       requestAnimationFrame(updateSeekBar);
   }
}
function handleSongEnded() {
   // ① 1曲リピート
   if (loopMode === 1) {
       const currentPlayButton = currentSong?.querySelector('.play-button');
       const startTime = Number(currentPlayButton?.dataset.start || 0);
       youtubePlayer.seekTo(startTime, true);
       youtubePlayer.playVideo();
       return;
   }
   if (!currentSong) return;
   // 現在表示されている楽曲だけを取得
   const songs = Array.from(document.querySelectorAll('.song'))
       .filter(song => song.style.display !== 'none');
   if (songs.length === 0) return;
   // ② シャッフル再生
   if (shuffleMode) {
       let randomSong;
       if (songs.length === 1) {
           randomSong = songs[0];
       } else {
           do {
               const randomIndex = Math.floor(Math.random() * songs.length);
               randomSong = songs[randomIndex];
           } while (randomSong === currentSong);
       }
       playSong(randomSong, false);
       setTimeout(() => {
           if (youtubePlayer) {
               youtubePlayer.playVideo();
           }
       }, 1000);
       return;
   }
   // ③ プレイリスト全体をループ
   if (loopMode === 2) {
       const index = songs.indexOf(currentSong);
       const nextIndex =
           index >= 0 && index < songs.length - 1
               ? index + 1
               : 0;
       playSong(songs[nextIndex], false);
       setTimeout(() => {
           if (youtubePlayer) {
               youtubePlayer.playVideo();
           }
       }, 1000);
       return;
   }
}
function createYouTubePlayer(videoId, startTime) {
   if (!youtubeReady || typeof YT === 'undefined') {
       setTimeout(() => createYouTubePlayer(videoId, startTime), 100);
       return;
   }
   if (youtubePlayer) {
       youtubePlayer.loadVideoById({
           videoId: videoId,
           startSeconds: Number(startTime) || 0
       });
       setTimeout(() => {
           tryPlayYouTube();
       }, 1000);
       return;
   }
   youtubePlayer = new YT.Player('youtubePlayer', {
       width: '100%',
       height: '100%',
       videoId: videoId,
       playerVars: {
           start: Number(startTime) || 0,
           playsinline: 1,
           rel: 0
       },
       events: {
           onReady: event => {
               event.target.playVideo();
               setTimeout(() => {
                   tryPlayYouTube();
               }, 1000);
           },
           onStateChange: event => {
               updatePlayButtons(event.data);
               if (event.data === YT.PlayerState.PLAYING) {
                   updateSeekBar();
               }
               // 動画そのものが終了した場合
               if (event.data === YT.PlayerState.ENDED) {
                   handleSongEnded();
               }
           }
       }
   });
}
   function tryPlayYouTube() {
       if (!youtubePlayer) return;
       const state = youtubePlayer.getPlayerState();
       if (state !== YT.PlayerState.PLAYING) {
           youtubePlayer.playVideo();
       }
   }
   const popupSeekBar = document.getElementById('popupSeekBar');
if (popupSeekBar) {
  popupSeekBar.addEventListener('input', event => {
      event.stopPropagation();
      if (!youtubePlayer || !currentSong) return;
      const currentPlayButton = currentSong.querySelector('.play-button');
      const startTime = Number(currentPlayButton?.dataset.start || 0);
      const endTime = Number(currentPlayButton?.dataset.end || 0);
      if (endTime > startTime) {
          youtubePlayer.seekTo(
              startTime + Number(event.target.value),
              true
          );
      } else {
          youtubePlayer.seekTo(Number(event.target.value), true);
      }
  });
}
   function playSong(song, openPopup = true) {
   const playButton = song.querySelector('.play-button');
   if (!playButton) return;
   const title = song.querySelector('h3').textContent.trim();
   const videoId = playButton.dataset.video;
   const startTime = Number(playButton.dataset.start || 0);
      const endTime = Number(playButton.dataset.end || 0);
   currentSong = song;
   miniPlayerTitle.textContent = title;
   miniPlayerImage.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
   miniPlayerImage.alt = title;
   popupSongTitle.textContent = title;
const songDate = song.dataset.date || '';
const songYear = songDate ? songDate.substring(0, 4) + '年' : '';
const originalArtist = song.querySelector('p:nth-of-type(2)')?.textContent.trim() || '';
const singer = song.querySelector('p:nth-of-type(3)')?.textContent.trim() || '';
popupSongYear.textContent = songYear;
popupOriginalArtist.textContent = originalArtist;
popupSinger.textContent = singer;
updateFavoriteButton(song);
   document.getElementById('popupOriginal').href =
       `https://www.youtube.com/watch?v=${videoId}`;
   if (openPopup) {
  popup.classList.add('active');
}
   updatePlayButtons(-1);
   createYouTubePlayer(videoId, startTime);
}
   document.querySelectorAll('.play-button').forEach(button => {
   button.addEventListener('click', event => {
       event.stopPropagation();
       const song = button.closest('.song');
       playSong(song);
       setTimeout(() => {
           if (youtubePlayer) {
               youtubePlayer.playVideo();
           }
       }, 500);
   });
});
   function togglePlayPause() {
       if (!youtubePlayer) return;
       const state = youtubePlayer.getPlayerState();
       if (state === YT.PlayerState.PLAYING) {
           youtubePlayer.pauseVideo();
       } else {
           youtubePlayer.playVideo();
       }
   }
   playPauseButton.addEventListener('click', event => {
       event.stopPropagation();
       togglePlayPause();
   });
   popupPlayPause.addEventListener('click', event => {
       event.stopPropagation();
       togglePlayPause();
   });
   document.getElementById('popupPrevious').addEventListener('click', event => {
  event.stopPropagation();
  if (!currentSong) return;
  const songs = Array.from(document.querySelectorAll('.song'))
      .filter(song => song.style.display !== 'none');
  const index = songs.indexOf(currentSong);
  if (index > 0) {
      playSong(songs[index - 1], true);
  }
});
document.getElementById('popupNext').addEventListener('click', event => {
  event.stopPropagation();
  if (!currentSong) return;
  const songs = Array.from(document.querySelectorAll('.song'))
      .filter(song => song.style.display !== 'none');
  const index = songs.indexOf(currentSong);
  if (index >= 0 && index < songs.length - 1) {
      playSong(songs[index + 1], true);
  }
});
   previousButton.addEventListener('click', event => {
       event.stopPropagation();
       if (!currentSong) return;
       const songs = Array.from(document.querySelectorAll('.song'))
           .filter(song => song.style.display !== 'none');
       const index = songs.indexOf(currentSong);
       if (index > 0) {
   const wasPopupOpen = popup.classList.contains('active');
   playSong(songs[index - 1], wasPopupOpen);
}
   });
   nextButton.addEventListener('click', event => {
       event.stopPropagation();
       if (!currentSong) return;
       const songs = Array.from(document.querySelectorAll('.song'))
           .filter(song => song.style.display !== 'none');
       const index = songs.indexOf(currentSong);
       if (index >= 0 && index < songs.length - 1) {
   const wasPopupOpen = popup.classList.contains('active');
   playSong(songs[index + 1], wasPopupOpen);
}
   });
   document.getElementById('musicPopupClose').addEventListener('click', () => {
       popup.classList.remove('active');
   });
   document.getElementById('musicPopupOverlay').addEventListener('click', () => {
       popup.classList.remove('active');
   });
   miniPlayer.addEventListener('click', event => {
       if (event.target.closest('button')) return;
       if (!currentSong) return;
       popup.classList.add('active');
   });
   // 曲一覧タブ
const allSongsTab = document.getElementById('allSongsTab');
const favoriteSongsTab = document.getElementById('favoriteSongsTab');
   const pageShuffleButton = document.getElementById('pageShuffleButton');
if (allSongsTab && favoriteSongsTab) {
   allSongsTab.addEventListener('click', () => {
       allSongsTab.classList.add('active');
       favoriteSongsTab.classList.remove('active');
       document.querySelectorAll('.song').forEach(song => {
           song.style.display = '';
       });
       filterSongs();
   });
   favoriteSongsTab.addEventListener('click', () => {
       favoriteSongsTab.classList.add('active');
       allSongsTab.classList.remove('active');
       const favorites = getFavorites();
       document.querySelectorAll('.song').forEach(song => {
           const title = song.querySelector('h3').textContent.trim();
           if (favorites.includes(title)) {
               song.style.display = '';
           } else {
               song.style.display = 'none';
           }
       });
       const allSongs = document.querySelectorAll('.song');
       const visibleSongs = Array.from(allSongs)
           .filter(song => song.style.display !== 'none');
       const resultCount = document.getElementById('searchResultCount');
       if (resultCount) {
           resultCount.textContent =
               `お気に入り ${visibleSongs.length}曲`;
       }
      const favoriteEmptyMessage = document.getElementById('favoriteEmptyMessage');
const searchEmptyMessage = document.getElementById('searchEmptyMessage');
if (favoriteEmptyMessage) {
   favoriteEmptyMessage.style.display =
       visibleSongs.length === 0 ? 'block' : 'none';
}
if (searchEmptyMessage) {
   searchEmptyMessage.style.display = 'none';
}
   });
}
   if (pageShuffleButton) {
 pageShuffleButton.addEventListener('click', event => {
     event.stopPropagation();
     shuffleMode = !shuffleMode;
     if (shuffleMode) {
         pageShuffleButton.classList.add('shuffle-active');
         popupShuffle.classList.add('shuffle-active');
     } else {
         pageShuffleButton.classList.remove('shuffle-active');
         popupShuffle.classList.remove('shuffle-active');
     }
      const visibleSongs = Array.from(document.querySelectorAll('.song'))
          .filter(song => song.style.display !== 'none');
      if (visibleSongs.length === 0) {
          return;
      }
      const randomIndex = Math.floor(Math.random() * visibleSongs.length);
      const randomSong = visibleSongs[randomIndex];
      playSong(randomSong);
     setTimeout(() => {
   tryPlayYouTube();
}, 1500);
  });
}
});
// =========================
// 楽曲データ
// =========================
const songData = [
   {
 title: "この街で生きている",
 count: "1",
 type: "cover",
 date: "2018-10-04",
 unit: "",
 artist: "amazarashi",
 singer: "夢追翔",
 video: "ssh61KTPksk",
 start: 3422,
 end: 3789
},
   {
 title: "僕が死のうと思ったのは",
 count: "1",
 type: "cover",
 date: "2018-10-04",
 unit: "",
 artist: "amazarashi",
 singer: "夢追翔",
 video: "ssh61KTPksk",
 start: 2982,
 end: 3278
}
   ,
{
title: "ナモナキヒト",
count: "1",
type: "cover",
date: "2018-10-04",
unit: "",
artist: "amazarashi",
singer: "夢追翔",
video: "ssh61KTPksk",
start: 2535,
end: 2798
},
{
title: "パーフェクトライフ",
count: "1",
type: "cover",
date: "2018-10-04",
unit: "",
artist: "amazarashi",
singer: "夢追翔",
video: "ssh61KTPksk",
start: 2080,
end: 2318
},
{
title: "ジュブナイル",
count: "1",
type: "cover",
date: "2018-10-04",
unit: "",
artist: "amazarashi",
singer: "夢追翔",
video: "ssh61KTPksk",
start: 1713,
end: 1929
},
{
title: "スターライト",
count: "1",
type: "cover",
date: "2018-10-04",
unit: "",
artist: "amazarashi",
singer: "夢追翔",
video: "ssh61KTPksk",
start: 1278,
end: 1520
},
{
title: "名前",
count: "1",
type: "cover",
date: "2018-10-04",
unit: "",
artist: "amazarashi",
singer: "夢追翔",
video: "ssh61KTPksk",
start: 850,
end: 1135
}
   ,
{
title: "風に流離い",
count: "1",
type: "cover",
date: "2018-10-04",
unit: "",
artist: "amazarashi",
singer: "夢追翔",
video: "ssh61KTPksk",
start: 473,
end: 668
},
{
title: "デビルマンのうた",
count: "1",
type: "cover",
date: "2018-10-01",
unit: "",
artist: "十田敬三",
singer: "夢追翔",
video: "pZ7MEw0bqEw",
start: 2,
end: 41
},
{
title: "Lemon(2018.10.1)",
count: "1",
type: "cover",
date: "2018-10-01",
unit: "",
artist: "米津玄師",
singer: "夢追翔",
video: "58hvRtSPcGg",
start: 3449,
end: 3702
},
{
title: "ray",
count: "1",
type: "cover",
date: "2018-10-01",
unit: "",
artist: "BUMP OF CHICKEN",
singer: "夢追翔",
video: "58hvRtSPcGg",
start: 3037,
end: 3272
},
{
title: "ベンチとコーヒー",
count: "1",
type: "cover",
date: "2018-10-01",
unit: "",
artist: "BUMP OF CHICKEN",
singer: "夢追翔",
video: "58hvRtSPcGg",
start: 2611,
end: 2920
}
   ,
{
title: "死にたくないから生きている",
count: "1",
type: "original",
date: "2018-09-25",
unit: "",
artist: "夢追翔",
singer: "夢追翔",
video: "XVVXrJQQuNs"
},
{
title: "Lemon(2018.9.29)",
count: "1",
type: "cover",
date: "2018-09-29",
unit: "",
artist: "米津玄師",
singer: "夢追翔",
video: "RUJEeuX_Ac0"
},
{
title: "Replace to be",
count: "5",
type: "original",
date: "2026-05-08",
unit: "VACHSS",
artist: "VACHSS",
singer: "VACHSS (夢追翔、加賀美ハヤト、叶、葛葉、剣持刀也、不破湊)",
video: "7qGbqQTn6og"
},
{
title: "vivi",
count: "1",
type: "cover",
date: "2018-10-01",
unit: "",
artist: "米津玄師",
singer: "夢追翔",
video: "58hvRtSPcGg",
start: 2327,
end: 2520
}
];
function createSongCard(song) {
 const songElement = document.createElement('div');
 songElement.className = 'song';
 songElement.dataset.count = song.count;
 songElement.dataset.type = song.type;
 songElement.dataset.date = song.date;
 songElement.dataset.unit = song.unit;
 songElement.innerHTML = `
<div class="song-card">
<h3>${song.title}</h3>
<p>原曲：${song.artist}</p>
<p>歌唱：${song.singer}</p>
<button
       type="button"
       class="play-button"
       data-title="${song.title}"
       data-video="${song.video}"
       data-start="${song.start || ''}"
       data-end="${song.end || ''}"
>
       ▶ 再生
</button>
</div>
 `;
 return songElement;
}
const songList = document.getElementById('songList');
if (songList) {
 songData.forEach(song => {
   songList.appendChild(createSongCard(song));
 });
}
filterSongs();

// インフォメーションポップアップ
const infoButton = document.getElementById('infoButton');
const infoPopup = document.getElementById('infoPopup');
const infoPopupClose = document.getElementById('infoPopupClose');
const infoPopupCloseBottom = document.getElementById('infoPopupCloseBottom');
const infoPopupOverlay = document.getElementById('infoPopupOverlay');
if (infoButton && infoPopup) {
  infoButton.addEventListener('click', () => {
     infoPopup.classList.add('active');
  });
}
if (infoPopupClose && infoPopup) {
  infoPopupClose.addEventListener('click', () => {
     infoPopup.classList.remove('active');
  });
}
if (infoPopupCloseBottom && infoPopup) {
  infoPopupCloseBottom.addEventListener('click', () => {
     infoPopup.classList.remove('active');
  });
}
if (infoPopupOverlay && infoPopup) {
  infoPopupOverlay.addEventListener('click', () => {
     infoPopup.classList.remove('active');
  });
}
document.querySelectorAll('.song').forEach(song => {
   const date = song.dataset.date;
   const card = song.querySelector('.song-card');
   if (!date || !card) return;
   const year = date.substring(0, 4);
   const oldYear = card.querySelector('.song-year');
if (oldYear) {
   oldYear.remove();
}
const yearText = document.createElement('p');
yearText.className = 'song-year';
yearText.textContent = `${year}年`;
const originalText = card.querySelector('p');
if (originalText) {
   originalText.before(yearText);
}
});
// =========================
// お気に入りボタンを自動追加
// =========================
document.querySelectorAll('.song').forEach(song => {
  const card = song.querySelector('.song-card');
  if (!card) return;
  // すでにボタンがある場合は追加しない
  if (card.querySelector('.favorite-button')) return;
  const playButton = card.querySelector('.play-button');
  const favoriteButton = document.createElement('button');
  favoriteButton.type = 'button';
  favoriteButton.className = 'favorite-button';
  favoriteButton.textContent = '♡';
  favoriteButton.setAttribute('aria-label', 'お気に入り登録');
  // 再生ボタンがあれば、そのすぐ隣に追加
  if (playButton) {
     playButton.insertAdjacentElement('afterend', favoriteButton);
  } else {
     card.appendChild(favoriteButton);
  }
});
// =========================
// 楽曲を年代順に自動並べ替え
// =========================
document.addEventListener('DOMContentLoaded', () => {
   const songList = document.getElementById('songList');
   if (songList) {
       const songs = Array.from(songList.querySelectorAll('.song'));
       songs.sort((a, b) => {
           return a.dataset.date.localeCompare(b.dataset.date);
       });
       songs.forEach(song => {
           songList.appendChild(song);
       });
   }
});
document.querySelectorAll('.song').forEach(song => {
  updateCardFavoriteButton(song);
});
