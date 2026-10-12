import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, doc, onSnapshot, setDoc, increment }
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

// ID dokumen tidak boleh mengandung "/"
const docId = (src) => src.replace(/[\/.]/g, "_");

$(function () {
  const buttons = {}; // docId -> render(count)

  $("#project .project-item").each(function () {
    const item = $(this);
    const id = docId(item.find("img").attr("src"));
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
        // update optimistis; onSnapshot akan menimpa dengan nilai server
        setDoc(doc(db, "likes", id), { count: increment(nowLiked ? 1 : -1) }, { merge: true })
          .catch((err) => console.error("Gagal menyimpan like:", err));
      } else {
        count += nowLiked ? 1 : -1;
      }
      render();
    });

    buttons[id] = (c) => { count = c; render(); };
    render();
    item.append(btn);
  });

  if (db) {
    onSnapshot(collection(db, "likes"), (snap) => {
      snap.forEach((d) => { if (buttons[d.id]) buttons[d.id](d.data().count || 0); });
    });
  }
});
