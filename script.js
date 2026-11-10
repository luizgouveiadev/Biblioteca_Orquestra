
const instrumentStep = document.getElementById("instrumentStep");
const musicStep = document.getElementById("musicStep");
const materialStep = document.getElementById("materialStep");
const selectedInstrumentLabel = document.getElementById("selectedInstrumentLabel");
const musicCount = document.getElementById("musicCount");
const musicList = document.getElementById("musicList");
const searchInput = document.getElementById("searchInput");
const emptyMessage = document.getElementById("emptyMessage");
const selectedMusicTitle = document.getElementById("selectedMusicTitle");
const materialInstrument = document.getElementById("materialInstrument");
const sheetLink = document.getElementById("sheetLink");
const videoLink = document.getElementById("videoLink");
const breadcrumbs = document.getElementById("breadcrumbs");

// Banco de músicas
let musicLibrary = {
  violoncelo: [],
  trompete: []
};

let currentInstrument = "";
let currentMusic = null;

const instrumentNames = {
  violoncelo: "Violoncelo",
  trompete: "Trompete"
};

// Carrega os dois arquivos JSON
async function loadMusicLibrary() {
  try {
    const [violonceloResponse, trompeteResponse] =
      await Promise.all([
        fetch("./violoncelo.json"),
        fetch("./trompete.json")
      ]);

    if (!violonceloResponse.ok || !trompeteResponse.ok) {
      throw new Error("Não foi possível encontrar os arquivos JSON.");
    }

    const [violonceloData, trompeteData] =
      await Promise.all([
        violonceloResponse.json(),
        trompeteResponse.json()
      ]);

    musicLibrary.violoncelo = violonceloData;
    musicLibrary.trompete = trompeteData;

    console.log("Músicas carregadas com sucesso!");

  } catch (error) {
    console.error("Erro ao carregar os arquivos:", error);
    alert("Erro ao carregar as músicas. Verifique os arquivos JSON.");
  }
}

// Navegação entre etapas
function showStep(step) {
  instrumentStep.classList.toggle("hidden", step !== "instrument");
  musicStep.classList.toggle("hidden", step !== "music");
  materialStep.classList.toggle("hidden", step !== "material");

  const activeNumber =
    step === "instrument" ? 1 :
      step === "music" ? 2 : 3;

  breadcrumbs.querySelectorAll(".crumb").forEach((crumb, index) => {
    crumb.classList.toggle("active", index + 1 <= activeNumber);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Escolher instrumento
function selectInstrument(instrument) {
  currentInstrument = instrument;

  selectedInstrumentLabel.textContent = instrumentNames[instrument];
  searchInput.value = "";

  renderMusicList();
  showStep("music");
}

// Exibir lista de músicas
function renderMusicList() {
  const songs = musicLibrary[currentInstrument] || [];
  const term = searchInput.value.trim().toLocaleLowerCase("pt-BR");

  const filteredSongs = songs.filter(song =>
    song.title.toLocaleLowerCase("pt-BR").includes(term)
  );

  musicCount.textContent =
    `${filteredSongs.length} ${filteredSongs.length === 1
      ? "música encontrada"
      : "músicas encontradas"
    }`;

  musicList.innerHTML = "";

  emptyMessage.classList.toggle(
    "hidden",
    filteredSongs.length !== 0
  );

  filteredSongs.forEach(song => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "music-item";

    const info = document.createElement("span");

    const title = document.createElement("span");
    title.className = "music-item-name";
    title.textContent = song.title;

    const meta = document.createElement("span");
    meta.className = "music-item-meta";
    meta.textContent = " - Partitura e vídeo disponíveis";

    info.append(title, meta);

    const arrow = document.createElement("span");
    arrow.className = "music-item-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";

    button.append(info, arrow);

    button.addEventListener("click", () => selectMusic(song));

    musicList.appendChild(button);
  });
}

// Escolher música
function selectMusic(song) {
  currentMusic = song;

  selectedMusicTitle.textContent = song.title;
  materialInstrument.textContent = instrumentNames[currentInstrument];

  configureLink(sheetLink, song.sheetUrl, "partitura");
  configureLink(videoLink, song.videoUrl, "vídeo");

  showStep("material");
}

// Configurar links
function configureLink(element, url, label) {
  const isValidUrl =
    typeof url === "string" &&
    /^https?:\/\//i.test(url);

  if (isValidUrl) {
    element.href = url;
    element.classList.remove("disabled-link");
    element.setAttribute("aria-label", `Abrir ${label} em nova aba`);
  } else {
    element.href = "#";
    element.classList.add("disabled-link");
    element.setAttribute("aria-label", `${label} ainda não cadastrado`);
  }
}

// Eventos dos instrumentos
document.querySelectorAll("[data-instrument]").forEach(button => {
  button.addEventListener("click", () => {
    selectInstrument(button.dataset.instrument);
  });
});

// Voltar para instrumentos
document.getElementById("backToInstruments").addEventListener("click", () => {
  currentInstrument = "";
  showStep("instrument");
});

// Voltar para músicas
document.getElementById("backToMusic").addEventListener("click", () => {
  showStep("music");
});

// Voltar para página inicial
document.getElementById("homeLink").addEventListener("click", event => {
  event.preventDefault();

  currentInstrument = "";
  currentMusic = null;
  searchInput.value = "";

  showStep("instrument");
});

// Busca de músicas
searchInput.addEventListener("input", renderMusicList);

// Impedir abertura de links vazios
[sheetLink, videoLink].forEach(link => {
  link.addEventListener("click", event => {
    if (link.classList.contains("disabled-link")) {
      event.preventDefault();
      alert("Este link ainda não foi cadastrado.");
    }
  });
});

// Esperar os JSON carregarem antes de permitir a navegação
async function initializePage() {
  await loadMusicLibrary();

  document.querySelectorAll("[data-instrument]").forEach(button => {
    button.disabled = false;
  });
}

initializePage();
