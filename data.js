const MATERIALS_DATA = [
  {
    "id": "m",
    "Name": "Mercury",
    "Formula": "Hg",
    "Family": "Elemental Metal",
    "Type": "Type-I",
    "Critical Temperature (K)": "4.15 K",
    "Critical Magnetic Field": "0.041 T (Hc at 0 K)",
    "Description": "The first superconducting material discovered, losing all electrical resistance when cooled with liquid helium.",
    "Applications": [
      "Fundamental physics research",
      "historical benchmarking",
      "lowtemperature cryogenic calibration"
    ],
    "Image": "https://5.imimg.com/data5/AS/UK/MY-78121/mercury-metal-pure-500x500.jpg"
  },
  {
    "id": "l",
    "Name": "Lead",
    "Formula": "Pb",
    "Family": "Elemental Metal",
    "Type": "Type-I",
    "Critical Temperature (K)": "7.20 K",
    "Critical Magnetic Field": "0.080 T (Hc at 0 K)",
    "Description": "A soft, dense post-transition metal with a high critical temperature among ambientpressure elemental superconductors.",
    "Applications": [
      "Magnetic shielding in cryogenic experiments",
      "superconducting solder",
      "Josephson junction electrodes"
    ],
    "Image": "https://upload.wikimedia.org/wikipedia/commons/d/d0/Two_pieces_of_lead%2C_11_grams%2C_1_x_1.5_cm_each.jpg"
  },
  {
    "id": "a",
    "Name": "Aluminum",
    "Formula": "Al",
    "Family": "Elemental Metal",
    "Type": "Type-I",
    "Critical Temperature (K)": "1.18 K",
    "Critical Magnetic Field": "0.0105 T (Hc at 0 K)",
    "Description": "A lightweight elemental metal with a long coherence length, suitable for clean thin-film nanostructures.",
    "Applications": [
      "Superconducting qubits in quantum computers",
      "microwave kinetic inductance detectors",
      "single-electron transistors"
    ],
    "Image": "https://periodictable.com/Samples/013.21/s13.JPG"
  },
  {
    "id": "N",
    "Name": "Niobium",
    "Formula": "Nb",
    "Family": "Elemental Metal",
    "Type": "Type-II",
    "Critical Temperature (K)": "9.25 K",
    "Critical Magnetic Field": "0.4 T (Hc2 at 0 K)",
    "Description": "The pure element with the highest critical temperature and critical magnetic field at ambient pressure.",
    "Applications": [
      "Superconducting radio-frequency cavities in particle accelerators",
      "SQUID magnetometers"
    ],
    "Image": "https://periodictable.com/Samples/041.13/s13.JPG"
  },
  {
    "id": "NT",
    "Name": "Niobium-Titanium",
    "Formula": "NbTi",
    "Family": "Metallic Alloy",
    "Type": "Type-II",
    "Critical Temperature (K)": "9.2 K",
    "Critical Magnetic Field": "14.5 T (Hc2 at 0 K)",
    "Description": "A ductile alloy that can be drawn into fine multifilamentary wires embedded in a copper matrix",
    "Applications": [
      "MRI scanners",
      "NMR spectrometers",
      "particle accelerator magnets"
    ],
    "Image": "https://www.xotmetals.com/wp-content/uploads/2020/10/NbTi-Superconducting-material-XOT-metals-1.jpg"
  },
  {
    "id": "MB",
    "Name": "Magnesium Diboride",
    "Formula": "MgB₂",
    "Family": "Intermetallic Boride",
    "Type": "Type-II",
    "Critical Temperature (K)": "39 K",
    "Critical Magnetic Field": "15-20 T (Hc₂ bulk at 0 K)",
    "Description": "An inexpensive binary compound operating at temperatures achievable with cryocoolers rather than liquid helium. ",
    "Applications": [
      "Liquid-helium-free MRI magnets",
      "superconducting power transmission cables",
      "fault-current limiters"
    ],
    "Image": "https://ueeshop.ly200-cdn.com/u_file/UPAI/UPAI779/2203/photo/729a44ceb4.png"
  },
  {
    "id": "ybco",
    "Name": "Yttrium Barium Copper Oxide",
    "Formula": "YBa₂Cu₃O₇₋ₓ",
    "Family": "Cuprate",
    "Type": "Type-II",
    "Critical Temperature (K)": "92 K",
    "Critical Magnetic Field": "120-250 T (Hc₂ at 0 K)",
    "Description": "A high-temperature ceramic superconductor and the first material discovered to superconduct above the boiling point of liquid nitrogen",
    "Applications": [
      "Magnetic levitation",
      "superconducting cables",
      "high-field magnets"
    ],
    "Image": "https://angpacmin.com/wp-content/uploads/2025/02/x2i7lcy8i04a1.gif"
  },
  {
    "id": "bscco",
    "Name": "Bismuth Strontium Calcium Copper Oxide",
    "Formula": "Bi₂Sr₂Ca₂Cu₃O₁₀",
    "Family": "Cuprate",
    "Type": "Type-II",
    "Critical Temperature (K)": "108 K",
    "Critical Magnetic Field": ">100 T (Hc₂ at 0 K)",
    "Description": "A layered cuprate ceramic processed into flexible silversheathed multifilamentary tapes.",
    "Applications": [
      "Underground superconducting power cables",
      "high-current cryogenic leads",
      "high-field magnet inserts"
    ],
    "Image": "https://cdn11.bigcommerce.com/s-i40qayioty/images/stencil/1280x1280/products/152/1786/BSCCO_crystal__78434.1754239619.png"
  },
  {
    "id": "lfao",
    "Name": "Lanthanum Ferric Arsenide Oxide",
    "Formula": "LaFeAsO₁₋ₓFₓ",
    "Family": "Iron-Based (Pnictide)",
    "Type": "Type-II",
    "Critical Temperature (K)": "26 K",
    "Critical Magnetic Field": "60-100 T (Hc₂ at 0 K)",
    "Description": "A layered iron-pnictide superconductor exhibiting high upper critical fields and low magnetic anisotropy.",
    "Applications": [
      "Unconventional pairing mechanism research",
      "high-field wire development"
    ],
    "Image": "https://www.chemtube3d.com/wp-content/uploads/2024/03/i830fg19.png"
  },
  {
    "id": "ld",
    "Name": "Lanthanum Decahydride",
    "Formula": "LaH₁₀",
    "Family": "Superhydride (Clathrate)",
    "Type": "Type-II",
    "Critical Temperature (K)": "250 K",
    "Critical Magnetic Field": "130-160 T (Hc₂ at 0 K)",
    "Description": "A hydrogen-rich clathrate compound stabilized under extreme diamond-anvil-cell pressures to achieve near-room temperature superconductivity.",
    "Applications": [
      "High-pressure condensed matter physics research",
      "ambient-pressure superconductor discovery modeling"
    ],
    "Image": "https://www.acs.org/adobe/dynamicmedia/deliver/dm-aid--4aa77dff-3fed-4fe0-b8d6-7cc69915e1b8/lanthanum-decahydride-3d.png.webp"
  }
];

// Global availability for browsers, WebViews/Capacitor, and modules
if (typeof window !== "undefined") {
  window.MATERIALS_DATA = MATERIALS_DATA;
}
if (typeof global !== "undefined") {
  global.MATERIALS_DATA = MATERIALS_DATA;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = MATERIALS_DATA;
}
