// 공개 페이지: 활동 기록과 기부금 내역을 Supabase에서 읽어 보여줍니다 (읽기 전용)
(function () {
  var cfg = window.SITE_CONFIG;
  var logList = document.getElementById("log-list");
  var donRows = document.getElementById("don-rows");

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function won(n) { return Number(n || 0).toLocaleString("ko-KR"); }
  function wonHtml(target, n) {
    target.textContent = won(n);
    target.appendChild(el("small", null, "원"));
  }
  function dot(d) { return String(d).replace(/-/g, "."); }
  function tagFor(key) {
    var s = cfg && cfg.services[key];
    if (!s) return null;
    return el("span", "tag c-" + s.color, s.tag);
  }
  function showEmpty(list, text, isTable) {
    list.textContent = "";
    if (isTable) {
      var tr = el("tr"); var td = el("td", "empty", text); td.colSpan = 5; tr.appendChild(td); list.appendChild(tr);
    } else {
      list.appendChild(el("li", "empty", text));
    }
  }

  if (!cfg || !window.supabase) {
    if (logList) showEmpty(logList, "활동 기록은 사이트에서 볼 수 있습니다.");
    if (donRows) showEmpty(donRows, "기부금 내역은 사이트에서 볼 수 있습니다.", true);
    return;
  }
  var db = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, { auth: { persistSession: false } });

  // ---------- 후원 계좌 ----------
  function showAccount(a) {
    var acct = document.getElementById("don-account");
    if (!acct || !a || !a.bank || !a.number) return;
    acct.textContent = "";
    acct.appendChild(el("span", "acct", a.bank + " " + a.number));
    if (a.holder) acct.appendChild(document.createTextNode(" (예금주: " + a.holder + ")"));
  }
  showAccount(cfg.donationAccount);

  // ---------- 관리자가 고친 사이트 문구 적용 ----------
  if (window.SiteContent) {
    db.from("site_content").select("key, value").then(function (res) {
      if (res.error || !res.data || !res.data.length) return;
      var data = window.SiteContent.rowsToData(res.data);
      window.SiteContent.applyAll(document, data);
      var slogan = document.querySelector(".slogan");
      if (slogan) slogan.setAttribute("aria-label", Array.prototype.map.call(slogan.children, function (s) { return s.textContent; }).join(", "));
      if (data.donation && data.donation.account) showAccount(data.donation.account);
      // 사업 이름표가 바뀌었으면 활동 기록 태그·버튼에도 반영
      if (data.services) {
        Object.keys(cfg.services).forEach(function (k) {
          var s = data.services[k]; if (!s) return;
          if (s.tag) cfg.services[k].tag = s.tag;
          if (s.name) cfg.services[k].name = s.name;
          var chip = document.querySelector('.chip[data-filter="' + k + '"]'); if (chip && s.tag) chip.textContent = s.tag;
        });
        if (typeof renderLog === "function" && all.length) renderLog();
        if (typeof renderDonation === "function" && expenses.length) renderDonation();
      }
    });
  }

  // ---------- 사업 대표 사진 (관리자가 올린 사진이 있으면 카드 사진을 바꿈) ----------
  db.from("service_covers").select("service, photo_path, alt").then(function (res) {
    if (res.error || !res.data) return;
    res.data.forEach(function (c) {
      var art = document.querySelector('li[data-service="' + c.service + '"] .svc-art');
      if (!art) return;
      var img = el("img"); img.alt = c.alt || ""; // lazy 금지: 화면에 붙이기 전이라 lazy면 영영 안 불러옴
      img.src = db.storage.from(cfg.photoBucket).getPublicUrl(c.photo_path).data.publicUrl;
      img.onload = function () { art.textContent = ""; art.appendChild(img); };
    });
  });

  // ---------- 활동 기록 ----------
  var PAGE = 6;
  var all = [], filter = "all", shown = PAGE;
  var moreBtn = document.getElementById("log-more");

  function photoUrl(path) {
    return db.storage.from(cfg.photoBucket).getPublicUrl(path).data.publicUrl;
  }
  function renderLog() {
    var items = all.filter(function (r) { return filter === "all" || r.service === filter; });
    logList.textContent = "";
    if (!items.length) {
      showEmpty(logList, filter === "all" ? "아직 등록된 활동 기록이 없습니다." : "이 사업의 활동 기록이 아직 없습니다.");
      moreBtn.hidden = true;
      return;
    }
    items.slice(0, shown).forEach(function (r) {
      var li = el("li", "log-item");
      if (r.photo_path) {
        var img = el("img"); img.src = photoUrl(r.photo_path); img.alt = r.title; img.loading = "lazy";
        li.appendChild(img);
      }
      var inn = el("div", "in");
      var meta = el("div", "meta");
      var t = tagFor(r.service); if (t) meta.appendChild(t);
      meta.appendChild(el("time", null, dot(r.activity_date)));
      inn.appendChild(meta);
      inn.appendChild(el("h4", null, r.title));
      if (r.body) inn.appendChild(el("p", null, r.body));
      li.appendChild(inn);
      logList.appendChild(li);
    });
    moreBtn.hidden = items.length <= shown;
  }
  function setFilter(f) {
    filter = f; shown = PAGE;
    document.querySelectorAll(".chip").forEach(function (c) { c.classList.toggle("is-on", c.dataset.filter === f); });
    renderLog();
  }
  document.querySelectorAll(".chip").forEach(function (c) {
    c.addEventListener("click", function () { setFilter(c.dataset.filter); });
  });
  document.querySelectorAll(".svc-log").forEach(function (b) {
    b.addEventListener("click", function () {
      setFilter(b.dataset.service);
      document.getElementById("activity-log").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  moreBtn.addEventListener("click", function () { shown += PAGE; renderLog(); });

  db.from("activities").select("id, service, activity_date, title, body, photo_path")
    .order("activity_date", { ascending: false }).order("id", { ascending: false }).limit(200)
    .then(function (res) {
      if (res.error) { showEmpty(logList, "활동 기록을 불러오지 못했습니다. 잠시 후 다시 열어주세요."); return; }
      all = res.data || []; renderLog();
    });

  // ---------- 기부금 ----------
  var yearSel = document.getElementById("don-year-select");
  var totals = [], expenses = [];

  function renderDonation() {
    var y = Number(yearSel.value);
    var inSum = totals.filter(function (t) { return t.year === y; }).reduce(function (s, t) { return s + Number(t.total); }, 0);
    var rows = expenses.filter(function (e) { return Number(String(e.spent_on).slice(0, 4)) === y; });
    var outSum = rows.reduce(function (s, e) { return s + Number(e.amount); }, 0);
    wonHtml(document.getElementById("don-in"), inSum);
    wonHtml(document.getElementById("don-out"), outSum);
    wonHtml(document.getElementById("don-left"), inSum - outSum);
    donRows.textContent = "";
    if (!rows.length) { showEmpty(donRows, y + "년 사용 내역이 아직 없습니다.", true); return; }
    rows.forEach(function (e) {
      var tr = el("tr");
      tr.appendChild(el("td", null, dot(e.spent_on)));
      tr.appendChild(el("td", null, e.payee));
      tr.appendChild(el("td", null, e.purpose));
      var td = el("td"); var t = tagFor(e.service); td.appendChild(t || document.createTextNode("—")); tr.appendChild(td);
      tr.appendChild(el("td", "amt", won(e.amount) + "원"));
      donRows.appendChild(tr);
    });
  }

  Promise.all([
    db.rpc("donation_receipt_totals"),
    db.from("donation_expenses").select("spent_on, amount, payee, purpose, service")
      .order("spent_on", { ascending: false }).order("id", { ascending: false }).limit(1000)
  ]).then(function (r) {
    if (r[0].error || r[1].error) { showEmpty(donRows, "기부금 내역을 불러오지 못했습니다. 잠시 후 다시 열어주세요.", true); return; }
    totals = r[0].data || []; expenses = r[1].data || [];
    var years = {};
    years[new Date().getFullYear()] = 1;
    totals.forEach(function (t) { years[t.year] = 1; });
    expenses.forEach(function (e) { years[String(e.spent_on).slice(0, 4)] = 1; });
    Object.keys(years).map(Number).sort(function (a, b) { return b - a; }).forEach(function (y) {
      var o = el("option", null, y + "년"); o.value = y; yearSel.appendChild(o);
    });
    yearSel.addEventListener("change", renderDonation);
    renderDonation();
  });
})();
