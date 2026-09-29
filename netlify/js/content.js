// 사이트 문구 공통 처리 (사이트·관리자 페이지가 함께 사용)
// 페이지의 data-c="섹션.항목" 글자와 data-c-list="섹션.목록" 목록을
// 관리자가 저장한 값(site_content 표)으로 바꿉니다. 저장값이 없으면 페이지 기본 문구가 그대로 보입니다.
// 글 형식: 줄바꿈 = Enter, 굵게 = **글자**  (그 밖의 HTML은 글자로만 보임)
window.SiteContent = (function () {
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  // 화면 → 글 (<br>은 줄바꿈, <strong>은 **)
  function toText(node) {
    var out = "";
    node.childNodes.forEach(function (n) {
      if (n.nodeType === 3) out += n.textContent;
      else if (n.nodeName === "BR") out += "\n";
      else if (n.nodeName === "STRONG" || n.nodeName === "B") out += "**" + toText(n) + "**";
      else if (n.nodeType === 1) out += toText(n);
    });
    return out.replace(/[ \t]*\n[ \t]*/g, "\n").replace(/[ \t]+/g, " ").trim();
  }
  // 글 → 화면
  function fill(node, text) {
    node.textContent = "";
    String(text).split("\n").forEach(function (line, i) {
      if (i) node.appendChild(document.createElement("br"));
      line.split("**").forEach(function (part, j) {
        if (!part) return;
        node.appendChild(j % 2 ? el("strong", null, part) : document.createTextNode(part));
      });
    });
  }

  // 목록 읽기/그리기
  var lists = {
    "story.stats": {
      read: function (box) {
        return Array.prototype.map.call(box.querySelectorAll(".stat"), function (s) {
          var num = s.querySelector(".num"), small = num.querySelector("small");
          return { num: num.firstChild ? num.firstChild.textContent.trim() : "", unit: small ? small.textContent.trim() : "", label: s.querySelector(".label").textContent.trim() };
        });
      },
      render: function (box, items) {
        box.textContent = "";
        items.forEach(function (it) {
          var s = el("div", "stat"), num = el("div", "num", it.num || "");
          if (it.unit) num.appendChild(el("small", null, it.unit));
          s.appendChild(num); s.appendChild(el("div", "label", it.label || "")); box.appendChild(s);
        });
      }
    },
    "story.history": {
      read: function (box) {
        return Array.prototype.map.call(box.querySelectorAll("li"), function (li) {
          return { date: li.querySelector("time").textContent.trim(), text: toText(li.querySelector("p")) };
        });
      },
      render: function (box, items) {
        box.textContent = "";
        items.forEach(function (it) {
          var li = el("li"); li.appendChild(el("time", null, it.date || ""));
          var p = el("p"); fill(p, it.text || ""); li.appendChild(p); box.appendChild(li);
        });
      }
    },
    "consulting.steps": {
      read: function (box) {
        return Array.prototype.map.call(box.querySelectorAll("li"), function (li) {
          return { title: li.querySelector("strong").textContent.trim(), text: li.querySelector("span").textContent.trim() };
        });
      },
      render: function (box, items) {
        box.textContent = "";
        items.forEach(function (it) {
          var li = el("li"); li.appendChild(el("strong", null, it.title || "")); li.appendChild(el("span", null, it.text || "")); box.appendChild(li);
        });
      }
    }
  };

  function get(obj, path) { return path.split(".").reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj); }
  function set(obj, path, v) {
    var ks = path.split("."), o = obj;
    ks.slice(0, -1).forEach(function (k) { if (o[k] == null || typeof o[k] !== "object") o[k] = {}; o = o[k]; });
    o[ks[ks.length - 1]] = v;
  }

  // 페이지(doc)의 현재 문구를 모두 읽기 → { hero: {...}, about: {...}, ... }
  function readAll(doc) {
    var data = {};
    doc.querySelectorAll("[data-c]").forEach(function (n) { set(data, n.getAttribute("data-c"), toText(n)); });
    doc.querySelectorAll("[data-c-list]").forEach(function (n) {
      var k = n.getAttribute("data-c-list"); if (lists[k]) set(data, k, lists[k].read(n));
    });
    return data;
  }
  // 저장된 문구를 페이지에 적용 (값이 있는 것만)
  function applyAll(doc, data) {
    doc.querySelectorAll("[data-c]").forEach(function (n) {
      var v = get(data, n.getAttribute("data-c"));
      if (typeof v === "string" && v.trim()) fill(n, v);
    });
    doc.querySelectorAll("[data-c-list]").forEach(function (n) {
      var k = n.getAttribute("data-c-list"), v = get(data, k);
      if (lists[k] && Array.isArray(v) && v.length) lists[k].render(n, v);
    });
  }
  // site_content 행들 → { hero: value, ... }
  function rowsToData(rows) {
    var d = {}; (rows || []).forEach(function (r) { d[r.key] = r.value; }); return d;
  }

  return { toText: toText, fill: fill, get: get, set: set, readAll: readAll, applyAll: applyAll, rowsToData: rowsToData };
})();
