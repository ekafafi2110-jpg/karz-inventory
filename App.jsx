import { useEffect, useMemo, useState } from "react";
import { db } from "./firebase";
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp
} from "firebase/firestore";

const INITIAL_SECTIONS = {
  "العبوات": {
    icon: "📦", color: "#C8A96E",
    items: [
      {id:"e1",name:"علب أسود",unit:"حبة",minQty:10},
      {id:"e2",name:"علب فلين",unit:"حبة",minQty:10},
      {id:"e3",name:"كاسات صغير",unit:"حبة",minQty:10},
      {id:"e4",name:"كاسات وسط",unit:"حبة",minQty:10},
      {id:"e5",name:"كاسات كبير",unit:"حبة",minQty:10},
      {id:"e6",name:"لتر",unit:"حبة",minQty:5},
      {id:"e7",name:"بسكويت بوظة",unit:"حبة",minQty:10},
      {id:"e8",name:"علب بوظة صغير",unit:"حبة",minQty:10},
      {id:"e9",name:"علب بوظة كبير",unit:"حبة",minQty:10},
      {id:"e10",name:"علب صحن",unit:"حبة",minQty:5},
      {id:"e11",name:"شاورما سوبر",unit:"حبة",minQty:5},
      {id:"e12",name:"سوشي",unit:"حبة",minQty:5},
      {id:"e13",name:"أسود مدور",unit:"حبة",minQty:10},
      {id:"e14",name:"بلاستيك شفاف",unit:"حبة",minQty:10},
      {id:"e15",name:"كاسات سخن",unit:"حبة",minQty:10},
      {id:"e16",name:"شلمون",unit:"حبة",minQty:2},
      {id:"e17",name:"أكياس بسطة",unit:"كجم",minQty:1},
      {id:"e18",name:"شوك+سكاكين",unit:"ربطة",minQty:3},
      {id:"e19",name:"حمالات ثنائية",unit:"حبة",minQty:2},
      {id:"e20",name:"حمالات رباعية",unit:"حبة",minQty:2},
      {id:"e21",name:"معالق تذوق",unit:"باكيت",minQty:1},
      {id:"e22",name:"كاسات أبيض بلاستيك",unit:"حبة",minQty:5},
      {id:"e23",name:"رول كاش",unit:"حبة",minQty:2},
      {id:"e24",name:"ستيك خشب",unit:"حبة",minQty:2}
    ]
  },
  "المشروبات": {
    icon: "🥤", color: "#7CB9E8",
    items: [
      {id:"m1",name:"سفن",unit:"حبة",minQty:10},
      {id:"m2",name:"بي ام",unit:"حبة",minQty:10},
      {id:"m3",name:"XL",unit:"حبة",minQty:10},
      {id:"m4",name:"ريد بول",unit:"حبة",minQty:3}
    ]
  },
  "المواد الخام": {
    icon: "🧪", color: "#A8D5A2",
    items: [
      {id:"r1",name:"نوتيلا 20كغ",unit:"كجم",minQty:2},
      {id:"r2",name:"شوكولاته بيضاء 5كغ",unit:"كجم",minQty:1},
      {id:"r3",name:"شوكولاته لوتس 5كغ",unit:"كجم",minQty:1},
      {id:"r4",name:"شوكولاته بستاشيو 5كغ",unit:"كجم",minQty:1},
      {id:"r5",name:"فارماسيل",unit:"كجم",minQty:1},
      {id:"r6",name:"كرنش",unit:"كجم",minQty:0.5},
      {id:"r7",name:"بسكويت لوتس حب",unit:"باكيت",minQty:1},
      {id:"r8",name:"بسكويت لوتس برش",unit:"كجم",minQty:0.5},
      {id:"r9",name:"سيرب كاراميل",unit:"كجم",minQty:1},
      {id:"r10",name:"سيرب فراولة",unit:"كجم",minQty:1},
      {id:"r11",name:"كاجو كسر",unit:"كجم",minQty:0.5},
      {id:"r12",name:"شعرية باكستانية",unit:"باكيت",minQty:2},
      {id:"r13",name:"حليب",unit:"لتر",minQty:2},
      {id:"r14",name:"زبدة قوالب",unit:"قالب",minQty:1},
      {id:"r15",name:"زبدة رش",unit:"علبة",minQty:1},
      {id:"r16",name:"فانيلا",unit:"كجم",minQty:0.5},
      {id:"r17",name:"باكنج باودر",unit:"كجم",minQty:0.5},
      {id:"r18",name:"نشا",unit:"كجم",minQty:1},
      {id:"r19",name:"طحين",unit:"كجم",minQty:2},
      {id:"r20",name:"مانجا",unit:"علبة",minQty:2},
      {id:"r21",name:"جوافة",unit:"علبة",minQty:1},
      {id:"r22",name:"فروزين",unit:"علبة",minQty:1}
    ]
  },
  "البسكويت": {
    icon: "🍪", color: "#D4A574",
    items: [
      {id:"b1",name:"سنكرز",unit:"حبة",minQty:5},
      {id:"b2",name:"توكس",unit:"حبة",minQty:3},
      {id:"b3",name:"فليك",unit:"حبة",minQty:3},
      {id:"b4",name:"ماجستو",unit:"حبة",minQty:2},
      {id:"b5",name:"كيندر",unit:"حبة",minQty:5},
      {id:"b6",name:"كيت كات",unit:"حبة",minQty:5},
      {id:"b7",name:"مارشميلو",unit:"حبة",minQty:5},
      {id:"b8",name:"فيريرو",unit:"حبة",minQty:3},
      {id:"b9",name:"أوريو",unit:"حبة",minQty:3},
      {id:"b10",name:"باونتي",unit:"حبة",minQty:2},
      {id:"b11",name:"مالتيزر",unit:"حبة",minQty:2}
    ]
  },
  "البوظة": {
    icon: "🍦", color: "#F4A7B9",
    items: [
      {id:"z1",name:"عربية",unit:"علبة",minQty:1},
      {id:"z2",name:"سنكرز",unit:"علبة",minQty:1},
      {id:"z3",name:"أوريو",unit:"علبة",minQty:1},
      {id:"z4",name:"تشيز كيك",unit:"علبة",minQty:1},
      {id:"z5",name:"فراولة",unit:"علبة",minQty:1},
      {id:"z6",name:"ليمون",unit:"علبة",minQty:1},
      {id:"z7",name:"علكة",unit:"علبة",minQty:1}
    ]
  }
};

const FIREBASE_COLLECTION = "inventory";

function todayStr() {
  return new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
}

function emptyQty(sections) {
  const q = {};
  Object.entries(sections).forEach(([sectionName, section]) => {
    q[sectionName] = {};
    section.items.forEach(item => {
      q[sectionName][item.id] = "";
    });
  });
  return q;
}

function getStatus(value, minQty) {
  if (value === "" || value === null || value === undefined) return "blank";
  const number = Number(value);
  if (Number.isNaN(number)) return "blank";
  if (number === 0) return "zero";
  if (number <= minQty) return "low";
  return "ok";
}

const statusText = { ok: "جيد", low: "ناقص", zero: "منتهي", blank: "لم يدخل" };

function Modal({ title, children, onClose }) {
  return (
    <div className="modal">
      <button className="modal-backdrop" onClick={onClose} />
      <div className="modal-card">
        <div className="modal-header">
          <strong>{title}</strong>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function validSnapshot(snap) {
  return snap && snap.sections && snap.quantities;
}

function countLowItems(snap) {
  if (!validSnapshot(snap)) return 0;
  let count = 0;
  Object.entries(snap.sections).forEach(([sectionName, section]) => {
    section.items.forEach(item => {
      const st = getStatus(snap.quantities?.[sectionName]?.[item.id], item.minQty);
      if (st === "low" || st === "zero") count += 1;
    });
  });
  return count;
}

function HistoryCard({ snap }) {
  const [open, setOpen] = useState(false);
  if (!validSnapshot(snap)) return null;
  const lowCount = countLowItems(snap);
  return (
    <div className="card history-card">
      <button className="history-head" onClick={() => setOpen(!open)}>
        <div>
          <strong>{snap.date}</strong>
          <span className={snap.status === "submitted" ? "tag blue" : "tag"}>
            {snap.status === "submitted" ? "مرسل للمدير" : "مسودة محفوظة"}
          </span>
          <p>{lowCount ? `${lowCount} صنف ناقص` : "لا توجد نواقص"}</p>
        </div>
        <span>{open ? "⌃" : "⌄"}</span>
      </button>
      {open && (
        <div className="history-body">
          {Object.entries(snap.sections).map(([sectionName, section]) => (
            <div key={sectionName}>
              <h4>{section.icon} {sectionName}</h4>
              {section.items.map(item => {
                const value = snap.quantities?.[sectionName]?.[item.id];
                const st = getStatus(value, item.minQty);
                return (
                  <div className="row small" key={`${sectionName}-${item.id}`}>
                    <span>{item.name}</span>
                    <strong className={st}>{value === "" || value === undefined ? "—" : value} {item.unit}</strong>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ManagerRecord({ snap }) {
  const [open, setOpen] = useState(false);
  const [orderQty, setOrderQty] = useState({});
  if (!validSnapshot(snap)) return null;

  function supplierText(sectionName) {
    const section = snap.sections[sectionName];
    const rows = section.items
      .filter(item => Number(orderQty[`${sectionName}-${item.id}`] || 0) > 0)
      .map(item => `• ${item.name}: ${orderQty[`${sectionName}-${item.id}`]} ${item.unit} | جرد الموظف: ${snap.quantities?.[sectionName]?.[item.id] || 0}`)
      .join("\n");
    return `طلبية كرز وعنب — ${sectionName}\nتاريخ الجرد: ${snap.date}\nالفرع: ${snap.branch || "فرع أبو زهرة"}\n\n${rows}`;
  }

  function sendSupplier(sectionName) {
    const text = supplierText(sectionName);
    window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank");
  }

  return (
    <div className="card history-card">
      <button className="history-head" onClick={() => setOpen(!open)}>
        <div>
          <strong>{snap.date}</strong>
          <span className="tag blue">جرد مرسل</span>
          <p>{snap.branch || "فرع أبو زهرة"} — {countLowItems(snap)} صنف ناقص</p>
        </div>
        <span>{open ? "⌃" : "⌄"}</span>
      </button>
      {open && (
        <div className="history-body">
          {Object.entries(snap.sections).map(([sectionName, section]) => (
            <div className="card" key={sectionName}>
              <div className="supplier-head">
                <div>
                  <h3 style={{ color: section.color }}>{section.icon} {sectionName}</h3>
                  <p>أدخل كمية طلب المدير، ورقم جرد الموظف ظاهر بجانب كل صنف.</p>
                </div>
                <button onClick={() => sendSupplier(sectionName)}>إرسال للمورد</button>
              </div>
              {section.items.map(item => {
                const employeeQty = snap.quantities?.[sectionName]?.[item.id];
                const st = getStatus(employeeQty, item.minQty);
                return (
                  <div className={`row ${st}`} key={item.id}>
                    <span>{item.name}</span>
                    <strong>جرد: {employeeQty === "" || employeeQty === undefined ? "—" : employeeQty} {item.unit}</strong>
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="طلب"
                      value={orderQty[`${sectionName}-${item.id}`] || ""}
                      onChange={e => setOrderQty(prev => ({ ...prev, [`${sectionName}-${item.id}`]: e.target.value }))}
                      style={{ width: 74, borderRadius: 10, padding: 7, background: "#1A1A2E", color: "#fff", border: "1px solid #C8A96E55", textAlign: "center" }}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [sections, setSections] = useState(INITIAL_SECTIONS);
  const [quantities, setQuantities] = useState(() => emptyQty(INITIAL_SECTIONS));
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("جرد");
  const [openSection, setOpenSection] = useState("العبوات");
  const [toast, setToast] = useState("");
  const [sendOpen, setSendOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(null);
  const [orderQty, setOrderQty] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadHistory(); }, []);

  async function loadHistory() {
    try {
      const q = query(collection(db, FIREBASE_COLLECTION), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setHistory(snap.docs.map(doc => ({ firestoreId: doc.id, ...doc.data() })).filter(validSnapshot));
    } catch (error) {
      console.error(error);
      showToast("تعذر تحميل السجل من Firebase");
    }
  }

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  }

  const allItems = useMemo(() => {
    const list = [];
    Object.entries(sections).forEach(([sectionName, section]) => {
      section.items.forEach(item => list.push({ sectionName, section, item, value: quantities[sectionName]?.[item.id] ?? "" }));
    });
    return list;
  }, [sections, quantities]);

  const enteredCount = allItems.filter(x => x.value !== "").length;
  const lowList = allItems.filter(({ item, value }) => ["low", "zero"].includes(getStatus(value, item.minQty)));
  const submittedHistory = history.filter(snap => snap.status === "submitted" || snap.sentByEmployee);

  function setQty(sectionName, itemId, value) {
    setQuantities(prev => ({ ...prev, [sectionName]: { ...prev[sectionName], [itemId]: value } }));
  }

  function resetInventory() {
    setQuantities(emptyQty(sections));
    setOrderQty({});
  }

  async function saveSnap(status = "draft") {
    setLoading(true);
    try {
      const sentByEmployee = status === "submitted";
      const snap = {
        id: Date.now(),
        date: todayStr(),
        status,
        sentByEmployee,
        branch: "فرع أبو زهرة",
        sections: JSON.parse(JSON.stringify(sections)),
        quantities: JSON.parse(JSON.stringify(quantities)),
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, FIREBASE_COLLECTION), snap);
      setHistory(prev => [{ ...snap, createdAt: new Date().toISOString() }, ...prev]);
      showToast(sentByEmployee ? "تم إرسال الجرد للمدير وحفظه" : "تم حفظ مسودة الجرد");
    } catch (error) {
      console.error(error);
      showToast("حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  }

  async function sendToManager() {
    await saveSnap("submitted");
    resetInventory();
    setSendOpen(false);
  }

  function orderText(sectionName) {
    const section = sections[sectionName];
    const items = section.items.filter(item => Number(orderQty[item.id] || 0) > 0);
    return `طلبية كرز وعنب — ${sectionName}\n${todayStr()}\nفرع أبو زهرة\n\n${items.map(item => `• ${item.name}: ${orderQty[item.id]} ${item.unit}`).join("\n")}`;
  }

  function shareWhatsapp(sectionName) { window.open("https://wa.me/?text=" + encodeURIComponent(orderText(sectionName)), "_blank"); }
  async function copyOrder(sectionName) { try { await navigator.clipboard.writeText(orderText(sectionName)); showToast("تم نسخ الطلب"); } catch { showToast("انسخ الطلب يدويًا"); } }

  const tabs = [
    { key: "جرد", label: "جرد" },
    { key: "نواقص", label: "نواقص", badge: lowList.length },
    { key: "السجل", label: "السجل", badge: history.length },
    { key: "المدير", label: "المدير", badge: submittedHistory.length },
    { key: "إعدادات", label: "إعدادات" }
  ];

  return (
    <main className="app">
      <header className="top"><div><p>فرع أبو زهرة — {todayStr()}</p><h1>🍒 كرز وعنب</h1></div><div className="counter"><strong>{enteredCount}/{allItems.length}</strong><span>تم إدخاله</span></div></header>
      <div className="progress"><span style={{ width: `${allItems.length ? (enteredCount / allItems.length) * 100 : 0}%` }} /></div>
      <nav className="tabs">{tabs.map(tab => <button key={tab.key} className={activeTab === tab.key ? "active" : ""} onClick={() => setActiveTab(tab.key)}>{tab.label}{!!tab.badge && <em>{tab.badge}</em>}</button>)}</nav>
      <section className="content">
        {activeTab === "جرد" && <><div className="note">أدخل العدد الفعلي لكل صنف. زر حفظ يحفظ مسودة للعودة لاحقًا، وزر إرسال للمدير يرسل لقائمة المدير.</div>{Object.entries(sections).map(([sectionName, section]) => { const isOpen = openSection === sectionName; const entered = section.items.filter(item => quantities[sectionName]?.[item.id] !== "").length; const lows = section.items.filter(item => ["low", "zero"].includes(getStatus(quantities[sectionName]?.[item.id], item.minQty))).length; return <div className="section-card" key={sectionName}><button className="section-head" style={{ borderColor: section.color }} onClick={() => setOpenSection(isOpen ? "" : sectionName)}><span className="emoji">{section.icon}</span><span><strong style={{ color: section.color }}>{sectionName}</strong><small>{entered}/{section.items.length} صنف {lows > 0 ? `— ${lows} ناقص` : ""}</small></span><b>{isOpen ? "⌃" : "⌄"}</b></button>{isOpen && <div className="items">{section.items.map(item => { const value = quantities[sectionName]?.[item.id] ?? ""; const st = getStatus(value, item.minQty); return <div className={`item ${st}`} key={item.id}><div><strong>{item.name}</strong><small>{item.unit} — حد أدنى {item.minQty}</small></div><input inputMode="decimal" type="number" value={value} placeholder="العدد" onChange={e => setQty(sectionName, item.id, e.target.value)} /></div>; })}</div>}</div>; })}</>}
        {activeTab === "نواقص" && <><div className="note blue">للمدير: هذه شاشة مساعدة داخل جرد الموظف. شاشة المدير الكاملة في تبويب المدير.</div>{Object.entries(sections).map(([sectionName, section]) => <div className="card" key={sectionName}><div className="supplier-head"><div><h3 style={{ color: section.color }}>{section.icon} {sectionName}</h3><p>{section.items.filter(item => ["low", "zero"].includes(getStatus(quantities[sectionName]?.[item.id], item.minQty))).length} ناقص</p></div><button onClick={() => setOrderOpen(sectionName)}>طلب المورد</button></div>{section.items.map(item => { const value = quantities[sectionName]?.[item.id] ?? ""; const st = getStatus(value, item.minQty); return <div className={`row ${st}`} key={item.id}><span>{item.name}</span><strong>{value === "" ? "—" : value} {item.unit}</strong><small>{statusText[st]}</small></div>; })}</div>)}</>}
        {activeTab === "السجل" && <>{history.length === 0 ? <div className="empty">لا توجد جرود محفوظة بعد</div> : history.map(snap => <HistoryCard key={snap.firestoreId || snap.id} snap={snap} />)}</>}
        {activeTab === "المدير" && <>{submittedHistory.length === 0 ? <div className="empty">لا توجد جرود مرسلة للمدير بعد</div> : submittedHistory.map(snap => <ManagerRecord key={snap.firestoreId || snap.id} snap={snap} />)}</>}
        {activeTab === "إعدادات" && <div className="card"><div className="modal-content"><h3>إعدادات الأصناف</h3><p className="muted">أعدت تبويب الإعدادات. التعديل الكامل للأصناف سيضاف في المرحلة التالية حتى لا نخرب بيانات الجرد الحالية.</p>{Object.entries(sections).map(([sectionName, section]) => <div className="row" key={sectionName}><span>{section.icon} {sectionName}</span><strong>{section.items.length} صنف</strong></div>)}</div></div>}
      </section>
      {activeTab === "جرد" && <footer className="bottom"><button className="secondary" disabled={loading} onClick={() => saveSnap("draft")}>💾 حفظ</button><button className="primary" disabled={loading} onClick={() => setSendOpen(true)}>📤 إرسال للمدير</button></footer>}
      {sendOpen && <Modal title="إرسال الجرد للمدير" onClose={() => setSendOpen(false)}><div className="modal-content"><p>سيتم حفظ لقطة كاملة من جرد الموظف في السجل، ثم تظهر في شاشة المدير.</p><div className="summary"><span>إجمالي الأصناف</span><strong>{allItems.length}</strong><span>تم إدخالها</span><strong>{enteredCount}</strong><span>الأصناف الناقصة</span><strong>{lowList.length}</strong></div><button className="primary wide" disabled={loading} onClick={sendToManager}>تأكيد الإرسال</button></div></Modal>}
      {orderOpen && <Modal title={`طلب المورد — ${orderOpen}`} onClose={() => setOrderOpen(null)}><div className="modal-content">{sections[orderOpen].items.map(item => { const value = quantities[orderOpen]?.[item.id] ?? ""; return <div className="order-row" key={item.id}><div><strong>{item.name}</strong><small>الرصيد: {value === "" ? "—" : value} {item.unit}</small></div><input type="number" inputMode="decimal" placeholder="كمية" value={orderQty[item.id] || ""} onChange={e => setOrderQty(prev => ({ ...prev, [item.id]: e.target.value }))} /></div>; })}<div className="actions"><button className="secondary" onClick={() => copyOrder(orderOpen)}>نسخ</button><button className="whatsapp" onClick={() => shareWhatsapp(orderOpen)}>واتساب</button></div></div></Modal>}
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
