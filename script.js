const audio = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const repeatBtn = document.getElementById('repeatBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeDisplay = document.getElementById('currentTimeDisplay');
const durationDisplay = document.getElementById('durationDisplay');

const addBtn = document.getElementById('addBtn');
const addModal = document.getElementById('addModal');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');

const playlistEl = document.getElementById('playlist');
const currentTitle = document.getElementById('currentTitle');
const currentArtist = document.getElementById('currentArtist');
const coverImage = document.getElementById('coverImage');

let tracks = [];
let currentIndex = -1;
let isPlaying = false;
let isRepeating = false;

// Форматирование времени (секунды -> мин:сек)
function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Управление воспроизведением
function togglePlay() {
    if (tracks.length === 0) return;
    if (currentIndex === -1) {
        loadTrack(0);
    }
    
    if (isPlaying) {
        audio.pause();
        playBtn.innerHTML = '▶';
        playBtn.style.paddingLeft = '4px'; // Иконка Play смещена
    } else {
        audio.play();
        playBtn.innerHTML = '⏸';
        playBtn.style.paddingLeft = '0'; // Иконка Pause по центру
    }
    isPlaying = !isPlaying;
}

playBtn.addEventListener('click', togglePlay);

// Загрузка трека
function loadTrack(index) {
    currentIndex = index;
    const track = tracks[index];
    
    currentTitle.innerText = track.title;
    currentArtist.innerText = track.artist;
    coverImage.src = track.coverUrl;
    audio.src = track.audioUrl;
    
    renderPlaylist();
    
    if (isPlaying) audio.play();
}

// Навигация
nextBtn.addEventListener('click', () => {
    if (tracks.length === 0) return;
    let nextIdx = currentIndex + 1;
    if (nextIdx >= tracks.length) nextIdx = 0;
    loadTrack(nextIdx);
    if (!isPlaying) togglePlay();
});

prevBtn.addEventListener('click', () => {
    if (tracks.length === 0) return;
    if (audio.currentTime > 3) {
        audio.currentTime = 0; // Если играет больше 3 сек, откидываем в начало
    } else {
        let prevIdx = currentIndex - 1;
        if (prevIdx < 0) prevIdx = tracks.length - 1;
        loadTrack(prevIdx);
    }
    if (!isPlaying) togglePlay();
});

// Повтор (Яндекс стиль)
repeatBtn.addEventListener('click', () => {
    isRepeating = !isRepeating;
    audio.loop = isRepeating;
    if (isRepeating) {
        repeatBtn.classList.add('active');
    } else {
        repeatBtn.classList.remove('active');
    }
});

audio.addEventListener('ended', () => {
    if (!isRepeating) nextBtn.click();
});

// Обновление прогресс-бара
audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        const percent = (audio.currentTime / audio.duration) * 100;
        progressBar.value = percent;
        currentTimeDisplay.innerText = formatTime(audio.currentTime);
    }
});

audio.addEventListener('loadedmetadata', () => {
    durationDisplay.innerText = formatTime(audio.duration);
});

// Перемотка пользователем
progressBar.addEventListener('input', (e) => {
    if (audio.duration) {
        const seekTime = (e.target.value / 100) * audio.duration;
        audio.currentTime = seekTime;
    }
});

// Добавление трека (Модалка)
addBtn.addEventListener('click', () => addModal.classList.remove('hidden'));
cancelBtn.addEventListener('click', () => addModal.classList.add('hidden'));

saveBtn.addEventListener('click', () => {
    const title = document.getElementById('songTitle').value.trim() || 'Неизвестный трек';
    const artist = document.getElementById('songArtist').value.trim() || 'Неизвестный автор';
    const songFile = document.getElementById('songFile').files[0];
    const coverFile = document.getElementById('coverFile').files[0];

    if (!songFile) {
        alert('Пожалуйста, выберите аудиофайл.');
        return;
    }

    const newTrack = {
        title: title,
        artist: artist,
        audioUrl: URL.createObjectURL(songFile),
        coverUrl: coverFile ? URL.createObjectURL(coverFile) : 'https://via.placeholder.com/500/181818/888888?text=Нет+обложки'
    };

    tracks.push(newTrack);
    
    document.getElementById('songTitle').value = '';
    document.getElementById('songArtist').value = '';
    document.getElementById('songFile').value = '';
    document.getElementById('coverFile').value = '';
    
    addModal.classList.add('hidden');
    renderPlaylist();
});

// Отрисовка плейлиста
function renderPlaylist() {
    playlistEl.innerHTML = '';
    
    if (tracks.length === 0) {
        playlistEl.innerHTML = `
            <li class="empty-state">
                <div class="empty-icon">🎵</div>
                Здесь пока пусто. Добавь свои любимые треки!
            </li>`;
        return;
    }

    tracks.forEach((track, index) => {
        const li = document.createElement('li');
        if (index === currentIndex) li.classList.add('active');
        
        li.innerHTML = `
            <div class="track-number">${index + 1}</div>
            <div class="track-details">
                <div class="track-details-title">${track.title}</div>
                <div class="track-details-artist">${track.artist}</div>
            </div>
        `;
        
        li.addEventListener('click', () => {
            loadTrack(index);
            if (!isPlaying) togglePlay();
        });
        
        playlistEl.appendChild(li);
    });
}