// 관리자 페이지: 이메일 로그인 링크로 로그인하고, 활동 기록·기부금 내역을 쓰고 고치고 지웁니다.
// 쓰기 권한은 데이터베이스가 관리자 명단(admins)으로 한 번 더 확인합니다.
(function () {
  var cfg = window.SITE_CONFIG;
  var db = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey);
  var $ = function (id) { return document.getElementById(id); };

  // ---------- 공통 ----------
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function won(n) { return Number(n || 0).toLocaleString("ko-KR") + "원"; }
  function dot(d) { return String(d).replace(/-/g, "."); }
  function today() {
    var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }
  var toastTimer;
  function toast(msg, isErr) {
    var t = $("toast"); t.textContent = msg; t.className = "toast" + (isErr ? " err" : ""); t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 3500);
  }
  function fail(what, error) {
    console.error(what, error);
    toast(what + "에 실패했습니다. " + (error && error.message ? "(" + error.message + ")" : "잠시 후 다시 시도해 주세요."), true);
  }
  function show(view) {
    ["v-loading", "v-login", "v-denied", "v-app"].forEach(function (v) { $(v).hidden = v !== view; });
  }
  function tagFor(key) {
    var s = cfg.services[key];
    return s ? el("span", "tag c-" + s.color, s.tag) : null;
  }
  // 삭제는 두 번 눌러야 실행 (첫 번째 누름 후 4초 안에 다시)
  function deleteButton(onConfirm, label) {
    label = label || "삭제";
    var b = el("button", "btn danger small", label); b.type = "button";
    var timer;
    b.addEventListener("click", function () {
      if (!b.classList.contains("armed")) {
        b.classList.add("armed"); b.textContent = "정말 삭제";
        timer = setTimeout(function () { b.classList.remove("armed"); b.textContent = label; }, 4000);
        return;
      }
      clearTimeout(timer); b.disabled = true; onConfirm();
    });
    return b;
  }
  function editButton(onClick) {
    var b = el("button", "btn ghost small", "수정"); b.type = "button";
    b.addEventListener("click", onClick);
    return b;
  }
  function byLine(r) {
    var who = r.updated_by || r.created_by;
    return who ? "기록: " + who : "";
  }

  // 사업 선택 목록 채우기
  Object.keys(cfg.services).forEach(function (k) {
    var o1 = el("option", null, cfg.services[k].name); o1.value = k; $("act-service").appendChild(o1);
    var o2 = el("option", null, cfg.services[k].name); o2.value = k; $("exp-service").appendChild(o2);
  });

  // ---------- 탭 ----------
  document.querySelectorAll(".tabs button").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".tabs button").forEach(function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); });
      document.querySelectorAll("[data-pane]").forEach(function (p) { p.hidden = p.dataset.pane !== b.dataset.tab; });
    });
  });

  // ---------- 로그인 ----------
  $("login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = $("login-btn"); btn.disabled = true;
    db.auth.signInWithOtp({
      email: $("login-email").value.trim().toLowerCase(),
      options: { emailRedirectTo: location.origin + location.pathname }
    }).then(function (res) {
      btn.disabled = false;
      if (res.error) { fail("로그인 링크 보내기", res.error); return; }
      $("login-sent").hidden = false;
    });
  });
  function logout() { db.auth.signOut().then(function () { location.reload(); }); }
  $("logout").addEventListener("click", logout);
  $("denied-logout").addEventListener("click", logout);

  var started = false;
  function onSession(session) {
    if (!session) { $("who").textContent = ""; $("logout").hidden = true; show("v-login"); return; }
    $("who").textContent = session.user.email; $("logout").hidden = false;
    db.rpc("is_admin").then(function (res) {
      if (res.error || !res.data) { show("v-denied"); return; }
      show("v-app");
      if (!started) { started = true; loadActivities(); loadReceipts(); loadExpenses(); loadCovers(); }
    });
  }
  db.auth.onAuthStateChange(function (event, session) {
    // 콜백 안에서 바로 DB를 부르면 멈출 수 있어 한 박자 늦춰 실행 (Supabase 권장)
    if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "SIGNED_OUT") setTimeout(function () { onSession(session); }, 0);
  });

  // ---------- 사진 줄이기 (긴 쪽 1600px, JPEG로 다시 저장하며 GPS 등 촬영 정보 제거) ----------
  function shrinkPhoto(file) {
    return new Promise(function (resolve, reject) {
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var max = 1600, w = img.naturalWidth, h = img.naturalHeight, s = Math.min(1, max / Math.max(w, h));
        var c = document.createElement("canvas"); c.width = Math.round(w * s); c.height = Math.round(h * s);
        var g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) { b ? resolve(b) : reject(new Error("사진 변환 실패")); }, "image/jpeg", 0.85);
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("사진을 열 수 없습니다")); };
      img.src = url;
    });
  }
  function photoUrl(path) { return db.storage.from(cfg.photoBucket).getPublicUrl(path).data.publicUrl; }

  // ---------- 활동 기록 ----------
  var actEditing = null;
  $("act-date").value = today();
  $("act-photo").addEventListener("change", function () {
    var has = this.files.length > 0;
    $("act-consent-wrap").hidden = !has; $("act-consent").required = has; if (!has) $("act-consent").checked = false;
  });
  function resetActForm() {
    actEditing = null; $("act-form").reset(); $("act-date").value = today();
    $("act-form-title").textContent = "활동 기록 쓰기"; $("act-cancel").hidden = true;
    $("act-photo-now").hidden = true; $("act-consent-wrap").hidden = true; $("act-consent").required = false;
  }
  $("act-cancel").addEventListener("click", resetActForm);

  function loadActivities() {
    db.from("activities").select("*").order("activity_date", { ascending: false }).order("id", { ascending: false })
      .then(function (res) {
        var list = $("act-list"); list.textContent = "";
        if (res.error) { fail("활동 기록 불러오기", res.error); return; }
        $("act-sum").textContent = "총 " + res.data.length + "건";
        if (!res.data.length) { list.appendChild(el("li", "empty", "아직 활동 기록이 없습니다. 왼쪽에서 첫 기록을 써보세요.")); return; }
        res.data.forEach(function (r) {
          var li = el("li");
          if (r.photo_path) { var im = el("img"); im.src = photoUrl(r.photo_path); im.alt = ""; li.appendChild(im); }
          var m = el("div", "main"), top = el("div", "top");
          var t = tagFor(r.service); if (t) top.appendChild(t);
          top.appendChild(el("span", null, dot(r.activity_date)));
          m.appendChild(top); m.appendChild(el("div", "title", r.title)); m.appendChild(el("div", "by", byLine(r)));
          li.appendChild(m);
          var acts = el("div", "acts");
          acts.appendChild(editButton(function () {
            actEditing = r;
            $("act-service").value = r.service; $("act-date").value = r.activity_date;
            $("act-title").value = r.title; $("act-body").value = r.body || "";
            $("act-photo").value = ""; $("act-consent-wrap").hidden = true; $("act-consent").required = false;
            $("act-photo-now").hidden = !r.photo_path; $("act-photo-remove").checked = false;
            if (r.photo_path) $("act-photo-img").src = photoUrl(r.photo_path);
            $("act-form-title").textContent = "활동 기록 고치기"; $("act-cancel").hidden = false;
            window.scrollTo({ top: 0, behavior: "smooth" });
          }));
          acts.appendChild(deleteButton(function () {
            db.from("activities").delete().eq("id", r.id).then(function (res) {
              if (res.error) { fail("삭제", res.error); loadActivities(); return; }
              if (r.photo_path) db.storage.from(cfg.photoBucket).remove([r.photo_path]);
              if (actEditing && actEditing.id === r.id) resetActForm();
              toast("삭제했습니다."); loadActivities();
            });
          }));
          li.appendChild(acts);
          list.appendChild(li);
        });
      });
  }

  $("act-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = $("act-save"); btn.disabled = true; btn.textContent = "저장하는 중…";
    var file = $("act-photo").files[0];
    var oldPath = actEditing ? actEditing.photo_path : null;
    var row = {
      service: $("act-service").value, activity_date: $("act-date").value,
      title: $("act-title").value.trim(), body: $("act-body").value.trim()
    };
    var upload = Promise.resolve(undefined);
    if (file) {
      upload = shrinkPhoto(file).then(function (blob) {
        var path = row.service + "/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + ".jpg";
        return db.storage.from(cfg.photoBucket).upload(path, blob, { contentType: "image/jpeg" }).then(function (res) {
          if (res.error) throw res.error;
          return path;
        });
      });
    } else if (actEditing && $("act-photo-remove").checked) {
      upload = Promise.resolve(null);
    }
    upload.then(function (newPath) {
      if (newPath !== undefined) row.photo_path = newPath;
      var q = actEditing ? db.from("activities").update(row).eq("id", actEditing.id) : db.from("activities").insert(row);
      return q.then(function (res) {
        if (res.error) {
          if (newPath) db.storage.from(cfg.photoBucket).remove([newPath]);
          throw res.error;
        }
        if (newPath !== undefined && oldPath && oldPath !== newPath) db.storage.from(cfg.photoBucket).remove([oldPath]);
        toast(actEditing ? "고쳤습니다." : "저장했습니다. 사이트에 바로 보입니다.");
        resetActForm(); loadActivities();
      });
    }).catch(function (err) { fail("저장", err); })
      .then(function () { btn.disabled = false; btn.textContent = "저장"; });
  });

  // ---------- 사업 사진 (주요사업 카드 대표 사진) ----------
  function heartSvg() {
    var ns = "http://www.w3.org/2000/svg", s = document.createElementNS(ns, "svg"), p = document.createElementNS(ns, "path");
    s.setAttribute("viewBox", "0 0 100 80"); s.setAttribute("aria-hidden", "true");
    p.setAttribute("d", "M0 30 30 0 50 20 70 0 100 30 50 80Z"); p.setAttribute("fill", "#fff"); s.appendChild(p);
    return s;
  }
  function loadCovers() {
    db.from("service_covers").select("*").then(function (res) {
      if (res.error) { fail("사업 사진 불러오기", res.error); return; }
      var byService = {}; res.data.forEach(function (c) { byService[c.service] = c; });
      var wrap = $("cov-list"); wrap.textContent = "";
      Object.keys(cfg.services).forEach(function (key) { wrap.appendChild(coverCard(key, cfg.services[key], byService[key])); });
    });
  }
  function coverCard(key, svc, cover) {
    var card = el("div", "cover c-" + svc.color);
    var art = el("div", "art");
    if (cover || svc.defaultPhoto) {
      var im = el("img"); im.alt = ""; im.src = cover ? photoUrl(cover.photo_path) : svc.defaultPhoto; art.appendChild(im);
    } else {
      art.appendChild(heartSvg());
    }
    card.appendChild(art);

    var f = el("form"); var uid = "cov-" + key;
    var head = el("div", "top"); head.appendChild(el("span", "tag", svc.tag));
    head.appendChild(el("b", null, svc.name)); f.appendChild(head);
    f.appendChild(el("div", "state", cover ? "관리자가 올린 사진 · 기록: " + (cover.updated_by || cover.created_by || "")
      : (svc.defaultPhoto ? "기본 사진 (흐림 처리된 사진)" : "사진 없음 · 색 블록으로 보임")));

    var altL = el("label", null, "사진 설명 (화면을 읽어주는 기능용)");
    var alt = el("input"); alt.type = "text"; alt.maxLength = 150; alt.id = uid + "-alt";
    alt.placeholder = "예: 방학 마을급식으로 차린 점심 한 상"; alt.value = cover ? cover.alt : ""; altL.appendChild(alt); f.appendChild(altL);

    var fileL = el("label", null, cover || svc.defaultPhoto ? "새 사진으로 바꾸기" : "사진 올리기");
    var file = el("input"); file.type = "file"; file.accept = "image/jpeg,image/png,image/webp"; file.id = uid + "-file";
    fileL.appendChild(file); f.appendChild(fileL);

    var consentL = el("label", "check"); consentL.hidden = true;
    var consent = el("input"); consent.type = "checkbox"; consent.id = uid + "-consent";
    consentL.appendChild(consent);
    consentL.appendChild(el("span", null, "아이 얼굴을 알아볼 수 없고, 이름표·화이트보드 등 이름이 보이지 않는 사진임을 확인했습니다."));
    f.appendChild(consentL);
    file.addEventListener("change", function () {
      var has = file.files.length > 0; consentL.hidden = !has; consent.required = has; if (!has) consent.checked = false;
    });

    var row = el("div", "row");
    var save = el("button", "btn small", cover ? "저장" : "올리기"); save.type = "submit"; row.appendChild(save);
    if (cover) {
      row.appendChild(deleteButton(function () {
        db.from("service_covers").delete().eq("service", key).then(function (res) {
          if (res.error) { fail("사진 빼기", res.error); loadCovers(); return; }
          db.storage.from(cfg.photoBucket).remove([cover.photo_path]);
          toast("사진을 뺐습니다. 기본 모습으로 돌아갑니다."); loadCovers();
        });
      }, "사진 빼기"));
    }
    f.appendChild(row);

    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var picked = file.files[0];
      if (!picked && !cover) { toast("올릴 사진을 골라주세요.", true); return; }
      save.disabled = true; save.textContent = "저장하는 중…";
      var altText = alt.value.trim();
      var job;
      if (picked) {
        job = shrinkPhoto(picked).then(function (blob) {
          var path = "covers/" + key + "-" + Date.now() + ".jpg";
          return db.storage.from(cfg.photoBucket).upload(path, blob, { contentType: "image/jpeg" }).then(function (up) {
            if (up.error) throw up.error;
            return db.from("service_covers").upsert({ service: key, photo_path: path, alt: altText }).then(function (res) {
              if (res.error) { db.storage.from(cfg.photoBucket).remove([path]); throw res.error; }
              if (cover && cover.photo_path !== path) db.storage.from(cfg.photoBucket).remove([cover.photo_path]);
            });
          });
        });
      } else {
        job = db.from("service_covers").update({ alt: altText }).eq("service", key).then(function (res) { if (res.error) throw res.error; });
      }
      job.then(function () { toast("저장했습니다. 사이트 카드에 바로 반영됩니다."); loadCovers(); })
        .catch(function (err) { fail("저장", err); save.disabled = false; save.textContent = cover ? "저장" : "올리기"; });
    });
    card.appendChild(f);
    return card;
  }

  // ---------- 기부금 모금 / 사용 (같은 모양의 폼) ----------
  function moneyTab(opt) {
    var editing = null;
    var form = $(opt.prefix + "-form"), cancel = $(opt.prefix + "-cancel"), title = $(opt.prefix + "-form-title");
    $(opt.prefix + "-date").value = today();
    function reset() { editing = null; form.reset(); $(opt.prefix + "-date").value = today(); title.textContent = opt.newTitle; cancel.hidden = true; }
    cancel.addEventListener("click", reset);
    function load() {
      db.from(opt.table).select("*").order(opt.dateCol, { ascending: false }).order("id", { ascending: false })
        .then(function (res) {
          var list = $(opt.prefix + "-list"); list.textContent = "";
          if (res.error) { fail("불러오기", res.error); return; }
          var y = String(new Date().getFullYear());
          var yearSum = res.data.filter(function (r) { return String(r[opt.dateCol]).slice(0, 4) === y; })
            .reduce(function (s, r) { return s + Number(r.amount); }, 0);
          $(opt.prefix + "-sum").textContent = y + "년 합계 " + won(yearSum) + " · 전체 " + res.data.length + "건";
          if (!res.data.length) { list.appendChild(el("li", "empty", "아직 내역이 없습니다.")); return; }
          res.data.forEach(function (r) {
            var li = el("li"), m = el("div", "main"), top = el("div", "top");
            top.appendChild(el("span", null, dot(r[opt.dateCol])));
            opt.tags(r).forEach(function (t) { if (t) top.appendChild(t); });
            m.appendChild(top); m.appendChild(el("div", "title", opt.label(r))); m.appendChild(el("div", "by", byLine(r)));
            li.appendChild(m); li.appendChild(el("div", "amt", won(r.amount)));
            var acts = el("div", "acts");
            acts.appendChild(editButton(function () {
              editing = r; opt.fill(r); title.textContent = opt.editTitle; cancel.hidden = false;
              window.scrollTo({ top: 0, behavior: "smooth" });
            }));
            acts.appendChild(deleteButton(function () {
              db.from(opt.table).delete().eq("id", r.id).then(function (res) {
                if (res.error) { fail("삭제", res.error); load(); return; }
                if (editing && editing.id === r.id) reset();
                toast("삭제했습니다."); load();
              });
            }));
            li.appendChild(acts); list.appendChild(li);
          });
        });
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector("button[type=submit]"); btn.disabled = true;
      var row = opt.read();
      var q = editing ? db.from(opt.table).update(row).eq("id", editing.id) : db.from(opt.table).insert(row);
      q.then(function (res) {
        btn.disabled = false;
        if (res.error) { fail("저장", res.error); return; }
        toast(editing ? "고쳤습니다." : "저장했습니다."); reset(); load();
      });
    });
    return load;
  }

  var loadReceipts = moneyTab({
    prefix: "rcv", table: "donation_receipts", dateCol: "received_on",
    newTitle: "모금 내역 쓰기", editTitle: "모금 내역 고치기",
    tags: function (r) { return [el("span", "tag", r.category)]; },
    label: function (r) { return r.note || r.category; },
    read: function () {
      return { received_on: $("rcv-date").value, amount: Number($("rcv-amount").value),
               category: $("rcv-category").value, note: $("rcv-note").value.trim() };
    },
    fill: function (r) { $("rcv-date").value = r.received_on; $("rcv-amount").value = r.amount; $("rcv-category").value = r.category; $("rcv-note").value = r.note || ""; }
  });

  var loadExpenses = moneyTab({
    prefix: "exp", table: "donation_expenses", dateCol: "spent_on",
    newTitle: "사용 내역 쓰기", editTitle: "사용 내역 고치기",
    tags: function (r) { return [tagFor(r.service)]; },
    label: function (r) { return r.payee + " · " + r.purpose; },
    read: function () {
      return { spent_on: $("exp-date").value, amount: Number($("exp-amount").value), payee: $("exp-payee").value.trim(),
               purpose: $("exp-purpose").value.trim(), service: $("exp-service").value || null };
    },
    fill: function (r) { $("exp-date").value = r.spent_on; $("exp-amount").value = r.amount; $("exp-payee").value = r.payee; $("exp-purpose").value = r.purpose; $("exp-service").value = r.service || ""; }
  });
})();
