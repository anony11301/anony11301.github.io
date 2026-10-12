import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, doc, onSnapshot, setDoc, addDoc, query, orderBy,
         serverTimestamp, increment }
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const configured = !firebaseConfig.apiKey.startsWith("ISI_");
let db = null;
if (configured) {
  db = getFirestore(initializeApp(firebaseConfig));
} else {
  console.warn("Firebase belum dikonfigurasi: isi js/firebase-config.js");
}

const KEY = "gallery-likes"; // status "sudah saya like" per browser
let mine = {};
try { mine = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
const saveMine = () => { try { localStorage.setItem(KEY, JSON.stringify(mine)); } catch (e) {} };

const NAME_KEY = "gallery-comment-name";
const getName = () => { try { return localStorage.getItem(NAME_KEY) || ""; } catch (e) { return ""; } };
const setName = (n) => { try { localStorage.setItem(NAME_KEY, n); } catch (e) {} };

// ID dokumen tidak boleh mengandung "/"
const docId = (src) => src.replace(/[\/.]/g, "_");

function openComments(id, comments) {
  const modal = $(
    '<div class="cmt-modal">' +
      '<div class="cmt-box">' +
        '<div class="cmt-head"><b>Komentar</b><button type="button" class="cmt-close" aria-label="Tutup">&times;</button></div>' +
        '<ul class="cmt-list"></ul>' +
        '<form class="cmt-form">' +
          '<input class="cmt-name" type="text" maxlength="30" placeholder="Nama" required>' +
          '<input class="cmt-text" type="text" maxlength="300" placeholder="Tulis komentar..." required>' +
          '<button type="submit">Kirim</button>' +
        '</form>' +
      '</div>' +
    '</div>'
  );
  const list = modal.find(".cmt-list");
  modal.find(".cmt-name").val(getName());

  function renderList() {
    list.empty();
    if (!comments.length) list.append('<li class="cmt-empty">Belum ada komentar.</li>');
    comments.forEach((c) => {
      list.append($("<li>").append($("<b>").text(c.name), document.createTextNode(c.text)));
    });
    list.scrollTop(list[0].scrollHeight);
  }

  function close() { modal.remove(); delete openComments.refresh; $(document).off("keydown.cmt"); }
  openComments.refresh = (c) => { comments = c; renderList(); };

  modal.on("click", (e) => { if (e.target === modal[0]) close(); });
  modal.find(".cmt-close").on("click", close);
  $(document).on("keydown.cmt", (e) => { if (e.key === "Escape") close(); });

  modal.find(".cmt-form").on("submit", function (e) {
    e.preventDefault();
    const name = modal.find(".cmt-name").val().trim();
    const text = modal.find(".cmt-text").val().trim();
    if (!name || !text) return;
    if (!db) { alert("Firebase belum dikonfigurasi."); return; }
    setName(name);
    modal.find(".cmt-text").val("");
    addDoc(collection(db, "photos", id, "comments"), { name, text, createdAt: serverTimestamp() })
      .catch((err) => { console.error("Gagal mengirim komentar:", err); alert("Komentar gagal dikirim."); });
  });

  $("body").append(modal);
  renderList();
  modal.find(".cmt-text").focus();
}

$(function () {
  const likeUI = {};     // id -> fungsi set jumlah like
  const commentUI = {};  // id -> fungsi set daftar komentar

  $("#project .project-item").each(function () {
    const item = $(this);
    const id = docId(item.find("img").attr("src"));

    // ---- LIKE ----
    const btn = $('<button type="button" class="like-btn" aria-label="Like"><i class="fa"></i><span></span></button>');
    let count = 0;

    function render() {
      const liked = !!mine[id];
      btn.toggleClass("liked", liked);
      btn.find("i").attr("class", "fa " + (liked ? "fa-heart" : "fa-heart-o"));
      btn.find("span").text(Math.max(count, 0));
    }

    btn.on("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      const nowLiked = !mine[id];
      mine[id] = nowLiked;
      saveMine();
      if (db) {
        setDoc(doc(db, "likes", id), { count: increment(nowLiked ? 1 : -1) }, { merge: true })
          .catch((err) => console.error("Gagal menyimpan like:", err));
      } else {
        count += nowLiked ? 1 : -1;
      }
      render();
    });

    likeUI[id] = (c) => { count = c; render(); };
    render();

    // ---- KOMENTAR ----
    const cbtn = $('<button type="button" class="like-btn cmt-btn" aria-label="Komentar"><i class="fa fa-comment-o"></i><span>0</span></button>');
    let comments = [];

    cbtn.on("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      openComments(id, comments);
    });

    commentUI[id] = (list) => {
      comments = list;
      cbtn.find("span").text(list.length);
      if (openComments.refresh && cbtn.data("open")) openComments.refresh(list);
    };
    cbtn.on("click", () => {
      $(".cmt-btn").data("open", false);
      cbtn.data("open", true);
    });

    item.append(btn).append(cbtn);
  });

  if (db) {
    onSnapshot(collection(db, "likes"), (snap) => {
      snap.forEach((d) => { if (likeUI[d.id]) likeUI[d.id](d.data().count || 0); });
    });
    Object.keys(commentUI).forEach((id) => {
      const q = query(collection(db, "photos", id, "comments"), orderBy("createdAt", "asc"));
      onSnapshot(q, (snap) => commentUI[id](snap.docs.map((d) => d.data())));
    });
  }
});
