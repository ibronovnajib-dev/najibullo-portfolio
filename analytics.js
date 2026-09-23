(() => {
  const cfg = window.PORTFOLIO_CONFIG || {};
  const analytics = cfg.analytics || {};
  const respectDNT = navigator.doNotTrack === "1" || window.doNotTrack === "1";
  const enabled = !respectDNT && Boolean(analytics.cloudflareBeaconToken || analytics.ga4Id || analytics.endpoint);

  const safeSend = (payload) => {
    if (!enabled) return;
    if (analytics.endpoint) {
      try {
        const body = JSON.stringify(payload);
        if (navigator.sendBeacon) {
          navigator.sendBeacon(analytics.endpoint, new Blob([body], {type:"application/json"}));
        } else {
          fetch(analytics.endpoint, {method:"POST", headers:{"content-type":"application/json"}, body, keepalive:true}).catch(()=>{});
        }
      } catch {}
    }
    if (analytics.ga4Id && window.gtag) {
      const {name, ...params} = payload;
      window.gtag("event", name, params);
    }
  };

  window.trackPortfolioEvent = (name, detail={}) => safeSend({
    name,
    ...detail,
    path: location.pathname,
    lang: document.documentElement.lang || "en",
    ts: Date.now()
  });

  if (!respectDNT && analytics.cloudflareBeaconToken) {
    const s = document.createElement("script");
    s.defer = true;
    s.src = "https://static.cloudflareinsights.com/beacon.min.js";
    s.dataset.cfBeacon = JSON.stringify({token: analytics.cloudflareBeaconToken});
    document.head.appendChild(s);
  }

  if (!respectDNT && analytics.ga4Id) {
    const g = document.createElement("script");
    g.async = true;
    g.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analytics.ga4Id)}`;
    document.head.appendChild(g);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ dataLayer.push(arguments); };
    gtag("js", new Date());
    gtag("config", analytics.ga4Id, {anonymize_ip:true});
  }

  const vitals = {};
  const emitVitals = () => {
    if (!Object.keys(vitals).length) return;
    safeSend({name:"web_vitals", ...vitals, path:location.pathname, lang:document.documentElement.lang || "en", ts:Date.now()});
  };

  if ("PerformanceObserver" in window) {
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) vitals.lcp = Math.round(last.startTime);
      }).observe({type:"largest-contentful-paint", buffered:true});
    } catch {}
    try {
      let cls = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) if (!e.hadRecentInput) cls += e.value;
        vitals.cls = Number(cls.toFixed(4));
      }).observe({type:"layout-shift", buffered:true});
    } catch {}
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (!vitals.inp || e.duration > vitals.inp) vitals.inp = Math.round(e.duration);
        }
      }).observe({type:"event", buffered:true, durationThreshold:40});
    } catch {}
  }

  addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") emitVitals();
  });
})();
