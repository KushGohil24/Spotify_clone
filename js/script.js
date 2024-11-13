let currentSong = new Audio();
let songs = [];
let currFolder;

function convertSecondsToMinutes(seconds) {
    if (isNaN(seconds) || (seconds < 0)) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let api = await fetch(`./Spotify_clone/assets/songs/${folder}/`);

    let response = await api.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currFolder}/`)[1]);
        }
    }
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
            songUl.innerHTML = "";
            for (const song of songs) {
                songUl.innerHTML += `<li><img src="assets/images/icons/music.svg" alt="poster">
                        <div class="info">
                          <div>${song.replaceAll("%20", " ").replaceAll("%7C", "|").replaceAll("%22", "'")}</div>
                          <div>Song Artist</div>
                        </div>
                        <div class="playnow">
                          <span>Play now</span>
                          <img src="assets/images/icons/play.svg" alt="play">
                        </div></li>`;
            }
            
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", element => {
            const songTitle = e.querySelector(".info").firstElementChild.innerHTML.trim();
            document.querySelector(".circle").style.left = 0 + "%";
            playMusic(songTitle, false);
        });
    });
    return songs;
}

const playMusic = (track, pause) => {
    currentSong.src = `../assets/songs/${currFolder}/` + track;
    currentSong.addEventListener("loadedmetadata", () => {
        document.querySelector(".songinfo").innerHTML = decodeURI(track);
        document.querySelector(".songtime").innerHTML = `00:00 / ${convertSecondsToMinutes(currentSong.duration)}`;
    });
    if (!pause) {
        currentSong.play().catch(error => {
            console.error("Audio playback failed:", error);
        });
        play.src = "../assets/images/icons/pause.svg";
    }
    let leftSec = document.querySelector(".left");
    if (leftSec.style.left === "0%") {
        leftSec.style.left = "-120%";
    }
}

function togglePlayBtn() {
    if (currentSong.paused) {
        currentSong.play();
        play.src = "../assets/images/icons/pause.svg";
    } else {
        currentSong.pause();
        play.src = "../assets/images/icons/play.svg";
    }
}

function removeLeftSec(leftSec){
    if (leftSec.style.left === "0%") {
        // Event listener on main and close
        document.querySelector(".main").addEventListener("click", () => {
            leftSec.style.left = "-120%";
        });
        document.querySelector(".close > img").addEventListener("click", () => {
            leftSec.style.left = "-120%";
        });
    }
}

async function displayAlbums(){
    let api = await fetch(`./Spotify_clone/assets/songs/`);

    let response = await api.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            if(element.href.includes("/songs/")){
                let folder = element.href.split("/").slice(-1)[0];
                // get the metadeta of the folder
                let api = await fetch(`../assets/songs/${folder}/info.json`);

                let response = await api.json(); 
                let cardContainer = document.querySelector(".cardContainer");
                cardContainer.innerHTML = cardContainer.innerHTML + `
                <div data-folder = "${folder}" class="card">
                    <img src="../assets/songs/${folder}/cover.jpeg" alt="cover">
                    <img src="../assets/images/icons/playlistBtn.svg" alt="play" class="playlistBtn">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>`
            }
    }

    // Loading playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            let folder = item.currentTarget.dataset.folder;
            songs = await getSongs(folder); 
            playMusic(songs[0], false);
            document.querySelector(".left").style.left = 0 + "%";
                removeLeftSec(document.querySelector(".left"));
        });
    });

}    

async function main() {
    songs = await getSongs("Love_Songs");
    playMusic(songs[0], true);
    
    // Display all albums on the page
    displayAlbums();

    // Event listener on play button
    play.addEventListener("click", () => {
        togglePlayBtn();
    });

    // Event listener for updating time
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutes(currentSong.currentTime)} / ${convertSecondsToMinutes(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length && currentSong.currentTime === currentSong.duration) {
            play.src = "../assets/images/icons/pause.svg";
            playMusic(songs[index + 1], false);
        }
    });

    // Event listener on seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percentage = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percentage + "%";
        currentSong.currentTime = ((currentSong.duration) * percentage) / 100;
    });

    // Event listener on hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        let leftSec = document.querySelector(".left");
        leftSec.style.left = 0 + "%";
        removeLeftSec(leftSec);
    });

    // Event listener to previous 
    previous.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1], false);
        }
    });

    // Event listener to next
    next.addEventListener("click", () => {
        currentSong.pause();
        play.src = "assets/images/icons/play.svg";
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            play.src = "../assets/images/icons/pause.svg";
            playMusic(songs[index + 1], false);
        }
    });

    // Event listener for spacebar
    document.addEventListener("keydown", (event) => {
        if (event.key === " ") {
            togglePlayBtn();
        }
    });

    // Event listener to volume
    let volumebtn = document.querySelector(".volumebtn");
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("input", (e) => {
        let Updatedvolume = parseInt(e.target.value) / 100;
        currentSong.volume = Updatedvolume;
        if (e.target.value == 0) {
            volumebtn.src = "../assets/images/icons/mute.svg"
        } else if (e.target.value > 0 && e.target.value <= 33) {
            volumebtn.src = "../assets/images/icons/volume1.svg"
        } else if (e.target.value > 33 && e.target.value <= 66) {
            volumebtn.src = "../assets/images/icons/volume2.svg"
        } else {
            volumebtn.src = "../assets/images/icons/volume3.svg"
        }
    });

    // Event listener on volume button
    volumebtn.addEventListener("click",(e) => {
        if(e.target.src.endsWith("mute.svg")){
            currentSong.volume = 1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 100;
            e.target.src = "../assets/images/icons/volume3.svg"
        }else{
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
            e.target.src = "../assets/images/icons/mute.svg"
        }
    })
}

main();

//#85b1b5
//#1db954
