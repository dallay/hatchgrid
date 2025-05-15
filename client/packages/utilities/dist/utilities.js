let S = /* @__PURE__ */ new Map();
class F {
  /** Formats a date as a string according to the locale and format options passed to the constructor. */
  format(r) {
    return this.formatter.format(r);
  }
  /** Formats a date to an array of parts such as separators, numbers, punctuation, and more. */
  formatToParts(r) {
    return this.formatter.formatToParts(r);
  }
  /** Formats a date range as a string. */
  formatRange(r, s) {
    if (typeof this.formatter.formatRange == "function")
      return this.formatter.formatRange(r, s);
    if (s < r) throw new RangeError("End date must be >= start date");
    return `${this.formatter.format(r)} – ${this.formatter.format(s)}`;
  }
  /** Formats a date range as an array of parts. */
  formatRangeToParts(r, s) {
    if (typeof this.formatter.formatRangeToParts == "function")
      return this.formatter.formatRangeToParts(r, s);
    if (s < r) throw new RangeError("End date must be >= start date");
    let f = this.formatter.formatToParts(r), d = this.formatter.formatToParts(s);
    return [
      ...f.map((c) => ({
        ...c,
        source: "startRange"
      })),
      {
        type: "literal",
        value: " – ",
        source: "shared"
      },
      ...d.map((c) => ({
        ...c,
        source: "endRange"
      }))
    ];
  }
  /** Returns the resolved formatting options based on the values passed to the constructor. */
  resolvedOptions() {
    let r = this.formatter.resolvedOptions();
    return Y() && (this.resolvedHourCycle || (this.resolvedHourCycle = Z(r.locale, this.options)), r.hourCycle = this.resolvedHourCycle, r.hour12 = this.resolvedHourCycle === "h11" || this.resolvedHourCycle === "h12"), r.calendar === "ethiopic-amete-alem" && (r.calendar = "ethioaa"), r;
  }
  constructor(r, s = {}) {
    this.formatter = O(r, s), this.options = s;
  }
}
const N = {
  true: {
    // Only Japanese uses the h11 style for 12 hour time. All others use h12.
    ja: "h11"
  },
  false: {}
};
function O(n, r = {}) {
  if (typeof r.hour12 == "boolean" && V()) {
    r = {
      ...r
    };
    let d = N[String(r.hour12)][n.split("-")[0]], c = r.hour12 ? "h12" : "h23";
    r.hourCycle = d ?? c, delete r.hour12;
  }
  let s = n + (r ? Object.entries(r).sort((d, c) => d[0] < c[0] ? -1 : 1).join() : "");
  if (S.has(s)) return S.get(s);
  let f = new Intl.DateTimeFormat(n, r);
  return S.set(s, f), f;
}
let j = null;
function V() {
  return j == null && (j = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: !1
  }).format(new Date(2020, 2, 3, 0)) === "24"), j;
}
let A = null;
function Y() {
  return A == null && (A = new Intl.DateTimeFormat("fr", {
    hour: "numeric",
    hour12: !1
  }).resolvedOptions().hourCycle === "h12"), A;
}
function Z(n, r) {
  if (!r.timeStyle && !r.hour) return;
  n = n.replace(/(-u-)?-nu-[a-zA-Z0-9]+/, ""), n += (n.includes("-u-") ? "" : "-u") + "-nu-latn";
  let s = O(n, {
    ...r,
    timeZone: void 0
    // use local timezone
  }), f = parseInt(s.formatToParts(new Date(2020, 2, 3, 0)).find((c) => c.type === "hour").value, 10), d = parseInt(s.formatToParts(new Date(2020, 2, 3, 23)).find((c) => c.type === "hour").value, 10);
  if (f === 0 && d === 23) return "h23";
  if (f === 24 && d === 23) return "h24";
  if (f === 0 && d === 11) return "h11";
  if (f === 12 && d === 11) return "h12";
  throw new Error("Unexpected hour cycle result");
}
function ue(n, r) {
  const s = r || (typeof navigator < "u" ? navigator.language : void 0) || "en-US", f = new F(s, {
    dateStyle: "long"
  });
  if (!n) return "";
  const d = new Date(n);
  if (Number.isNaN(d.getTime()))
    return "";
  try {
    return f.format(d);
  } catch {
    return s !== "en-US" ? new F("en-US", {
      dateStyle: "long"
    }).format(d) : "";
  }
}
function ie(n = 0, r = /* @__PURE__ */ new Date()) {
  const s = new Date(r), f = s.getDate();
  return s.setDate(1), s.setMonth(s.getMonth() + n), s.setDate(
    Math.min(
      f,
      new Date(s.getFullYear(), s.getMonth() + 1, 0).getDate()
    )
  ), s.toISOString().split("T")[0];
}
function G(n) {
  return n && n.__esModule && Object.prototype.hasOwnProperty.call(n, "default") ? n.default : n;
}
var M = { exports: {} }, J = M.exports, B;
function Q() {
  return B || (B = 1, function(n) {
    (function(r) {
      function s(e, l) {
        var t = (e & 65535) + (l & 65535), h = (e >> 16) + (l >> 16) + (t >> 16);
        return h << 16 | t & 65535;
      }
      function f(e, l) {
        return e << l | e >>> 32 - l;
      }
      function d(e, l, t, h, p, y) {
        return s(f(s(s(l, e), s(h, y)), p), t);
      }
      function c(e, l, t, h, p, y, b) {
        return d(l & t | ~l & h, e, l, p, y, b);
      }
      function m(e, l, t, h, p, y, b) {
        return d(l & h | t & ~h, e, l, p, y, b);
      }
      function g(e, l, t, h, p, y, b) {
        return d(l ^ t ^ h, e, l, p, y, b);
      }
      function v(e, l, t, h, p, y, b) {
        return d(t ^ (l | ~h), e, l, p, y, b);
      }
      function w(e, l) {
        e[l >> 5] |= 128 << l % 32, e[(l + 64 >>> 9 << 4) + 14] = l;
        var t, h, p, y, b, a = 1732584193, o = -271733879, u = -1732584194, i = 271733878;
        for (t = 0; t < e.length; t += 16)
          h = a, p = o, y = u, b = i, a = c(a, o, u, i, e[t], 7, -680876936), i = c(i, a, o, u, e[t + 1], 12, -389564586), u = c(u, i, a, o, e[t + 2], 17, 606105819), o = c(o, u, i, a, e[t + 3], 22, -1044525330), a = c(a, o, u, i, e[t + 4], 7, -176418897), i = c(i, a, o, u, e[t + 5], 12, 1200080426), u = c(u, i, a, o, e[t + 6], 17, -1473231341), o = c(o, u, i, a, e[t + 7], 22, -45705983), a = c(a, o, u, i, e[t + 8], 7, 1770035416), i = c(i, a, o, u, e[t + 9], 12, -1958414417), u = c(u, i, a, o, e[t + 10], 17, -42063), o = c(o, u, i, a, e[t + 11], 22, -1990404162), a = c(a, o, u, i, e[t + 12], 7, 1804603682), i = c(i, a, o, u, e[t + 13], 12, -40341101), u = c(u, i, a, o, e[t + 14], 17, -1502002290), o = c(o, u, i, a, e[t + 15], 22, 1236535329), a = m(a, o, u, i, e[t + 1], 5, -165796510), i = m(i, a, o, u, e[t + 6], 9, -1069501632), u = m(u, i, a, o, e[t + 11], 14, 643717713), o = m(o, u, i, a, e[t], 20, -373897302), a = m(a, o, u, i, e[t + 5], 5, -701558691), i = m(i, a, o, u, e[t + 10], 9, 38016083), u = m(u, i, a, o, e[t + 15], 14, -660478335), o = m(o, u, i, a, e[t + 4], 20, -405537848), a = m(a, o, u, i, e[t + 9], 5, 568446438), i = m(i, a, o, u, e[t + 14], 9, -1019803690), u = m(u, i, a, o, e[t + 3], 14, -187363961), o = m(o, u, i, a, e[t + 8], 20, 1163531501), a = m(a, o, u, i, e[t + 13], 5, -1444681467), i = m(i, a, o, u, e[t + 2], 9, -51403784), u = m(u, i, a, o, e[t + 7], 14, 1735328473), o = m(o, u, i, a, e[t + 12], 20, -1926607734), a = g(a, o, u, i, e[t + 5], 4, -378558), i = g(i, a, o, u, e[t + 8], 11, -2022574463), u = g(u, i, a, o, e[t + 11], 16, 1839030562), o = g(o, u, i, a, e[t + 14], 23, -35309556), a = g(a, o, u, i, e[t + 1], 4, -1530992060), i = g(i, a, o, u, e[t + 4], 11, 1272893353), u = g(u, i, a, o, e[t + 7], 16, -155497632), o = g(o, u, i, a, e[t + 10], 23, -1094730640), a = g(a, o, u, i, e[t + 13], 4, 681279174), i = g(i, a, o, u, e[t], 11, -358537222), u = g(u, i, a, o, e[t + 3], 16, -722521979), o = g(o, u, i, a, e[t + 6], 23, 76029189), a = g(a, o, u, i, e[t + 9], 4, -640364487), i = g(i, a, o, u, e[t + 12], 11, -421815835), u = g(u, i, a, o, e[t + 15], 16, 530742520), o = g(o, u, i, a, e[t + 2], 23, -995338651), a = v(a, o, u, i, e[t], 6, -198630844), i = v(i, a, o, u, e[t + 7], 10, 1126891415), u = v(u, i, a, o, e[t + 14], 15, -1416354905), o = v(o, u, i, a, e[t + 5], 21, -57434055), a = v(a, o, u, i, e[t + 12], 6, 1700485571), i = v(i, a, o, u, e[t + 3], 10, -1894986606), u = v(u, i, a, o, e[t + 10], 15, -1051523), o = v(o, u, i, a, e[t + 1], 21, -2054922799), a = v(a, o, u, i, e[t + 8], 6, 1873313359), i = v(i, a, o, u, e[t + 15], 10, -30611744), u = v(u, i, a, o, e[t + 6], 15, -1560198380), o = v(o, u, i, a, e[t + 13], 21, 1309151649), a = v(a, o, u, i, e[t + 4], 6, -145523070), i = v(i, a, o, u, e[t + 11], 10, -1120210379), u = v(u, i, a, o, e[t + 2], 15, 718787259), o = v(o, u, i, a, e[t + 9], 21, -343485551), a = s(a, h), o = s(o, p), u = s(u, y), i = s(i, b);
        return [a, o, u, i];
      }
      function T(e) {
        var l, t = "", h = e.length * 32;
        for (l = 0; l < h; l += 8)
          t += String.fromCharCode(e[l >> 5] >>> l % 32 & 255);
        return t;
      }
      function $(e) {
        var l, t = [];
        for (t[(e.length >> 2) - 1] = void 0, l = 0; l < t.length; l += 1)
          t[l] = 0;
        var h = e.length * 8;
        for (l = 0; l < h; l += 8)
          t[l >> 5] |= (e.charCodeAt(l / 8) & 255) << l % 32;
        return t;
      }
      function z(e) {
        return T(w($(e), e.length * 8));
      }
      function q(e, l) {
        var t, h = $(e), p = [], y = [], b;
        for (p[15] = y[15] = void 0, h.length > 16 && (h = w(h, e.length * 8)), t = 0; t < 16; t += 1)
          p[t] = h[t] ^ 909522486, y[t] = h[t] ^ 1549556828;
        return b = w(p.concat($(l)), 512 + l.length * 8), T(w(y.concat(b), 640));
      }
      function H(e) {
        var l = "0123456789abcdef", t = "", h, p;
        for (p = 0; p < e.length; p += 1)
          h = e.charCodeAt(p), t += l.charAt(h >>> 4 & 15) + l.charAt(h & 15);
        return t;
      }
      function E(e) {
        return unescape(encodeURIComponent(e));
      }
      function P(e) {
        return z(E(e));
      }
      function K(e) {
        return H(P(e));
      }
      function I(e, l) {
        return q(E(e), E(l));
      }
      function W(e, l) {
        return H(I(e, l));
      }
      function U(e, l, t) {
        return l ? t ? I(l, e) : W(l, e) : t ? P(e) : K(e);
      }
      n.exports ? n.exports = U : r.md5 = U;
    })(J);
  }(M)), M.exports;
}
var X = Q();
const x = /* @__PURE__ */ G(X);
function ee(n) {
  return Array.isArray(n) && (n = n.join("")), x(n);
}
function te(n, r) {
  if (!n)
    throw new Error("Please specify an identifier, such as an email address");
  n.includes("@") && (n = n.toLowerCase().trim());
  const s = new URL("https://gravatar.com/avatar/");
  return s.pathname += ee(n), s.search = new URLSearchParams(r), s.toString();
}
function se(n, r = 100) {
  return te(n.trim(), { size: r });
}
function le(n, r) {
  return n.reduce((s, f, d) => (d % r === 0 ? s.push([f]) : s[s.length - 1].push(f), s), []);
}
function ce(n, r, s) {
  let f;
  return function(...d) {
    f && clearTimeout(f), s && !f && n.apply(this, d), f = setTimeout(() => {
      f = null, s || n.apply(this, d);
    }, r);
  };
}
function fe(n, r) {
  return n.reduce(
    (s, f) => {
      const d = r(f);
      return s[d] || (s[d] = []), s[d].push(f), s;
    },
    {}
  );
}
function de(n) {
  return !n || n.length === 0 ? "" : n.split(" ").map((r) => r[0]).join("");
}
function L(n, r) {
  if (n === r) return !0;
  if (typeof n != "object" || n === null || typeof r != "object" || r === null)
    return !1;
  if (Array.isArray(n) && Array.isArray(r)) {
    if (n.length !== r.length) return !1;
    for (let m = 0; m < n.length; m++)
      if (!L(n[m], r[m])) return !1;
    return !0;
  }
  if (n instanceof Date && r instanceof Date)
    return n.getTime() === r.getTime();
  const s = n, f = r, d = Object.keys(s), c = Object.keys(f);
  if (d.length !== c.length) return !1;
  for (const m of d) {
    if (!c.includes(m)) return !1;
    const g = s[m], v = f[m];
    if (typeof g == "object" && g !== null && typeof v == "object" && v !== null) {
      if (!L(g, v)) return !1;
    } else if (g !== v) return !1;
  }
  return !0;
}
function me(n, r, s) {
  if (r.length !== s.length)
    throw new Error("The number of keys must match the number of orders");
  return [...n].sort((f, d) => {
    for (let c = 0; c < r.length; c++) {
      const m = f[r[c]], g = d[r[c]];
      if (m == null)
        return s[c] === "asc" ? -1 : 1;
      if (g == null || m > g) return s[c] === "asc" ? 1 : -1;
      if (m < g) return s[c] === "asc" ? -1 : 1;
    }
    return 0;
  });
}
function he(n) {
  if (n.length === 0)
    throw new Error("Cannot get random element from an empty array");
  return n[Math.floor(Math.random() * n.length)];
}
function ge(n, r) {
  return Math.floor(Math.random() * (r - n + 1)) + n;
}
const re = [
  "alpha",
  "beta",
  "gamma",
  "delta",
  "epsilon",
  "zeta",
  "eta",
  "theta",
  "iota",
  "kappa",
  "lambda",
  "mu",
  "nu",
  "xi",
  "omicron",
  "pi",
  "rho",
  "sigma",
  "tau",
  "upsilon",
  "phi",
  "chi",
  "psi",
  "omega",
  // Greek alphabet
  "etna",
  "vesuvius",
  "krakatoa",
  "mauna",
  "stromboli",
  "fujiyama",
  "cotopaxi",
  "popocatepetl",
  "kilimanjaro",
  "helens",
  "eyjafjallajokull",
  "tambora",
  "pinatubo",
  "rainier",
  "fuji",
  "lassen",
  "pelee",
  "shasta",
  "hekla",
  "erebus",
  // Famous volcanoes
  "mountain",
  "river",
  "ocean",
  "forest",
  "desert",
  "valley",
  "island",
  "lake",
  "stream",
  "waterfall",
  "cave",
  "cliff",
  "canyon",
  "plateau",
  "prairie",
  "meadow",
  "swamp",
  "tundra",
  "volcano",
  "geyser",
  "reef",
  "bay",
  "gulf",
  "peak",
  "ridge",
  "range",
  "coast",
  "shore",
  "glacier",
  "dune",
  "cove",
  "fjord",
  // Landscape features
  "breeze",
  "horizon",
  "sunset",
  "dawn",
  "twilight",
  "dusk",
  "fog",
  "mist",
  "cloud",
  "rain",
  "storm",
  "thunder",
  "lightning",
  "hail",
  "snow",
  "blizzard",
  "frost",
  "ice",
  "wind",
  "whirlwind",
  "sandstorm",
  "heatwave",
  "mirage",
  "eclipse",
  "cyclone",
  // Weather and atmospheric conditions
  "explore",
  "adventure",
  "journey",
  "quest",
  "voyage",
  "expedition",
  "discovery",
  "wander",
  "trek",
  "travel",
  "path",
  "trail",
  "road",
  "highway",
  "way",
  "passage",
  "bridge",
  "tunnel",
  "route",
  "crossing",
  "navigation",
  "compass",
  "map",
  "landmark",
  "hike",
  // Travel and exploration
  "summit",
  "base",
  "slope",
  "crater",
  "lava",
  "ash",
  "eruption",
  "magma",
  "fumarole",
  "vent",
  "caldera",
  "cone",
  "rift",
  "fault",
  "seismic",
  "tectonic",
  "epicenter",
  "quake",
  "pyroclastic",
  // Volcanic terms
  "flora",
  "fauna",
  "ecosystem",
  "biodiversity",
  "wilderness",
  "habitat",
  "sanctuary",
  "reserve",
  "conservation",
  "endangered",
  "extinct",
  "species",
  "jungle",
  "rainforest",
  "savannah",
  "wetlands",
  "coral",
  "mangrove",
  "algae",
  "biome",
  // Ecology and conservation
  "pinnacle",
  "zenith",
  "apex",
  "climb",
  "ascend",
  "descend",
  "camp",
  "shelter",
  "cabin",
  "tent",
  "gear",
  "backpack",
  "lantern",
  "fire",
  "wood",
  "flame",
  "smoke",
  "torch",
  "bivouac",
  // Mountain climbing and camping
  "beacon",
  "signal",
  "star",
  "moon",
  "planet",
  "galaxy",
  "universe",
  "cosmos",
  "nebula",
  "meteor",
  "comet",
  "orbit",
  "satellite",
  "asteroid",
  "gravity",
  "quasar",
  "supernova",
  "singularity"
  // Astronomy and space
], ne = 2;
function ve(n = re, r = ne) {
  return r <= 0 || n.length === 0 ? "" : Array.from({ length: r }, () => {
    const f = Math.floor(Math.random() * n.length);
    return n[f];
  }).join(" ");
}
function pe(n, r, s = 1) {
  let f = n, d = r;
  d === void 0 && (d = f, f = 0);
  const c = Math.max(Math.ceil((d - f) / s), 0);
  return Array.from({ length: c }, (m, g) => f + g * s);
}
function ye(n, r) {
  const s = n.filter(
    (d, c, m) => r(d, c, m)
  ), f = n.filter(
    (d, c, m) => !r(d, c, m)
  );
  return n.length = 0, n.push(...f), s;
}
function be(n, r) {
  const s = typeof r == "function" ? r : (f) => f[r];
  return [...n].sort((f, d) => {
    const c = s(f), m = s(d);
    return c == null ? -1 : m == null || String(c) > String(m) ? 1 : String(c) < String(m) ? -1 : 0;
  });
}
const k = "theme", C = "dark", _ = "light", ae = (n, r) => n === r || !n && window.matchMedia("(prefers-color-scheme: dark)").matches, oe = (n = k, r = C) => {
  const s = localStorage.getItem(n);
  return ae(s, r);
}, R = "theme-changed";
let D = null;
const we = (n = k, r = C, s = _) => {
  const f = localStorage.getItem(n);
  f === r || !f && window.matchMedia("(prefers-color-scheme: dark)").matches ? (document.documentElement.classList.add(r), localStorage.setItem(n, r)) : (document.documentElement.classList.add(s), localStorage.setItem(n, s)), D && document.removeEventListener(R, D), D = (d) => {
    console.log("🚨 Theme changed", d.detail.isDark);
    const c = d.detail.isDark;
    document.documentElement.classList.toggle(r, c), localStorage.setItem(n, c ? r : s);
  }, document.addEventListener(R, D);
}, De = (n = k, r = C, s = _) => {
  const f = oe(n, r);
  document.documentElement.classList.toggle(r, !f), localStorage.setItem(n, f ? s : r), document.dispatchEvent(
    new CustomEvent(R, { detail: { isDark: !f } })
  );
};
export {
  se as avatar,
  le as chunk,
  ce as debounce,
  ue as formatDate,
  ve as generateRandomWords,
  fe as groupBy,
  de as initials,
  oe as isDarkMode,
  L as isEqual,
  we as loadTheme,
  ie as offsetDate,
  me as orderBy,
  he as randomElement,
  ge as randomNumber,
  pe as range,
  ye as remove,
  be as sortBy,
  De as toggleTheme
};
