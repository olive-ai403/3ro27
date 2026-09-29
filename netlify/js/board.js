// 게시판: 공지사항(관리자만 작성) · 자유게시판(누구나 작성, 삭제는 작성자 비밀번호 또는 관리자)
// 주소 뒤 # 으로 화면을 나눔: #notice, #notice/12, #free, #free/34, #free/write
(function () {
  var cfg = window.SITE_CONFIG;
  var db = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey); // 관리자 페이지 로그인 상태를 같이 씀
  var $ = function (id) { return document.getElementById(id); };
  var PAGE = 15;
  var page = { notice: 0, free: 0 };
  var isAdmin = false;

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function day(ts) { var d = new Date(ts); return d.getFullYear() + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + String(d.getDate()).padStart(2, "0"); }
  var toastTimer;
  function toast(msg, isErr) {
    var t = $("toast"); t.textContent = msg; t.className = "toast" + (isErr ? " err" : ""); t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 3500);
  }
  function show(view) { ["v-list", "v-post", "v-write"].forEach(function (v) { $(v).hidden = v !== view; }); }
  function setBoard(board) {
    $("page-title").textContent = board === "notice" ? "공지사항" : "자유게시판";
    document.title = (board === "notice" ? "공지사항" : "자유게시판") + " · 3로27 사회적협동조합";
    document.querySelectorAll(".tabs a").forEach(function (a) { a.setAttribute("aria-current", a.dataset.board === board ? "true" : "false"); });
    document.querySelectorAll(".menu a[data-board]").forEach(function (a) {
      if (a.dataset.board === board) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }

  // ---------- 목록 ----------
  function renderList(board) {
    show("v-list");
    $("write-btn").hidden = board !== "free";
    $("notice-admin").hidden = !(board === "notice" && isAdmin);
    var list = $("list");
    list.textContent = ""; list.appendChild(el("li", "empty", "불러오는 중입니다."));
    var from = page[board] * PAGE, to = from + PAGE - 1;
    var q = board === "notice"
      ? db.from("notices").select("id, title, pinned, created_at", { count: "exact" }).order("pinned", { ascending: false }).order("created_at", { ascending: false })
      : db.from("free_posts").select("id, nickname, title, created_at", { count: "exact" }).order("created_at", { ascending: false });
    q.range(from, to).then(function (res) {
      list.textContent = "";
      if (res.error) { list.appendChild(el("li", "empty", "글을 불러오지 못했습니다. 잠시 후 다시 열어주세요.")); return; }
      var total = res.count || 0;
      $("list-count").textContent = "전체 " + total + "건";
      if (!res.data.length) {
        list.appendChild(el("li", "empty", board === "notice" ? "등록된 공지사항이 없습니다." : "아직 글이 없습니다. 첫 글을 남겨주세요."));
      }
      res.data.forEach(function (r) {
        var li = el("li"), a = el("a"); a.href = "#" + board + "/" + r.id;
        var t = el("span", "t");
        if (r.pinned) t.appendChild(el("span", "pin", "공지"));
        t.appendChild(document.createTextNode(r.title));
        a.appendChild(t);
        a.appendChild(el("span", "m", (board === "free" ? r.nickname + " · " : "") + day(r.created_at)));
        li.appendChild(a); list.appendChild(li);
      });
      var pages = Math.max(1, Math.ceil(total / PAGE));
      $("pager").hidden = pages <= 1;
      $("page-no").textContent = (page[board] + 1) + " / " + pages;
      $("prev").disabled = page[board] === 0;
      $("next").disabled = page[board] >= pages - 1;
    });
  }
  $("prev").addEventListener("click", function () { var b = current().board; page[b] = Math.max(0, page[b] - 1); renderList(b); });
  $("next").addEventListener("click", function () { var b = current().board; page[b]++; renderList(b); });

  // ---------- 글 보기 ----------
  function renderPost(board, id) {
    show("v-post");
    $("back").href = "#" + board;
    $("post-title").textContent = "불러오는 중입니다."; $("post-meta").textContent = ""; $("post-body").textContent = "";
    $("post-del").hidden = true; $("del-form").hidden = true; $("del-open").hidden = false; $("del-msg").hidden = true; $("del-pw").value = "";
    var q = board === "notice"
      ? db.from("notices").select("id, title, body, created_at, updated_at").eq("id", id).maybeSingle()
      : db.from("free_posts").select("id, nickname, title, body, created_at").eq("id", id).maybeSingle();
    q.then(function (res) {
      if (res.error || !res.data) { $("post-title").textContent = "글을 찾을 수 없습니다."; $("post-body").textContent = "지워졌거나 주소가 잘못되었습니다."; return; }
      var r = res.data;
      $("post-title").textContent = r.title;
      $("post-meta").textContent = (board === "free" ? r.nickname + " · " : "3로27 · ") + day(r.created_at);
      $("post-body").textContent = r.body || "";
      if (board === "free") setupDelete(r.id);
    });
  }

  // 자유게시판 삭제: 작성자는 비밀번호, 관리자는 바로
  var delId = null;
  function setupDelete(id) {
    delId = id;
    $("post-del").hidden = false;
    var adminBox = $("del-admin"); adminBox.textContent = ""; adminBox.hidden = !isAdmin;
    if (isAdmin) {
      var b = el("button", "btn danger small", "관리자 삭제"); b.type = "button";
      var timer;
      b.addEventListener("click", function () {
        if (!b.classList.contains("armed")) {
          b.classList.add("armed"); b.textContent = "정말 삭제";
          timer = setTimeout(function () { b.classList.remove("armed"); b.textContent = "관리자 삭제"; }, 4000);
          return;
        }
        clearTimeout(timer); b.disabled = true;
        db.from("free_posts").delete({ count: "exact" }).eq("id", id).then(function (res) {
          if (res.error || !res.count) { b.disabled = false; toast("삭제하지 못했습니다.", true); return; }
          toast("삭제했습니다."); location.hash = "#free";
        });
      });
      adminBox.appendChild(b);
    }
  }
  $("del-open").addEventListener("click", function () { $("del-form").hidden = false; $("del-open").hidden = true; $("del-pw").focus(); });
  function authorDelete() {
    var pw = $("del-pw").value; if (!pw) { $("del-pw").focus(); return; }
    $("del-go").disabled = true;
    db.rpc("delete_free_post", { p_id: delId, p_password: pw }).then(function (res) {
      $("del-go").disabled = false;
      var m = $("del-msg"); m.hidden = false;
      if (res.error) { m.textContent = "삭제하지 못했습니다. 잠시 후 다시 시도해 주세요."; return; }
      if (res.data === "deleted") { toast("삭제했습니다."); location.hash = "#free"; return; }
      if (res.data === "wrong_password") { m.textContent = "비밀번호가 맞지 않습니다."; $("del-pw").value = ""; $("del-pw").focus(); return; }
      if (res.data === "locked") { m.textContent = "비밀번호를 여러 번 틀려 삭제가 잠겼습니다. 카카오채널로 관리자에게 삭제를 요청해 주세요."; return; }
      m.textContent = "이미 지워진 글입니다.";
    });
  }
  $("del-go").addEventListener("click", authorDelete);
  $("del-pw").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); authorDelete(); } });
  $("del-open").hidden = false;

  // ---------- 글쓰기 ----------
  $("write-form").addEventListener("submit", function (e) {
    e.preventDefault();
    if ($("w-website").value) { location.hash = "#free"; return; } // 스팸 로봇 거르기
    var btn = $("w-save"); btn.disabled = true; btn.textContent = "등록하는 중…";
    db.rpc("create_free_post", {
      p_nickname: $("w-nick").value.trim(), p_password: $("w-pw").value,
      p_title: $("w-title").value.trim(), p_body: $("w-body").value.trim()
    }).then(function (res) {
      btn.disabled = false; btn.textContent = "등록";
      if (res.error) { toast(res.error.message || "등록하지 못했습니다.", true); return; }
      $("write-form").reset(); page.free = 0;
      toast("등록했습니다. 삭제할 때 비밀번호가 필요합니다.");
      location.hash = "#free/" + res.data;
    });
  });

  // ---------- 화면 전환 ----------
  function current() {
    var h = location.hash.replace(/^#/, "").split("/");
    var board = h[0] === "free" ? "free" : "notice";
    return { board: board, arg: h[1] };
  }
  function route() {
    var c = current();
    setBoard(c.board);
    if (c.board === "free" && c.arg === "write") { show("v-write"); $("w-nick").focus(); }
    else if (c.arg && /^\d+$/.test(c.arg)) renderPost(c.board, Number(c.arg));
    else renderList(c.board);
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);

  // 관리자로 로그인해 있으면 삭제 버튼 등을 보여줌
  db.auth.getSession().then(function (s) {
    if (!s.data.session) { route(); return; }
    db.rpc("is_admin").then(function (res) { isAdmin = !res.error && res.data === true; route(); });
  });
})();
