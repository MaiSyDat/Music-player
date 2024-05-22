const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'Music_MaiSyDat'

const player = $('.player')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const cd = $('.cd');
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeat = $('.btn-repeat')
const playlist = $('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    song: [
        {
            name: 'Em ơi sau này',
            singer: 'Đặng Trí',
            path: './assets/music/Em Ơi Sau Này - Đặng Trí.mp3',
            image: './assets/img/Em Ơi Sau Này - Đặng Trí.jpg'
        },

        {
            name: 'Hư không',
            singer: 'Kha',
            path: './assets/music/Kha - Hư Không.mp3',
            image: './assets/img/Hư không - KHA.jpg'
        },

        {
            name: 'Tình yêu của anh',
            singer: 'Andiez',
            path: './assets/music/Tình yêu của anh - Andiez.mp3',
            image: './assets/img/Tình yêu của anh - Andiez.jpg'
        },

        {
            name: 'Yêu Thương Ngày Đó',
            singer: ' Soobin Hoàng Sơn',
            path: './assets/music/Yêu Thương Ngày Đó - Soobin Hoàng Sơn.mp3',
            image: './assets/img/Yêu Thương Ngày Đó - Soobin Hoàng Sơn.webp'
        },
    ],

    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },

    render: function () {
        const htmls = this.song.map((song, index) => {
            return `<div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
            <div class="thumb"
                style="background-image: url('${song.image}')">
            </div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>`
        })
        playlist.innerHTML = htmls.join('')
    },

    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.song[this.currentIndex]
            }
        })
    },

    handleEvents: function () {
        const CdWidth = cd.offsetWidth;
        const _this = this;

        // Xử lý CD quay/dừng
        const cdThumAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, // 10 seconds
            iterations: Infinity,
        });
        cdThumAnimate.pause()


        // Xử lý phóng to / thu nhỏ CD
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = CdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / CdWidth;
        }

        // Xử lý khi click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                // _this.isPlaying = false
                audio.pause()
                // player.classList.remove('playing')
            } else {
                // _this.isPlaying = true
                audio.play()
                // player.classList.add('playing')
            }
        }

        // khi song được play
        audio.onplay = function () {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumAnimate.play()
        }

        // khi song bị pause
        audio.onpause = function () {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumAnimate.pause()
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }

        }

        // Xử lý khi tua 
        progress.oninput = function (e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        // khi next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // khi prve
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prveSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // khi random
        randomBtn.onclick = function (e) {
            _this.isRandom = !_this.isRandom
            _this.setConfig = ('isRamdom', _this.isRandom)
            randomBtn.classList.toggle('active')
        }

        // khi repeat
        repeat.onclick = function (e) {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig = ('isRepeat', _this.isRepeat)
            repeat.classList.toggle('active')
        }

        // xử lý nextSong khi audio ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        // Lắng nghe click vào playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')
            // xử lý khi clik vào song thì next đến bài đó  
            if (songNode || e.target.closest('.option')) {
                // xử lí khi click vào song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }

                // xử lý khi click vào option
                if (e.target.closest('.option')) {

                }
            }
        }

    },

    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })
        }, 300)
    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },

    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },

    nextSong: function () {
        this.currentIndex++
        if (this.currentIndex >= this.song.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },

    prveSong: function () {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.song.length - 1
        }
        this.loadCurrentSong()
    },

    playRandomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.song.length)
        } while (newIndex == this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },

    start: function () {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig()

        // Đinh nghĩa các thuộc tính cho object
        this.defineProperties()

        // Lắng nghe / xử lý các sự kiện (DOM Events)
        this.handleEvents()

        // Tải thông tin bài hát đàu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()

        // render playlist
        this.render()

        // Hiển thị trạng thái ban đầu của btn
        repeat.classList.toggle('active', this.isRandom)    
        randomBtn.classList.toggle('active', this.isRepeat)
    }
}

app.start();    