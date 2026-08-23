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
<button type="button" id="musicPopupClose">×</button>
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
</div>
</div>
   `;
   document.body.appendChild(popup);
   const popupSongTitle = document.getElementById('popupSongTitle');
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
   function updateFavoriteButton(song) {
   if (!popupFavorite || !song) return;
   const title = song.querySelector('h3').textContent.trim();
   const favorites = getFavorites();
   if (favorites.includes(title)) {
       popupFavorite.textContent = '♥ お気に入り解除';
   } else {
       popupFavorite.textContent = '♡ お気に入り登録';
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
   if (!youtubePlayer) return;
   const currentTime = youtubePlayer.getCurrentTime() || 0;
   const duration = youtubePlayer.getDuration() || 0;
   const seekBar = document.getElementById('popupSeekBar');
   const currentTimeDisplay = document.getElementById('popupCurrentTime');
   const durationDisplay = document.getElementById('popupDuration');
   if (duration > 0) {
       seekBar.max = duration;
       seekBar.value = currentTime;
       durationDisplay.textContent = formatTime(duration);
   }
   currentTimeDisplay.textContent = formatTime(currentTime);
   if (
   currentSong &&
   currentSong.querySelector('.play-button') &&
   Number(currentSong.querySelector('.play-button').dataset.end || 0) > 0 &&
   currentTime >= Number(currentSong.querySelector('.play-button').dataset.end)
) {
   youtubePlayer.pauseVideo();
   youtubePlayer.seekTo(
       Number(currentSong.querySelector('.play-button').dataset.start || 0),
       true
   );
   return;
}
   if (youtubePlayer.getPlayerState() === YT.PlayerState.PLAYING) {
       requestAnimationFrame(updateSeekBar);
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
  // 曲が終了したとき
if (event.data === YT.PlayerState.ENDED) {
   // ① 1曲リピート
   if (loopMode === 1) {
       youtubePlayer.seekTo(Number(startTime) || 0, true);
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
  // 曲が1曲しかない場合は、その曲をもう一度再生
  if (songs.length === 1) {
      randomSong = songs[0];
  } else {
      // 現在の曲とは違う曲をランダムに選ぶ
      do {
          const randomIndex = Math.floor(Math.random() * songs.length);
          randomSong = songs[randomIndex];
      } while (randomSong === currentSong);
  }
  playSong(randomSong, false);
  // 新しい動画を読み込んだあと、自動再生する
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
       const nextIndex = index >= 0 && index < songs.length - 1
           ? index + 1
           : 0;
       playSong(songs[nextIndex], false);
       setTimeout(() => {
           if (youtubePlayer) {
               youtubePlayer.playVideo();
           }
       }, 500);
   }
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
       if (!youtubePlayer) return;
       youtubePlayer.seekTo(Number(event.target.value), true);
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
   const yearText = document.createElement('p');
   yearText.className = 'song-year';
   yearText.textContent = `${year}年`;
   const originalText = card.querySelector('p');
   if (originalText) {
       originalText.before(yearText);
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
