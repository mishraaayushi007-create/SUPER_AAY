/**
 * SUPER_AAY - 100% Offline Superconductor Learning System
 * Pure Vanilla JavaScript | Zero External Dependencies
 */

(function () {
  "use strict";

  // ==========================================
  // 1. STATE & DATA INITIALIZATION
  // ==========================================
  const materials = window.MATERIALS_DATA || [];

  let state = {
    searchQuery: "",
    activeFilter: "ALL",
    activeTab: "explorerTab",
    selectedMaterial: null,
    simulatedTemp: 300, // Feature 1: Cryo-Slider temperature in Kelvin (defaults to 300 K)
    compareList: [], // Feature 2: Side-by-Side Compare selection (array of up to 2 material IDs)
    flashcards: { // Feature 3: Flashcards study deck state
      currentIndex: 0,
      isFlipped: false,
      filter: "all", // "all" | "review"
      masteredIds: loadMasteredCards()
    },
    quiz: {
      stage: "start",
      currentIndex: 0,
      score: 0,
      hasAnswered: false,
      hasFinished: false,
      questions: []
    }
  };

  // ==========================================
  // DYNAMIC QUIZ GENERATOR UTILITIES
  // ==========================================
  // Fisher-Yates Array Shuffle
  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  }

  // Generates 5 dynamic, randomized questions directly from MATERIALS_DATA
  function generateDynamicQuiz(data) {
    const sourceData = (Array.isArray(data) && data.length >= 5)
      ? data
      : ((Array.isArray(materials) && materials.length >= 5)
          ? materials
          : (typeof window !== "undefined" && Array.isArray(window.MATERIALS_DATA) ? window.MATERIALS_DATA : []));

    if (!sourceData || sourceData.length < 5) return [];

    // Shuffle materials and pick strictly 5 distinct superconductors
    const shuffledMaterials = shuffleArray(sourceData);
    const targetMaterials = shuffledMaterials.slice(0, 5);

    // Varied question template indices:
    // 0: Critical Temperature (Tc)
    // 1: Chemical Formula Matching
    // 2: Type-I vs Type-II Classification
    // 3: Real-World Application Matching
    // 4: Material Family / Class Identification
    // 5: Critical Magnetic Field (Hc) Specification
    const templateTypes = shuffleArray([0, 1, 2, 3, 4, 5]);

    return targetMaterials.map((mat, idx) => {
      const templateType = templateTypes[idx % templateTypes.length];
      let question = "";
      let hint = "";
      let correctOption = "";
      let distractors = [];
      let explanation = "";

      switch (templateType) {
        // Template 0: Critical Temperature (Tc)
        case 0: {
          question = `What is the Critical Temperature (Tc) of ${mat.Name}?`;
          hint = `Formula: ${mat.Formula} | Classification: ${mat.Type} ${mat.Family}`;
          correctOption = mat["Critical Temperature (K)"];
          const otherTcValues = [
            ...new Set(
              sourceData
                .filter((m) => m.id !== mat.id && m["Critical Temperature (K)"] !== correctOption)
                .map((m) => m["Critical Temperature (K)"])
            )
          ];
          distractors = shuffleArray(otherTcValues).slice(0, 3);
          explanation = `${mat.Name} (${mat.Formula}) transitions to a zero-resistance superconducting state at ${correctOption}.`;
          break;
        }

        // Template 1: Chemical Formula Matching
        case 1: {
          question = `Which superconductor has the chemical formula ${mat.Formula}?`;
          hint = `Transitions at ${mat["Critical Temperature (K)"]} as a ${mat.Type} superconductor.`;
          correctOption = mat.Name;
          const otherNames = sourceData.filter((m) => m.id !== mat.id).map((m) => m.Name);
          distractors = shuffleArray(otherNames).slice(0, 3);
          explanation = `${mat.Name} has the chemical formula ${mat.Formula} and is classified under ${mat.Family}.`;
          break;
        }

        // Template 2: Type-I vs Type-II Classification
        case 2: {
          question = `Which of the following is classified as a ${mat.Type} superconductor?`;
          hint = `Consider the Meissner flux expulsion behavior and vortex lattice response.`;
          correctOption = `${mat.Name} (${mat.Formula})`;
          const oppType = mat.Type === "Type-I" ? "Type-II" : "Type-I";
          const oppMaterials = sourceData
            .filter((m) => m.Type === oppType)
            .map((m) => `${m.Name} (${m.Formula})`);
          distractors = shuffleArray(oppMaterials).slice(0, 3);
          if (distractors.length < 3) {
            const extra = sourceData
              .filter((m) => m.id !== mat.id && !distractors.includes(`${m.Name} (${m.Formula})`))
              .map((m) => `${m.Name} (${m.Formula})`);
            distractors = [...distractors, ...shuffleArray(extra)].slice(0, 3);
          }
          explanation = `${mat.Name} (${mat.Formula}) is a ${mat.Type} superconductor with a critical field of ${mat["Critical Magnetic Field"]}.`;
          break;
        }

        // Template 3: Real-World Application Matching
        case 3: {
          const apps = mat.Applications && mat.Applications.length > 0 ? mat.Applications : ["Quantum physics research"];
          const chosenApp = apps[Math.floor(Math.random() * apps.length)];
          question = `Which superconducting material is actively utilized in "${chosenApp}"?`;
          hint = `Operates as a ${mat.Type} superconductor with Tc = ${mat["Critical Temperature (K)"]}.`;
          correctOption = `${mat.Name} (${mat.Formula})`;
          const otherMaterials = sourceData
            .filter((m) => m.id !== mat.id)
            .map((m) => `${m.Name} (${m.Formula})`);
          distractors = shuffleArray(otherMaterials).slice(0, 3);
          explanation = `${mat.Name} (${mat.Formula}) is utilized in ${chosenApp}.`;
          break;
        }

        // Template 4: Material Family / Class Identification
        case 4: {
          question = `To which material family does ${mat.Name} (${mat.Formula}) belong?`;
          hint = `Superconducting transition occurs at ${mat["Critical Temperature (K)"]} (${mat.Type}).`;
          correctOption = mat.Family;
          const otherFamilies = [
            ...new Set(sourceData.filter((m) => m.Family !== correctOption).map((m) => m.Family))
          ];
          distractors = shuffleArray(otherFamilies).slice(0, 3);
          if (distractors.length < 3) {
            const fallbackFamilies = ["Elemental Metal", "Metallic Alloy", "Cuprate", "Intermetallic Boride", "Iron-Based (Pnictide)"]
              .filter((f) => f !== correctOption && !distractors.includes(f));
            distractors = [...distractors, ...fallbackFamilies].slice(0, 3);
          }
          explanation = `${mat.Name} (${mat.Formula}) is classified under the ${mat.Family} superconductor class.`;
          break;
        }

        // Template 5: Critical Magnetic Field (Hc) Specification
        default: {
          question = `What is the approximate critical magnetic field of ${mat.Name} (${mat.Formula})?`;
          hint = `Classified as ${mat.Type} ${mat.Family} with Tc = ${mat["Critical Temperature (K)"]}.`;
          correctOption = mat["Critical Magnetic Field"];
          const otherFields = [
            ...new Set(
              sourceData
                .filter((m) => m.id !== mat.id && m["Critical Magnetic Field"] !== correctOption)
                .map((m) => m["Critical Magnetic Field"])
            )
          ];
          distractors = shuffleArray(otherFields).slice(0, 3);
          explanation = `${mat.Name} exhibits a critical magnetic field threshold of ${mat["Critical Magnetic Field"]}.`;
          break;
        }
      }

      // Safeguard: Ensure we have at least 3 distractors so there are always 4 distinct options
      if (distractors.length < 3) {
        const extraNames = sourceData
          .filter((m) => m.id !== mat.id && !distractors.includes(m.Name) && m.Name !== correctOption)
          .map((m) => m.Name);
        distractors = [...distractors, ...shuffleArray(extraNames)].slice(0, 3);
      }

      // Combine correct answer with distractors and shuffle with Fisher-Yates
      const rawOptions = [correctOption, ...distractors];
      const shuffledOptions = shuffleArray(rawOptions);
      const correctIndex = shuffledOptions.indexOf(correctOption);

      return {
        question,
        hint,
        options: shuffledOptions,
        correct: correctIndex,
        explanation
      };
    });
  }

  // SVG Fallback Image Generator for 100% Offline Reliability
  const SVG_FALLBACK_IMAGES = {
    m: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='16' fill='%230f2942'/><circle cx='50' cy='50' r='28' fill='%2394a3b8'/><text x='50' y='57' font-size='20' font-weight='900' fill='%23060b19' text-anchor='middle'>Hg</text></svg>",
    l: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='16' fill='%2313273e'/><rect x='25' y='25' width='50' height='50' rx='6' fill='%2364748b'/><text x='50' y='58' font-size='22' font-weight='900' fill='%23f8fafc' text-anchor='middle'>Pb</text></svg>",
    a: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='16' fill='%230c243b'/><circle cx='50' cy='50' r='30' fill='%23cbd5e1'/><text x='50' y='57' font-size='22' font-weight='900' fill='%230f172a' text-anchor='middle'>Al</text></svg>",
    N: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='16' fill='%230e2f50'/><polygon points='50,20 78,74 22,74' fill='%2338bdf8'/><text x='50' y='63' font-size='20' font-weight='900' fill='%23060b19' text-anchor='middle'>Nb</text></svg>",
    NT: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='16' fill='%23102d4a'/><circle cx='50' cy='50' r='30' fill='%23818cf8'/><text x='50' y='56' font-size='16' font-weight='900' fill='%23ffffff' text-anchor='middle'>NbTi</text></svg>",
    MB: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='16' fill='%2309253d'/><polygon points='50,18 80,35 80,68 50,85 20,68 20,35' fill='%232dd4bf'/><text x='50' y='56' font-size='15' font-weight='900' fill='%23060b19' text-anchor='middle'>MgB2</text></svg>",
    ybco: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='16' fill='%2319244d'/><rect x='22' y='22' width='56' height='56' rx='8' fill='%2300f2fe'/><text x='50' y='57' font-size='14' font-weight='900' fill='%23060b19' text-anchor='middle'>YBCO</text></svg>",
    bscco: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='16' fill='%23152044'/><circle cx='50' cy='50' r='30' fill='%23c084fc'/><text x='50' y='56' font-size='13' font-weight='900' fill='%23060b19' text-anchor='middle'>BSCCO</text></svg>",
    lfao: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='16' fill='%231e213d'/><polygon points='50,18 78,75 22,75' fill='%23f43f5e'/><text x='50' y='64' font-size='14' font-weight='900' fill='%23ffffff' text-anchor='middle'>LFAO</text></svg>",
    ld: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='16' fill='%231a1936'/><polygon points='50,15 85,50 50,85 15,50' fill='%23f59e0b'/><text x='50' y='56' font-size='15' font-weight='900' fill='%23060b19' text-anchor='middle'>LaH10</text></svg>"
  };

  // ==========================================
  // 2. DOM ELEMENT REFERENCES
  // ==========================================
  const DOM = {
    // Navigation Tabs
    bottomDock: document.getElementById("bottomDock"),
    dockItems: document.querySelectorAll(".dock-item"),
    tabViews: document.querySelectorAll(".tab-view"),
    explorerTab: document.getElementById("explorerTab"),
    flashcardsTab: document.getElementById("flashcardsTab"),
    quizTab: document.getElementById("quizTab"),

    // Catalog Controls
    heroScrollBtn: document.getElementById("heroScrollBtn"),
    catalogCountTag: document.getElementById("catalogCountTag"),
    searchInput: document.getElementById("searchInput"),
    clearSearchBtn: document.getElementById("clearSearchBtn"),
    filterPills: document.getElementById("filterPills"),
    materialGrid: document.getElementById("materialGrid"),
    emptyCatalogState: document.getElementById("emptyCatalogState"),
    resetFiltersBtn: document.getElementById("resetFiltersBtn"),

    // Feature 1: Cryo-Slider Elements
    cryoTempSlider: document.getElementById("cryoTempSlider"),
    tempReadoutVal: document.getElementById("tempReadoutVal"),
    tempStateBadge: document.getElementById("tempStateBadge"),
    presetBtns: document.querySelectorAll(".preset-btn"),
    superconductingCountText: document.getElementById("superconductingCountText"),
    phasePulseDot: document.getElementById("phasePulseDot"),

    // Feature 2: Side-by-Side Compare Elements
    compareActionBar: document.getElementById("compareActionBar"),
    compareBadgeCount: document.getElementById("compareBadgeCount"),
    compareBarText: document.getElementById("compareBarText"),
    clearCompareBtn: document.getElementById("clearCompareBtn"),
    launchCompareBtn: document.getElementById("launchCompareBtn"),
    compareModal: document.getElementById("compareModal"),
    compareScrim: document.getElementById("compareScrim"),
    closeCompareModalBtn: document.getElementById("closeCompareModalBtn"),
    compareDragHandle: document.getElementById("compareDragHandle"),
    compareTableContainer: document.getElementById("compareTableContainer"),
    compareResetBtn: document.getElementById("compareResetBtn"),

    // Feature 3: Flashcard Elements
    masteryCountText: document.getElementById("masteryCountText"),
    masteryProgressFill: document.getElementById("masteryProgressFill"),
    flashcardFilterBtn: document.getElementById("flashcardFilterBtn"),
    resetMasteryBtn: document.getElementById("resetMasteryBtn"),
    flashcardScene: document.getElementById("flashcardScene"),
    flashcardElement: document.getElementById("flashcardElement"),
    cardIndexPill: document.getElementById("cardIndexPill"),
    cardMasteryChip: document.getElementById("cardMasteryChip"),
    cardFrontFormula: document.getElementById("cardFrontFormula"),
    cardFrontHint: document.getElementById("cardFrontHint"),
    cardBackIndexPill: document.getElementById("cardBackIndexPill"),
    cardBackTypeBadge: document.getElementById("cardBackTypeBadge"),
    cardBackImg: document.getElementById("cardBackImg"),
    cardBackName: document.getElementById("cardBackName"),
    cardBackFormula: document.getElementById("cardBackFormula"),
    cardBackTc: document.getElementById("cardBackTc"),
    cardBackFamily: document.getElementById("cardBackFamily"),
    cardBackApp: document.getElementById("cardBackApp"),
    prevCardBtn: document.getElementById("prevCardBtn"),
    flipCardBtn: document.getElementById("flipCardBtn"),
    nextCardBtn: document.getElementById("nextCardBtn"),
    markReviewBtn: document.getElementById("markReviewBtn"),
    markMasteredBtn: document.getElementById("markMasteredBtn"),

    // Bento Detail Modal
    modalScrim: document.getElementById("modalScrim"),
    detailSheet: document.getElementById("detailSheet"),
    sheetDragHandle: document.getElementById("sheetDragHandle"),
    closeModalBtn: document.getElementById("closeModalBtn"),
    modalThumbBtn: document.getElementById("modalThumbBtn"),
    modalImg: document.getElementById("modalImg"),
    modalName: document.getElementById("modalName"),
    modalFormula: document.getElementById("modalFormula"),
    modalTypeBadge: document.getElementById("modalTypeBadge"),
    modalFamilyBadge: document.getElementById("modalFamilyBadge"),
    modalTc: document.getElementById("modalTc"),
    modalHc: document.getElementById("modalHc"),
    modalDesc: document.getElementById("modalDesc"),
    modalApps: document.getElementById("modalApps"),

    // Cryo Lightbox Overlay
    imageLightbox: document.getElementById("imageLightbox"),
    lightboxScrim: document.getElementById("lightboxScrim"),
    lightboxCard: document.getElementById("lightboxCard"),
    closeLightboxBtn: document.getElementById("closeLightboxBtn"),
    lightboxImg: document.getElementById("lightboxImg"),
    lightboxName: document.getElementById("lightboxName"),
    lightboxFormula: document.getElementById("lightboxFormula"),

    // Quiz Elements (3-Stage Experience)
    quizStartStage: document.getElementById("quizStartStage"),
    quizActiveStage: document.getElementById("quizActiveStage"),
    quizCompletedStage: document.getElementById("quizCompletedStage"),
    startQuizBtn: document.getElementById("startQuizBtn"),

    quizProgressBadge: document.getElementById("quizProgressBadge"),
    quizScoreBadge: document.getElementById("quizScoreBadge"),
    quizQuestionText: document.getElementById("quizQuestionText"),
    quizQuestionHint: document.getElementById("quizQuestionHint"),
    quizOptionsContainer: document.getElementById("quizOptionsContainer"),
    quizFeedbackBox: document.getElementById("quizFeedbackBox"),
    nextQuizBtn: document.getElementById("nextQuizBtn"),

    resultScoreText: document.getElementById("resultScoreText"),
    resultPercentageText: document.getElementById("resultPercentageText"),
    resultIcon: document.getElementById("resultIcon"),
    resultTitle: document.getElementById("resultTitle"),
    resultSummaryText: document.getElementById("resultSummaryText"),
    regenerateQuizBtn: document.getElementById("regenerateQuizBtn")
  };

  // ==========================================
  // 3. INITIALIZATION
  // ==========================================
  function init() {
    setupServiceWorker();
    setupTabNavigation();
    setupCatalogControls();
    setupCryoSlider();
    setupCompareMode();
    setupFlashcards();
    setupModal();
    setupQuiz();

    // Initial render
    renderCatalog();
    setQuizStage("start");
  }

  function setupServiceWorker() {
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      navigator.serviceWorker
        .register("./sw.js")
        .then((reg) => {
          console.log("[SUPER_AAY] Offline Service Worker ready:", reg.scope);
        })
        .catch((err) => {
          console.warn("[SUPER_AAY] SW notice:", err);
        });
    }
  }

  // ==========================================
  // 4. TAB NAVIGATION (EXPLORER & QUIZ)
  // ==========================================
  function setupTabNavigation() {
    DOM.bottomDock.addEventListener("click", (e) => {
      const button = e.target.closest(".dock-item");
      if (!button) return;

      const targetTabId = button.getAttribute("data-tab");
      switchTab(targetTabId);
    });
  }

  function switchTab(tabId) {
    state.activeTab = tabId;

    // Update Dock Buttons
    DOM.dockItems.forEach((btn) => {
      const isCurrent = btn.getAttribute("data-tab") === tabId;
      btn.classList.toggle("active", isCurrent);
    });

    // Update Views
    if (tabId === "explorerTab") {
      DOM.explorerTab.style.display = "block";
      if (DOM.flashcardsTab) DOM.flashcardsTab.style.display = "none";
      DOM.quizTab.style.display = "none";
    } else if (tabId === "flashcardsTab") {
      DOM.explorerTab.style.display = "none";
      if (DOM.flashcardsTab) DOM.flashcardsTab.style.display = "block";
      DOM.quizTab.style.display = "none";
      renderFlashcard();
    } else if (tabId === "quizTab") {
      DOM.explorerTab.style.display = "none";
      if (DOM.flashcardsTab) DOM.flashcardsTab.style.display = "none";
      DOM.quizTab.style.display = "block";
      if (state.quiz.stage === "active" && !state.quiz.hasFinished) {
        setQuizStage("active");
      } else if (state.quiz.stage === "completed" && state.quiz.hasFinished) {
        setQuizStage("completed");
      } else {
        setQuizStage("start");
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ==========================================
  // 5. CATALOG SEARCH & CLAY FILTERING
  // ==========================================
  function setupCatalogControls() {
    // Smooth scroll for "Meet the materials." anchor button
    if (DOM.heroScrollBtn) {
      DOM.heroScrollBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.getElementById("materialsShowcase");
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
    }

    // Real-time search
    DOM.searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value.trim().toLowerCase();
      DOM.clearSearchBtn.style.display = state.searchQuery ? "inline-flex" : "none";
      renderCatalog();
    });

    DOM.clearSearchBtn.addEventListener("click", () => {
      DOM.searchInput.value = "";
      state.searchQuery = "";
      DOM.clearSearchBtn.style.display = "none";
      renderCatalog();
      DOM.searchInput.focus();
    });

    // Clay filter pills
    DOM.filterPills.addEventListener("click", (e) => {
      const btn = e.target.closest(".clay-btn");
      if (!btn) return;

      DOM.filterPills.querySelectorAll(".clay-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      state.activeFilter = btn.getAttribute("data-filter");
      renderCatalog();
    });

    // Reset filter button in empty state
    DOM.resetFiltersBtn.addEventListener("click", () => {
      DOM.searchInput.value = "";
      state.searchQuery = "";
      DOM.clearSearchBtn.style.display = "none";

      state.activeFilter = "ALL";
      DOM.filterPills.querySelectorAll(".clay-btn").forEach((b, i) => {
        b.classList.toggle("active", i === 0);
      });

      renderCatalog();
    });
  }

  function getFilteredMaterials() {
    return materials.filter((m) => {
      // 1. Filter Pills
      if (state.activeFilter === "Type-I" && m.Type !== "Type-I") return false;
      if (state.activeFilter === "Type-II" && m.Type !== "Type-II") return false;
      if (state.activeFilter === "Elemental Metal" && m.Family !== "Elemental Metal") return false;
      if (state.activeFilter === "Cuprate" && m.Family !== "Cuprate") return false;
      if (state.activeFilter === "Alloy" && m.Family !== "Metallic Alloy" && m.Family !== "Intermetallic Boride") return false;
      if (state.activeFilter === "Pnictide-Hydride") {
        const famLower = (m.Family || "").toLowerCase();
        if (!famLower.includes("pnictide") && !famLower.includes("hydride")) return false;
      }

      // 2. Real-time Search Query
      if (state.searchQuery) {
        const query = state.searchQuery;
        const idMatch = (m.id || "").toLowerCase().includes(query);
        const nameMatch = m.Name.toLowerCase().includes(query);
        const formulaMatch = m.Formula.toLowerCase().includes(query);
        const familyMatch = m.Family.toLowerCase().includes(query);
        const typeMatch = m.Type.toLowerCase().includes(query);
        const descMatch = m.Description.toLowerCase().includes(query);
        const appMatch = (m.Applications || []).some((a) => a.toLowerCase().includes(query));

        if (!idMatch && !nameMatch && !formulaMatch && !familyMatch && !typeMatch && !descMatch && !appMatch) {
          return false;
        }
      }

      return true;
    });
  }

  function renderCatalog() {
    const list = getFilteredMaterials();

    if (DOM.catalogCountTag) {
      DOM.catalogCountTag.textContent = `${list.length} Curated Specimen${list.length === 1 ? "" : "s"}`;
    }

    if (list.length === 0) {
      DOM.materialGrid.innerHTML = "";
      DOM.emptyCatalogState.style.display = "block";
      return;
    }

    DOM.emptyCatalogState.style.display = "none";
    DOM.materialGrid.innerHTML = list.map((m) => createBentoCardHTML(m)).join("");

    // Attach card event listeners
    DOM.materialGrid.querySelectorAll(".bento-card").forEach((card) => {
      const id = card.getAttribute("data-id");
      const mat = materials.find((item) => item.id === id);
      if (!mat) return;

      card.addEventListener("click", (e) => {
        // Prevent opening detail modal when clicking compare toggle
        if (e.target.closest(".card-compare-btn")) return;
        openDetailModal(mat);
      });

      // Side-by-Side Compare Button Listener
      const compareBtn = card.querySelector(".card-compare-btn");
      if (compareBtn) {
        compareBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          toggleCompareMaterial(mat.id);
        });
      }

      // Handle image fallback gracefully
      const img = card.querySelector("img");
      if (img) {
        img.onerror = () => {
          img.src = SVG_FALLBACK_IMAGES[mat.id] || SVG_FALLBACK_IMAGES.m;
        };
      }
    });
  }

  // Helper: numeric Tc extraction
  function getMaterialTc(m) {
    if (!m || !m["Critical Temperature (K)"]) return 0;
    const match = m["Critical Temperature (K)"].match(/([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  // Helper: required cryogenic coolant classification
  function getRequiredCoolant(mat) {
    const tc = getMaterialTc(mat);
    if (tc >= 250 || mat.id === "ld") {
      return "High-Pressure Hydride (DAC Cryostat)";
    } else if (tc >= 77) {
      return "Liquid Nitrogen (77 K)";
    } else {
      return "Liquid Helium (4.2 K)";
    }
  }

  // Streamlined Minimal Preview Card: Name, Formula, Type/Family, Phase Simulation & Compare Button
  function createBentoCardHTML(m) {
    const typeBadgeClass = m.Type === "Type-I" ? "badge-type1" : "badge-type2";
    const fallbackSrc = SVG_FALLBACK_IMAGES[m.id] || SVG_FALLBACK_IMAGES.m;

    const tc = getMaterialTc(m);
    const isSuperconducting = tc >= state.simulatedTemp;
    const phaseClass = isSuperconducting ? "state-superconducting" : "state-resistive";
    const phaseBadgeHTML = isSuperconducting
      ? `<span class="card-phase-badge badge-super" title="Superconducting at ${state.simulatedTemp} K">⚡ Zero-Resistance (T ≤ ${tc} K)</span>`
      : `<span class="card-phase-badge badge-resist" title="Resistive state at ${state.simulatedTemp} K">Resistive (T > ${tc} K)</span>`;

    const isCompared = state.compareList.includes(m.id);
    const compareSelectedClass = isCompared ? "selected" : "";
    const cardSelectedCompareClass = isCompared ? "card-selected-for-compare" : "";

    return `
      <article class="bento-card preview-card ${phaseClass} ${cardSelectedCompareClass}" data-id="${m.id}" role="button" tabindex="0" aria-label="${escapeHTML(m.Name)} details">
        <button type="button" class="card-compare-btn ${compareSelectedClass}" data-compare-id="${m.id}" aria-label="Compare ${escapeHTML(m.Name)}" title="Select for side-by-side comparison">
          <span class="compare-box-icon">
            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2.5" fill="none">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
          <span>${isCompared ? "Selected" : "Compare"}</span>
        </button>

        <div class="preview-card-inner">
          <div class="material-thumb-frame">
            <img src="${escapeHTML(m.Image)}" alt="${escapeHTML(m.Name)}" loading="lazy" onerror="this.src='${fallbackSrc}'">
          </div>

          <div class="preview-card-content">
            <h3 class="preview-name">${escapeHTML(m.Name)}</h3>
            <div class="preview-formula">${escapeHTML(m.Formula)}</div>
            
            <div class="preview-badge-row">
              <span class="cryo-badge ${typeBadgeClass}">${escapeHTML(m.Type)}</span>
              <span class="cryo-badge badge-family">${escapeHTML(m.Family)}</span>
            </div>

            ${phaseBadgeHTML}
          </div>

          <div class="preview-card-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>
      </article>
    `;
  }

  // ==========================================
  // 6. BENTO DETAIL MODAL / BOTTOM SHEET & LIGHTBOX
  // ==========================================
  let isModalSetup = false;
  function setupModal() {
    if (isModalSetup) return;
    isModalSetup = true;

    DOM.closeModalBtn.addEventListener("click", closeDetailModal);
    DOM.modalScrim.addEventListener("click", closeDetailModal);

    // Lightbox Triggers on Modal Thumbnail
    if (DOM.modalThumbBtn) {
      DOM.modalThumbBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openLightbox();
      });

      DOM.modalThumbBtn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          openLightbox();
        }
      });
    }

    // Dismiss Lightbox via Close Button (Does not close detail modal)
    if (DOM.closeLightboxBtn) {
      DOM.closeLightboxBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        closeLightbox();
      });
    }

    // Dismiss Lightbox by clicking Scrim outside the content card
    if (DOM.lightboxScrim) {
      DOM.lightboxScrim.addEventListener("click", (e) => {
        e.stopPropagation();
        closeLightbox();
      });
    }

    // Mobile Swipe-down gesture on handle
    let startY = 0;
    DOM.sheetDragHandle.addEventListener("touchstart", (e) => {
      startY = e.touches[0].clientY;
    }, { passive: true });

    DOM.sheetDragHandle.addEventListener("touchmove", (e) => {
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      if (deltaY > 0) {
        DOM.detailSheet.style.transform = `translateY(${deltaY}px)`;
      }
    }, { passive: true });

    DOM.sheetDragHandle.addEventListener("touchend", (e) => {
      const endY = e.changedTouches[0].clientY;
      DOM.detailSheet.style.transform = "";
      if (endY - startY > 70) {
        closeDetailModal();
      }
    });

    // Keyboard ESC listener: closes Lightbox first, then Compare Modal, then Detail Modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (isLightboxOpen()) {
          closeLightbox();
        } else if (DOM.compareModal && DOM.compareModal.classList.contains("open")) {
          closeCompareModal();
        } else if (DOM.detailSheet.classList.contains("open")) {
          closeDetailModal();
        }
      }
    });
  }

  function isLightboxOpen() {
    return DOM.imageLightbox && DOM.imageLightbox.classList.contains("open");
  }

  function openLightbox() {
    if (!state.selectedMaterial) return;
    const m = state.selectedMaterial;

    DOM.lightboxName.textContent = m.Name;
    DOM.lightboxFormula.textContent = m.Formula;

    DOM.lightboxImg.src = m.Image;
    DOM.lightboxImg.onerror = () => {
      DOM.lightboxImg.src = SVG_FALLBACK_IMAGES[m.id] || SVG_FALLBACK_IMAGES.m;
    };

    DOM.imageLightbox.classList.add("open");
    DOM.imageLightbox.setAttribute("aria-hidden", "false");
  }

  function closeLightbox() {
    if (!DOM.imageLightbox) return;
    DOM.imageLightbox.classList.remove("open");
    DOM.imageLightbox.setAttribute("aria-hidden", "true");
  }

  function openDetailModal(m) {
    state.selectedMaterial = m;

    DOM.modalName.textContent = m.Name;
    DOM.modalFormula.textContent = m.Formula;
    DOM.modalTypeBadge.textContent = m.Type;
    DOM.modalTypeBadge.className = `cryo-badge ${m.Type === "Type-I" ? "badge-type1" : "badge-type2"}`;
    DOM.modalFamilyBadge.textContent = m.Family;

    DOM.modalTc.textContent = m["Critical Temperature (K)"];
    DOM.modalHc.textContent = m["Critical Magnetic Field"];
    DOM.modalDesc.textContent = m.Description;

    // Image with error fallback
    DOM.modalImg.src = m.Image;
    DOM.modalImg.onerror = () => {
      DOM.modalImg.src = SVG_FALLBACK_IMAGES[m.id] || SVG_FALLBACK_IMAGES.m;
    };

    // Render application pill badges
    DOM.modalApps.innerHTML = (m.Applications || [])
      .map(
        (app) => `
        <span style="display:inline-flex; align-items:center; gap:6px; background:rgba(34, 211, 238, 0.1); border:1px solid rgba(34, 211, 238, 0.25); color:var(--text-main); font-size:0.78rem; font-weight:600; padding:6px 12px; border-radius:9999px;">
          <span style="width:5px; height:5px; border-radius:50%; background:var(--cyan-core);"></span>
          ${escapeHTML(app)}
        </span>
      `
      )
      .join("");

    DOM.modalScrim.classList.add("open");
    DOM.detailSheet.classList.add("open");
  }

  function closeDetailModal() {
    closeLightbox();
    DOM.detailSheet.classList.remove("open");
    DOM.modalScrim.classList.remove("open");
    state.selectedMaterial = null;
  }

  // ==========================================
  // 7. OFFLINE 3-STAGE DYNAMIC QUICK QUIZ ENGINE
  // ==========================================
  function setQuizStage(stage) {
    state.quiz.stage = stage;

    if (DOM.quizStartStage) {
      DOM.quizStartStage.style.display = stage === "start" ? "block" : "none";
    }
    if (DOM.quizActiveStage) {
      DOM.quizActiveStage.style.display = stage === "active" ? "block" : "none";
    }
    if (DOM.quizCompletedStage) {
      DOM.quizCompletedStage.style.display = stage === "completed" ? "block" : "none";
    }
  }

  let isQuizSetup = false;
  function setupQuiz() {
    if (isQuizSetup) return;
    isQuizSetup = true;

    // Stage 1 -> Stage 2: Prominent "Start Quiz" button
    if (DOM.startQuizBtn) {
      DOM.startQuizBtn.addEventListener("click", () => {
        startNewQuiz();
      });
    }

    // Stage 2: Next Question or Finish Button
    if (DOM.nextQuizBtn) {
      DOM.nextQuizBtn.addEventListener("click", () => {
        if (!state.quiz.questions || state.quiz.questions.length === 0) {
          startNewQuiz();
          return;
        }

        // Only allow progression after answering current question
        if (!state.quiz.hasAnswered) {
          return;
        }

        if (state.quiz.currentIndex < state.quiz.questions.length - 1) {
          state.quiz.currentIndex++;
          state.quiz.hasAnswered = false;
          renderQuizQuestion();
        } else {
          renderQuizCompleted();
        }
      });
    }

    // Stage 3 -> Stage 2: "Generate New Questions" launches fresh randomized 5 questions
    if (DOM.regenerateQuizBtn) {
      DOM.regenerateQuizBtn.addEventListener("click", () => {
        startNewQuiz();
      });
    }
  }

  function startNewQuiz() {
    const quizQuestions = generateDynamicQuiz(materials);
    if (!quizQuestions || quizQuestions.length === 0) {
      console.warn("[SUPER_AAY] Unable to generate dynamic quiz questions from dataset.");
      return;
    }
    state.quiz.questions = quizQuestions;
    state.quiz.currentIndex = 0;
    state.quiz.score = 0;
    state.quiz.hasAnswered = false;
    state.quiz.hasFinished = false;
    
    setQuizStage("active");
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    if (!state.quiz.questions || state.quiz.questions.length === 0) {
      startNewQuiz();
      return;
    }

    const qIndex = state.quiz.currentIndex;
    const totalCount = state.quiz.questions.length || 5;
    const currentQ = state.quiz.questions[qIndex];

    if (DOM.quizProgressBadge) {
      DOM.quizProgressBadge.textContent = `Question ${qIndex + 1} of ${totalCount}`;
    }
    if (DOM.quizScoreBadge) {
      DOM.quizScoreBadge.textContent = `Score: ${state.quiz.score} / ${totalCount}`;
    }

    if (DOM.quizQuestionText) {
      DOM.quizQuestionText.textContent = currentQ.question;
    }
    if (DOM.quizQuestionHint) {
      DOM.quizQuestionHint.textContent = currentQ.hint;
    }

    if (DOM.quizFeedbackBox) {
      DOM.quizFeedbackBox.style.display = "none";
    }
    if (DOM.nextQuizBtn) {
      DOM.nextQuizBtn.style.display = "none";
    }
    if (DOM.quizOptionsContainer) {
      DOM.quizOptionsContainer.style.display = "flex";
      DOM.quizOptionsContainer.innerHTML = currentQ.options
        .map(
          (opt, idx) => `
          <button class="clay-btn quiz-option-btn" data-index="${idx}">
            <span class="quiz-option-letter">${String.fromCharCode(65 + idx)}</span>
            <span class="quiz-option-label">${escapeHTML(opt)}</span>
          </button>
        `
        )
        .join("");

      // Attach click events to options
      DOM.quizOptionsContainer.querySelectorAll(".quiz-option-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (state.quiz.hasAnswered) return;
          const selectedIdx = parseInt(btn.getAttribute("data-index"), 10);
          handleQuizAnswer(selectedIdx, currentQ);
        });
      });
    }
  }

  function handleQuizAnswer(selectedIdx, question) {
    state.quiz.hasAnswered = true;
    const isCorrect = selectedIdx === question.correct;
    const totalCount = state.quiz.questions.length || 5;

    if (isCorrect) {
      state.quiz.score++;
    }
    if (DOM.quizScoreBadge) {
      DOM.quizScoreBadge.textContent = `Score: ${state.quiz.score} / ${totalCount}`;
    }

    // Highlight options visually
    const buttons = DOM.quizOptionsContainer.querySelectorAll(".quiz-option-btn");
    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === question.correct) {
        btn.style.background = "linear-gradient(135deg, #14532d, #15803d)";
        btn.style.borderColor = "#22c55e";
        btn.style.color = "#ffffff";
        btn.style.boxShadow = "0 0 14px rgba(34, 197, 94, 0.35)";
        const letter = btn.querySelector(".quiz-option-letter");
        if (letter) {
          letter.style.background = "rgba(255, 255, 255, 0.25)";
          letter.style.color = "#ffffff";
        }
      } else if (idx === selectedIdx && !isCorrect) {
        btn.style.background = "linear-gradient(135deg, #7f1d1d, #b91c1c)";
        btn.style.borderColor = "#ef4444";
        btn.style.color = "#ffffff";
        const letter = btn.querySelector(".quiz-option-letter");
        if (letter) {
          letter.style.background = "rgba(255, 255, 255, 0.25)";
          letter.style.color = "#ffffff";
        }
      }
      btn.style.cursor = "default";
    });

    // Instant Feedback Banner
    if (DOM.quizFeedbackBox) {
      DOM.quizFeedbackBox.style.display = "block";
      if (isCorrect) {
        DOM.quizFeedbackBox.style.background = "rgba(22, 163, 74, 0.12)";
        DOM.quizFeedbackBox.style.border = "1px solid rgba(22, 163, 74, 0.35)";
        DOM.quizFeedbackBox.style.color = "#15803d";
        DOM.quizFeedbackBox.innerHTML = `✓ <strong>Correct!</strong> ${escapeHTML(question.explanation)}`;
      } else {
        DOM.quizFeedbackBox.style.background = "rgba(220, 38, 38, 0.12)";
        DOM.quizFeedbackBox.style.border = "1px solid rgba(220, 38, 38, 0.35)";
        DOM.quizFeedbackBox.style.color = "#b91c1c";
        DOM.quizFeedbackBox.innerHTML = `✕ <strong>Incorrect.</strong> ${escapeHTML(question.explanation)}`;
      }
    }

    // Reveal Next Question Button (Or Finish Button on Question 5)
    if (DOM.nextQuizBtn) {
      DOM.nextQuizBtn.style.display = "inline-flex";
      if (state.quiz.currentIndex === state.quiz.questions.length - 1) {
        DOM.nextQuizBtn.textContent = "Finish & View Results 🎉";
      } else {
        DOM.nextQuizBtn.textContent = "Next Question →";
      }
    }
  }

  function renderQuizCompleted() {
    state.quiz.hasFinished = true;
    setQuizStage("completed");

    const score = state.quiz.score;
    const total = state.quiz.questions.length || 5;
    const percentage = Math.round((score / total) * 100);

    if (DOM.resultScoreText) {
      DOM.resultScoreText.textContent = `${score} / ${total}`;
    }
    if (DOM.resultPercentageText) {
      DOM.resultPercentageText.textContent = `${percentage}% Quantum Mastery`;
    }

    if (DOM.resultIcon) {
      DOM.resultIcon.textContent = percentage === 100 ? "🏆" : percentage >= 60 ? "⚡" : "🔬";
    }

    if (DOM.resultTitle) {
      if (percentage === 100) {
        DOM.resultTitle.textContent = "Quantum Supremacy Achieved!";
      } else if (percentage >= 80) {
        DOM.resultTitle.textContent = "Superconducting Physicist!";
      } else if (percentage >= 60) {
        DOM.resultTitle.textContent = "Solid-State Practitioner!";
      } else {
        DOM.resultTitle.textContent = "Cryogenic Explorer!";
      }
    }

    if (DOM.resultSummaryText) {
      let summaryText = "";
      if (score === 5) {
        summaryText = "Flawless score across critical temperature (Tc) thresholds, Type-I vs. Type-II vortex flux behavior, chemical formulas, and quantum computing detectors.";
      } else if (score >= 3) {
        summaryText = "Impressive performance! You demonstrated a deep understanding of superconductor thermodynamics, alloys, and cuprate applications.";
      } else {
        summaryText = "Solid effort! Revisit the specimen compendium to review Meissner flux exclusion, liquid helium vs. liquid nitrogen boiling points, and hydride clathrates.";
      }
      DOM.resultSummaryText.textContent = summaryText;
    }
  }

  // ==========================================
  // FEATURE 1: INTERACTIVE CRYO-SLIDER (TEMPERATURE PHASE SIMULATOR)
  // ==========================================
  function setupCryoSlider() {
    if (!DOM.cryoTempSlider) return;

    DOM.cryoTempSlider.addEventListener("input", (e) => {
      const temp = parseFloat(e.target.value);
      setSimulatedTemperature(temp);
    });

    if (DOM.presetBtns) {
      DOM.presetBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const temp = parseFloat(btn.getAttribute("data-temp"));
          if (DOM.cryoTempSlider) {
            DOM.cryoTempSlider.value = temp;
          }
          setSimulatedTemperature(temp);
        });
      });
    }

    // Initialize with default 300 K
    setSimulatedTemperature(state.simulatedTemp);
  }

  function setSimulatedTemperature(temp) {
    state.simulatedTemp = temp;

    // Live Kelvin readout
    if (DOM.tempReadoutVal) {
      const displayVal = temp % 1 === 0 ? temp.toFixed(0) : temp.toFixed(1);
      DOM.tempReadoutVal.textContent = `${displayVal} K`;
    }

    // State badge
    if (DOM.tempStateBadge) {
      if (temp === 300) {
        DOM.tempStateBadge.textContent = "Room Temp";
        DOM.tempStateBadge.className = "readout-state-tag";
      } else if (temp <= 0.5) {
        DOM.tempStateBadge.textContent = "Near 0 K (Zero Resistance)";
        DOM.tempStateBadge.className = "readout-state-tag superconducting";
      } else if (temp <= 4.2) {
        DOM.tempStateBadge.textContent = "Liquid Helium (4.2 K)";
        DOM.tempStateBadge.className = "readout-state-tag superconducting";
      } else if (temp <= 77) {
        DOM.tempStateBadge.textContent = "Liquid Nitrogen (77 K)";
        DOM.tempStateBadge.className = "readout-state-tag superconducting";
      } else {
        DOM.tempStateBadge.textContent = "Cryogenic Region";
        DOM.tempStateBadge.className = "readout-state-tag";
      }
    }

    // Preset active buttons
    if (DOM.presetBtns) {
      DOM.presetBtns.forEach((btn) => {
        const btnTemp = parseFloat(btn.getAttribute("data-temp"));
        btn.classList.toggle("active", Math.abs(btnTemp - temp) < 0.1);
      });
    }

    // Live count of zero-resistance materials
    const superCount = materials.filter((m) => getMaterialTc(m) >= temp).length;
    if (DOM.superconductingCountText) {
      DOM.superconductingCountText.textContent = `${superCount} of ${materials.length} Materials in Zero-Resistance State`;
    }
    if (DOM.phasePulseDot) {
      DOM.phasePulseDot.classList.toggle("active-super", superCount > 0);
    }

    // Real-time update on active cards
    if (DOM.materialGrid) {
      DOM.materialGrid.querySelectorAll(".preview-card").forEach((card) => {
        const id = card.getAttribute("data-id");
        const mat = materials.find((m) => m.id === id);
        if (!mat) return;
        const tc = getMaterialTc(mat);
        const isSuper = tc >= temp;
        card.classList.toggle("state-superconducting", isSuper);
        card.classList.toggle("state-resistive", !isSuper);

        const badge = card.querySelector(".card-phase-badge");
        if (badge) {
          badge.className = `card-phase-badge ${isSuper ? "badge-super" : "badge-resist"}`;
          badge.innerHTML = isSuper
            ? `⚡ Zero-Resistance (T ≤ ${tc} K)`
            : `Resistive (T > ${tc} K)`;
          badge.title = isSuper ? `Superconducting at ${temp} K` : `Normal resistive state at ${temp} K`;
        }
      });
    }
  }

  // ==========================================
  // FEATURE 2: SIDE-BY-SIDE COMPARE MODE
  // ==========================================
  function setupCompareMode() {
    if (DOM.clearCompareBtn) {
      DOM.clearCompareBtn.addEventListener("click", clearCompareSelection);
    }

    if (DOM.launchCompareBtn) {
      DOM.launchCompareBtn.addEventListener("click", openCompareModal);
    }

    if (DOM.closeCompareModalBtn) {
      DOM.closeCompareModalBtn.addEventListener("click", closeCompareModal);
    }

    if (DOM.compareScrim) {
      DOM.compareScrim.addEventListener("click", closeCompareModal);
    }

    if (DOM.compareResetBtn) {
      DOM.compareResetBtn.addEventListener("click", () => {
        clearCompareSelection();
        closeCompareModal();
      });
    }

    // Mobile swipe down gesture to close comparison modal
    let startY = 0;
    if (DOM.compareDragHandle) {
      DOM.compareDragHandle.addEventListener("touchstart", (e) => {
        startY = e.touches[0].clientY;
      }, { passive: true });

      DOM.compareDragHandle.addEventListener("touchmove", (e) => {
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;
        if (deltaY > 0 && DOM.compareModal) {
          DOM.compareModal.style.transform = `translateY(${deltaY}px)`;
        }
      }, { passive: true });

      DOM.compareDragHandle.addEventListener("touchend", (e) => {
        const endY = e.changedTouches[0].clientY;
        if (DOM.compareModal) DOM.compareModal.style.transform = "";
        if (endY - startY > 70) {
          closeCompareModal();
        }
      });
    }
  }

  function toggleCompareMaterial(id) {
    const idx = state.compareList.indexOf(id);
    if (idx !== -1) {
      state.compareList.splice(idx, 1);
    } else {
      if (state.compareList.length < 2) {
        state.compareList.push(id);
      } else {
        // Shift oldest and append newly selected
        state.compareList = [state.compareList[1], id];
      }
    }
    updateCompareUI();
  }

  function clearCompareSelection() {
    state.compareList = [];
    updateCompareUI();
  }

  function updateCompareUI() {
    const count = state.compareList.length;

    // Update active cards visually
    if (DOM.materialGrid) {
      DOM.materialGrid.querySelectorAll(".preview-card").forEach((card) => {
        const id = card.getAttribute("data-id");
        const isSelected = state.compareList.includes(id);
        card.classList.toggle("card-selected-for-compare", isSelected);
        const btn = card.querySelector(".card-compare-btn");
        if (btn) {
          btn.classList.toggle("selected", isSelected);
          btn.querySelector("span:last-child").textContent = isSelected ? "Selected" : "Compare";
        }
      });
    }

    // Update floating action bar
    if (DOM.compareActionBar) {
      if (count === 0) {
        DOM.compareActionBar.style.display = "none";
      } else {
        DOM.compareActionBar.style.display = "block";
        if (DOM.compareBadgeCount) {
          DOM.compareBadgeCount.textContent = `${count} / 2`;
        }

        if (count === 1) {
          const m1 = materials.find((m) => m.id === state.compareList[0]);
          if (DOM.compareBarText) {
            DOM.compareBarText.textContent = `Selected: ${m1 ? m1.Name : "1"} — select 1 more to compare`;
          }
          if (DOM.launchCompareBtn) {
            DOM.launchCompareBtn.disabled = true;
            DOM.launchCompareBtn.querySelector("span").textContent = "Select 1 More";
          }
        } else if (count === 2) {
          const m1 = materials.find((m) => m.id === state.compareList[0]);
          const m2 = materials.find((m) => m.id === state.compareList[1]);
          if (DOM.compareBarText) {
            DOM.compareBarText.textContent = `${m1 ? m1.Formula : "Specimen 1"} vs ${m2 ? m2.Formula : "Specimen 2"}`;
          }
          if (DOM.launchCompareBtn) {
            DOM.launchCompareBtn.disabled = false;
            DOM.launchCompareBtn.querySelector("span").textContent = "Compare Selected (2/2)";
          }
        }
      }
    }
  }

  function openCompareModal() {
    if (state.compareList.length < 2) return;
    const matA = materials.find((m) => m.id === state.compareList[0]);
    const matB = materials.find((m) => m.id === state.compareList[1]);
    if (!matA || !matB) return;

    renderCompareTable(matA, matB);

    if (DOM.compareScrim) DOM.compareScrim.classList.add("open");
    if (DOM.compareModal) DOM.compareModal.classList.add("open");
  }

  function closeCompareModal() {
    if (DOM.compareModal) DOM.compareModal.classList.remove("open");
    if (DOM.compareScrim) DOM.compareScrim.classList.remove("open");
  }

  function renderCompareTable(matA, matB) {
    if (!DOM.compareTableContainer) return;

    const tcA = getMaterialTc(matA);
    const tcB = getMaterialTc(matB);
    const coolantA = getRequiredCoolant(matA);
    const coolantB = getRequiredCoolant(matB);

    const fallbackA = SVG_FALLBACK_IMAGES[matA.id] || SVG_FALLBACK_IMAGES.m;
    const fallbackB = SVG_FALLBACK_IMAGES[matB.id] || SVG_FALLBACK_IMAGES.m;

    DOM.compareTableContainer.innerHTML = [matA, matB]
      .map((m, idx) => {
        const tc = idx === 0 ? tcA : tcB;
        const otherTc = idx === 0 ? tcB : tcA;
        const isHigherTc = tc > otherTc;
        const coolant = idx === 0 ? coolantA : coolantB;
        const fallback = idx === 0 ? fallbackA : fallbackB;

        return `
          <div class="compare-col-card">
            <div class="compare-specimen-header">
              <img src="${escapeHTML(m.Image)}" alt="${escapeHTML(m.Name)}" onerror="this.src='${fallback}'">
              <div>
                <span class="cryo-badge ${m.Type === "Type-I" ? "badge-type1" : "badge-type2"}">${escapeHTML(m.Type)}</span>
                <h3 style="font-size:1.15rem; font-weight:800; margin:3px 0 2px 0;">${escapeHTML(m.Name)}</h3>
                <span style="font-family:var(--font-mono); font-size:0.9rem; color:var(--accent-cognac); font-weight:700;">${escapeHTML(m.Formula)}</span>
              </div>
            </div>

            <div class="compare-prop-row">
              <span class="compare-prop-label">Critical Temperature (Tc)</span>
              <span class="compare-prop-val metric-tc-highlight" style="font-size:1.1rem; display:flex; align-items:center; gap:6px;">
                ${escapeHTML(m["Critical Temperature (K)"])}
                ${isHigherTc ? '<span style="font-size:0.68rem; background:rgba(22,163,74,0.12); color:#16a34a; border:1px solid rgba(22,163,74,0.3); padding:2px 6px; border-radius:999px;">Higher Tc</span>' : ""}
              </span>
            </div>

            <div class="compare-prop-row">
              <span class="compare-prop-label">Critical Magnetic Field (Hc)</span>
              <span class="compare-prop-val" style="font-size:0.9rem;">${escapeHTML(m["Critical Magnetic Field"])}</span>
            </div>

            <div class="compare-prop-row">
              <span class="compare-prop-label">Classification &amp; Family</span>
              <span class="compare-prop-val">${escapeHTML(m.Type)} &bull; ${escapeHTML(m.Family)}</span>
            </div>

            <div class="compare-prop-row">
              <span class="compare-prop-label">Required Cryogenic Coolant</span>
              <div class="compare-coolant-badge">${escapeHTML(coolant)}</div>
            </div>

            <div class="compare-prop-row">
              <span class="compare-prop-label">Primary Real-World Applications</span>
              <div style="font-size:0.84rem; color:var(--text-muted); line-height:1.45; margin-top:3px;">
                ${(m.Applications || []).map((a) => `&bull; ${escapeHTML(a)}`).join("<br>")}
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  // ==========================================
  // FEATURE 3: FLASHCARD FLIP DECK (ACTIVE RECALL MODE)
  // ==========================================
  function loadMasteredCards() {
    try {
      const data = localStorage.getItem("super_aay_mastered_materials");
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveMasteredCards(ids) {
    try {
      localStorage.setItem("super_aay_mastered_materials", JSON.stringify(ids));
    } catch (e) {
      console.warn("Storage warning:", e);
    }
  }

  function getActiveFlashcardDeck() {
    if (state.flashcards.filter === "review") {
      const unmastered = materials.filter((m) => !state.flashcards.masteredIds.includes(m.id));
      return unmastered.length > 0 ? unmastered : materials;
    }
    return materials;
  }

  function setupFlashcards() {
    // Card Scene click/tap to flip
    if (DOM.flashcardScene) {
      DOM.flashcardScene.addEventListener("click", () => {
        toggleFlashcardFlip();
      });
      DOM.flashcardScene.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleFlashcardFlip();
        }
      });
    }

    if (DOM.flipCardBtn) {
      DOM.flipCardBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFlashcardFlip();
      });
    }

    if (DOM.prevCardBtn) {
      DOM.prevCardBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        navigateFlashcard(-1);
      });
    }

    if (DOM.nextCardBtn) {
      DOM.nextCardBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        navigateFlashcard(1);
      });
    }

    if (DOM.markMasteredBtn) {
      DOM.markMasteredBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const deck = getActiveFlashcardDeck();
        const currentMat = deck[state.flashcards.currentIndex];
        if (currentMat && !state.flashcards.masteredIds.includes(currentMat.id)) {
          state.flashcards.masteredIds.push(currentMat.id);
          saveMasteredCards(state.flashcards.masteredIds);
        }
        // Advance to next card
        if (state.flashcards.currentIndex < deck.length - 1) {
          navigateFlashcard(1);
        } else {
          renderFlashcard();
        }
      });
    }

    if (DOM.markReviewBtn) {
      DOM.markReviewBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const deck = getActiveFlashcardDeck();
        const currentMat = deck[state.flashcards.currentIndex];
        if (currentMat) {
          const idx = state.flashcards.masteredIds.indexOf(currentMat.id);
          if (idx !== -1) {
            state.flashcards.masteredIds.splice(idx, 1);
            saveMasteredCards(state.flashcards.masteredIds);
          }
        }
        // Advance to next card
        if (state.flashcards.currentIndex < deck.length - 1) {
          navigateFlashcard(1);
        } else {
          renderFlashcard();
        }
      });
    }

    if (DOM.flashcardFilterBtn) {
      DOM.flashcardFilterBtn.addEventListener("click", () => {
        state.flashcards.filter = state.flashcards.filter === "all" ? "review" : "all";
        state.flashcards.currentIndex = 0;
        state.flashcards.isFlipped = false;
        renderFlashcard();
      });
    }

    if (DOM.resetMasteryBtn) {
      DOM.resetMasteryBtn.addEventListener("click", () => {
        state.flashcards.masteredIds = [];
        saveMasteredCards([]);
        state.flashcards.currentIndex = 0;
        state.flashcards.isFlipped = false;
        renderFlashcard();
      });
    }

    // Initial render
    renderFlashcard();
  }

  function toggleFlashcardFlip() {
    state.flashcards.isFlipped = !state.flashcards.isFlipped;
    if (DOM.flashcardElement) {
      DOM.flashcardElement.classList.toggle("is-flipped", state.flashcards.isFlipped);
    }
  }

  function navigateFlashcard(direction) {
    const deck = getActiveFlashcardDeck();
    const nextIdx = state.flashcards.currentIndex + direction;
    if (nextIdx >= 0 && nextIdx < deck.length) {
      state.flashcards.currentIndex = nextIdx;
      state.flashcards.isFlipped = false;
      renderFlashcard();
    }
  }

  function renderFlashcard() {
    const deck = getActiveFlashcardDeck();
    const totalMaterials = materials.length;
    const masteredCount = state.flashcards.masteredIds.length;
    const pct = Math.round((masteredCount / totalMaterials) * 100);

    // Update Mastery Tracker
    if (DOM.masteryCountText) {
      DOM.masteryCountText.textContent = `${masteredCount} / ${totalMaterials} Mastered (${pct}%)`;
    }
    if (DOM.masteryProgressFill) {
      DOM.masteryProgressFill.style.width = `${pct}%`;
    }

    if (DOM.flashcardFilterBtn) {
      const unmasteredCount = totalMaterials - masteredCount;
      DOM.flashcardFilterBtn.querySelector("span").textContent =
        state.flashcards.filter === "all"
          ? `Filter: All (${deck.length})`
          : `Filter: Needs Review (${unmasteredCount})`;
      DOM.flashcardFilterBtn.classList.toggle("active", state.flashcards.filter === "review");
    }

    if (deck.length === 0) return;

    if (state.flashcards.currentIndex >= deck.length) {
      state.flashcards.currentIndex = 0;
    }

    const currentMat = deck[state.flashcards.currentIndex];
    const isMastered = state.flashcards.masteredIds.includes(currentMat.id);

    // Front Face
    if (DOM.cardIndexPill) {
      DOM.cardIndexPill.textContent = `Card ${state.flashcards.currentIndex + 1} of ${deck.length}`;
    }
    if (DOM.cardMasteryChip) {
      DOM.cardMasteryChip.style.display = isMastered ? "inline-block" : "none";
    }
    if (DOM.cardFrontFormula) {
      DOM.cardFrontFormula.textContent = currentMat.Formula;
    }
    if (DOM.cardFrontHint) {
      DOM.cardFrontHint.textContent = `Class: ${currentMat.Family}`;
    }

    // Back Face
    if (DOM.cardBackIndexPill) {
      DOM.cardBackIndexPill.textContent = `Card ${state.flashcards.currentIndex + 1} of ${deck.length}`;
    }
    if (DOM.cardBackTypeBadge) {
      DOM.cardBackTypeBadge.textContent = currentMat.Type;
      DOM.cardBackTypeBadge.className = `cryo-badge ${currentMat.Type === "Type-I" ? "badge-type1" : "badge-type2"}`;
    }
    if (DOM.cardBackImg) {
      DOM.cardBackImg.src = currentMat.Image;
      DOM.cardBackImg.onerror = () => {
        DOM.cardBackImg.src = SVG_FALLBACK_IMAGES[currentMat.id] || SVG_FALLBACK_IMAGES.m;
      };
    }
    if (DOM.cardBackName) {
      DOM.cardBackName.textContent = currentMat.Name;
    }
    if (DOM.cardBackFormula) {
      DOM.cardBackFormula.textContent = currentMat.Formula;
    }
    if (DOM.cardBackTc) {
      DOM.cardBackTc.textContent = currentMat["Critical Temperature (K)"];
    }
    if (DOM.cardBackFamily) {
      DOM.cardBackFamily.textContent = currentMat.Family;
    }
    if (DOM.cardBackApp) {
      const apps = currentMat.Applications && currentMat.Applications.length > 0
        ? currentMat.Applications.join(", ")
        : "Advanced quantum research";
      DOM.cardBackApp.textContent = apps;
    }

    // Flip State
    if (DOM.flashcardElement) {
      DOM.flashcardElement.classList.toggle("is-flipped", state.flashcards.isFlipped);
    }

    // Nav Buttons Disabled States
    if (DOM.prevCardBtn) {
      DOM.prevCardBtn.disabled = state.flashcards.currentIndex === 0;
      DOM.prevCardBtn.style.opacity = state.flashcards.currentIndex === 0 ? "0.4" : "1";
    }
    if (DOM.nextCardBtn) {
      DOM.nextCardBtn.disabled = state.flashcards.currentIndex === deck.length - 1;
      DOM.nextCardBtn.style.opacity = state.flashcards.currentIndex === deck.length - 1 ? "0.4" : "1";
    }
  }

  // ==========================================
  // 8. HELPERS & UTILITIES
  // ==========================================
  function escapeHTML(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Bootstrap when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
