/* =========================

   検索・フィルター

   ========================= */

function filterSongs() {

    const selectedCounts = Array.from(

        document.querySelectorAll(

            'input[name="memberCount"]:checked'

        )

    ).map(item => item.value);

    const selectedTypes = Array.from(

        document.querySelectorAll(

            'input[name="songType"]:checked'

        )

    ).map(item => item.value);

    const selectedUnits = Array.from(

        document.querySelectorAll(

            'input[name="unit"]:checked'

        )

    ).map(item => item.value);

    const selectedYears = Array.from(

        document.querySelectorAll(

            'input[name="year"]:checked'

        )

    ).map(item => item.value);

    const searchText =

        document

            .getElementById('songSearch')

            .value

            .toLowerCase()

            .trim();


    document.querySelectorAll('.song').forEach(song => {

        const countMatch =

            selectedCounts.length === 0 ||

            selectedCounts.includes(

                song.dataset.count

            );

        const typeMatch =

            selectedTypes.length === 0 ||

            selectedTypes.includes(

                song.dataset.type

            );

        const unitMatch =

            selectedUnits.length === 0 ||

            selectedUnits.includes(

                song.dataset.unit

            );

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


/* =========================

   YouTube API

   ========================= */

let youtubePlayer = null;

let currentSong = null;

let isPlayerReady = false;

let currentStartTime = 0;


/* YouTube APIを読み込む */
function loadYouTubeAPI() {

    if (

        document.querySelector(

            'script[src="https://www.youtube.com/iframe_api"]'

        )

    ) {

        return;

    }

    const tag =

        document.createElement('script');

    tag.src =

        'https://www.youtube.com/iframe_api';

    document.head.appendChild(tag);

}


/* =========================

   YouTube API準備完了

   ========================= */

window.onYouTubeIframeAPIReady = function () {

    isPlayerReady = true;

};


/* =========================

   ページ読み込み

   ========================= */

document.addEventListener(

    'DOMContentLoaded',

    () => {

        /* =====================

           検索・フィルター

           ===================== */

        document.querySelectorAll(

            'input[name="memberCount"], ' +

            'input[name="songType"], ' +

            'input[name="unit"], ' +

            'input[name="year"]'

        ).forEach(checkbox => {

            checkbox.addEventListener(

                'change',

                filterSongs

            );

        });


        document

            .getElementById('searchButton')

            .addEventListener(

                'click',

                filterSongs

            );


        /* =====================

           ミニプレイヤー

           ===================== */

        const miniPlayer =

            document.getElementById(

                'miniPlayer'

            );

        const miniPlayerTitle =

            document.getElementById(

                'miniPlayerTitle'

            );

        const miniPlayerImage =

            document.getElementById(

                'miniPlayerImage'

            );

        const playPauseButton =

            document.getElementById(

                'playPauseButton'

            );

        const previousButton =

            document.getElementById(

                'previousButton'

            );

        const nextButton =

            document.getElementById(

                'nextButton'

            );


        /* =====================

           ポップアップ

           ===================== */

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
<div id="popupVideoContainer">
<div id="youtubePlayer"></div>
</div>
<div id="popupSongTitle"></div>
<div id="popupControls">
<button

                        type="button"

                        id="popupPlayPause">

                        ▶️
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


        const popupSongTitle =

            document.getElementById(

                'popupSongTitle'

            );

        const popupPlayPause =

            document.getElementById(

                'popupPlayPause'

            );


        /* =====================

           YouTubeプレイヤー作成

           ===================== */

        function createPlayer(

            videoId,

            startTime

        ) {

            currentStartTime =

                Number(startTime) || 0;


            if (youtubePlayer) {

                youtubePlayer.loadVideoById({

                    videoId: videoId,

                    startSeconds:

                        currentStartTime

                });

                return;

            }


            youtubePlayer =

                new YT.Player(

                    'youtubePlayer',

                    {

                        width: '100%',

                        height: '100%',

                        videoId: videoId,

                        playerVars: {

                            autoplay: 1,

                            start:

                                currentStartTime,

                            playsinline: 1,

                            rel: 0

                        },

                        events: {

                            onReady:

                                function (event) {

                                    /*

                                     * プレイヤーの準備が

                                     * 完了してから再生する

                                     */

                                    event.target.playVideo();

                                },

                            onStateChange:

                                function (event) {

                                    /*

                                     * 1 = 再生中

                                     * 2 = 一時停止

                                     * 0 = 終了

                                     */

                                    if (

                                        event.data ===

                                        YT.PlayerState.PLAYING

                                    ) {

                                        playPauseButton.textContent =

                                            '⏸️';

                                        popupPlayPause.textContent =

                                            '⏸️';

                                    }

                                    else if (

                                        event.data ===

                                        YT.PlayerState.PAUSED

                                    ) {

                                        playPauseButton.textContent =

                                            '▶️';

                                        popupPlayPause.textContent =

                                            '▶️';

                                    }

                                    else if (

                                        event.data ===

                                        YT.PlayerState.ENDED

                                    ) {

                                        playPauseButton.textContent =

                                            '▶️';

                                        popupPlayPause.textContent =

                                            '▶️';

                                    }

                                }

                    }

                );

        }


        /* =====================

           曲を再生

           ===================== */

        function playSong(song) {

            const playButton =

                song.querySelector(

                    '.play-button'

                );

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

                Number(

                    playButton.dataset.start || 0

                );


            currentSong = song;


            /* 曲名 */

            miniPlayerTitle.textContent =

                title;

            popupSongTitle.textContent =

                title;


            /* サムネイル */

            miniPlayerImage.src =

                'https://img.youtube.com/vi/' +

                videoId +

                '/hqdefault.jpg';

            miniPlayerImage.alt =

                title;


            /* 元動画 */

            document.getElementById(

                'popupOriginal'

            ).href =

                'https://www.youtube.com/watch?v=' +

                videoId;


            /* ポップアップ */

            popup.classList.add(

                'active'

            );


            /* YouTube */

            if (

                typeof YT === 'undefined' ||

                !YT.Player

            ) {

                /*

                 * API読み込み待ち

                 */

                loadYouTubeAPI();

                setTimeout(

                    function waitForAPI() {

                        if (

                            typeof YT !== 'undefined' &&

                            YT.Player

                        ) {

                            createPlayer(

                                videoId,

                                startTime

                            );

                        } else {

                            setTimeout(

                                waitForAPI,

                                100

                            );

                        }

                    },

                    100

                );

            } else {

                createPlayer(

                    videoId,

                    startTime

                );

            }

        }


        /* =====================

           曲カード

           ===================== */

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


        /* =====================

           再生 / 一時停止

           ===================== */

        function togglePlayPause() {

            if (!youtubePlayer) {

                return;

            }


            const state =

                youtubePlayer.getPlayerState();


            if (

                state ===

                YT.PlayerState.PLAYING

            ) {

                youtubePlayer.pauseVideo();

            } else {

                youtubePlayer.playVideo();

            }

        }


        playPauseButton.addEventListener(

            'click',

            function (event) {

                event.stopPropagation();

                togglePlayPause();

            }

        );


        popupPlayPause.addEventListener(

            'click',

            function () {

                togglePlayPause();

            }

        );


        /* =====================

           前の曲

           ===================== */

        previousButton.addEventListener(

            'click',

            function (event) {

                event.stopPropagation();

                if (!currentSong) {

                    return;

                }


                const songs =

                    Array.from(

                        document.querySelectorAll(

                            '.song'

                        )

                    ).filter(song =>

                        song.style.display !==

                        'none'

                    );


                const index =

                    songs.indexOf(

                        currentSong

                    );


                if (index > 0) {

                    playSong(

                        songs[index - 1]

                    );

                }

            }

        );


        /* =====================

           次の曲

           ===================== */

        nextButton.addEventListener(

            'click',

            function (event) {

                event.stopPropagation();

                if (!currentSong) {

                    return;

                }


                const songs =

                    Array.from(

                        document.querySelectorAll(

                            '.song'

                        )

                    ).filter(song =>

                        song.style.display !==

                        'none'

                    );


                const index =

                    songs.indexOf(

                        currentSong

                    );


                if (

                    index >= 0 &&

                    index <

                    songs.length - 1

                ) {

                    playSong(

                        songs[index + 1]

                    );

                }

            }

        );


        /* =====================

           ポップアップを閉じる

           ===================== */

        document.getElementById(

            'musicPopupClose'

        ).addEventListener(

            'click',

            function () {

                popup.classList.remove(

                    'active'

                );

            }

        );


        document.getElementById(

            'musicPopupOverlay'

        ).addEventListener(

            'click',

            function () {

                popup.classList.remove(

                    'active'

                );

            }

        );


        /* =====================

           ミニプレイヤーから

           ポップアップを再表示

           ===================== */

        miniPlayer.addEventListener(

            'click',

            function (event) {

                if (

                    event.target.closest(

                        'button'

                    )

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


        /* YouTube API読み込み */

        loadYouTubeAPI();

    }

);
