export const KOALICJA_OBYWATELSKA = "koalicja-obywatelska";
export const PRAWO_I_SPRAWIEDLIWOSC = "prawo-i-sprawiedliwosc";
export const KONFEDERACJA = "konfederacja";
export const LEWICA = "lewica";
export const PSL = "psl";
export const PLACEHOLDER_PARTY = "placeholder-party";
export const DEFAULT_BO_PARTY = PLACEHOLDER_PARTY;
export const DEFAULT_FO_PARTY = KONFEDERACJA;
export const DEFAULT_MAX_SOURCE_COUNT = 5;

import logoKO from "./../images/logo_ko.png";
import logoKOWhite from "./../images/logo_ko_white.png";
import logoKonf from "./../images/logo_konf.png";
import logoKonfWhite from "./../images/logo_konf_white.png";
// import logoPIS from "./../images/logo_pis.png";
// import logoPISWhite from "./../images/logo_pis_white.png";
import logoLewica from "./../images/logo_lewica.png";
import logoLewicaWhite from "./../images/logo_lewica_white.png";
import logoPSL from "./../images/logo_psl.png";
import logoPSLWhite from "./../images/logo_psl_white.png";

import type { Party } from "./types";

export const CACHE_MONGO_COLLECTION = "cache";
export const CONTEXT_DOCS_MONGO_COLLECTION = "contextDocs";
export const MONGO_DB = "wyborczyDb";

export const CONTEXT_DOCS_CHROMA_COLLECTION = "contextDocs";

export const placeholderPartyMap = {
  [PLACEHOLDER_PARTY]: {
    name: PLACEHOLDER_PARTY,
    logo: { light: logoKO, dark: logoKOWhite },
    id: PLACEHOLDER_PARTY as Party,
  },
};

export const partyMap = {
  // [KOALICJA_OBYWATELSKA]: {
  //   name: "Koalicja Obywatelska",
  //   logo: { light: logoKO, dark: logoKOWhite },
  //   id: KOALICJA_OBYWATELSKA as Party,
  // },
  [KONFEDERACJA]: {
    name: "Konfederacja",
    logo: { light: logoKonf, dark: logoKonfWhite },
    id: KONFEDERACJA as Party,
  },
  // [PRAWO_I_SPRAWIEDLIWOSC]: {
  //   name: "Prawo i Sprawiedliwość",
  //   logo: { light: logoPIS, dark: logoPISWhite },
  //   id: PRAWO_I_SPRAWIEDLIWOSC as Party,
  // },
  [LEWICA]: {
    name: "Lewica",
    logo: { light: logoLewica, dark: logoLewicaWhite },
    id: LEWICA as Party,
  },
  [PSL]: {
    name: "Polskie Stronnictwo Ludowe",
    logo: { light: logoPSL, dark: logoPSLWhite },
    id: PSL as Party,
  },
};
