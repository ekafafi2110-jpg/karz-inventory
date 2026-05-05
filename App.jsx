import { useEffect, useMemo, useState } from "react";
import { db } from "./firebase";
import { addDoc, collection, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";

const FIREBASE_COLLECTION = "inventory";
const DRAFT_KEY = "karz_latest_draft";
const ROLE_KEY = "karz_user_role";
const LOGIN_CODES = { employee: "1234", manager: "9999" };

const INITIAL_SECTIONS = {
  "العبوات": { icon:"📦", color:"#C8A96E", items:[
    {id:"e1",name:"علب أسود",unit:"حبة",minQty:10},{id:"e2",name:"علب فلين",unit:"حبة",minQty:10},{id:"e3",name:"كاسات صغير",unit:"حبة",minQty:10},{id:"e4",name:"كاسات وسط",unit:"حبة",minQty:10},{id:"e5",name:"كاسات كبير",unit:"حبة",minQty:10},{id:"e6",name:"لتر",unit:"حبة",minQty:5},{id:"e7",name:"بسكويت بوظة",unit:"حبة",minQty:10},{id:"e8",name:"علب بوظة صغير",unit:"حبة",minQty:10},{id:"e9",name:"علب بوظة كبير",unit:"حبة",minQty:10},{id:"e10",name:"علب صحن",unit:"حبة",minQty:5},{id:"e11",name:"شاورما سوبر",unit:"حبة",minQty:5},{id:"e12",name:"سوشي",unit:"حبة",minQty:5},{id:"e13",name:"أسود مدور",unit:"حبة",minQty:10},{id:"e14",name:"بلاستيك شفاف",unit:"حبة",minQty:10},{id:"e15",name:"كاسات سخن",unit:"حبة",minQty:10},{id:"e16",name:"شلمون",unit:"حبة",minQty:2},{id:"e17",name:"أكياس بسطة",unit:"كجم",minQty:1},{id:"e18",name:"شوك+سكاكين",unit:"ربطة",minQty:3},{id:"e19",name:"حمالات ثنائية",unit:"حبة",minQty:2},{id:"e20",name:"حمالات رباعية",unit:"حبة",minQty:2},{id:"e21",name:"معالق تذوق",unit:"باكيت",minQty:1},{id:"e22",name:"كاسات أبيض بلاستيك",unit:"حبة",minQty:5},{id:"e23",name:"رول كاش",unit:"حبة",minQty:2},{id:"e24",name:"ستيك خشب",unit:"حبة",minQty:2}
  ]},
  "المشروبات": { icon:"🥤", color:"#7CB9E8", items:[
    {id:"m1",name:"سفن",unit:"حبة",minQty:10},{id:"m2",name:"بي ام",unit:"حبة",minQty:10},{id:"m3",name:"XL",unit:"حبة",minQty:10},{id:"m4",name:"ريد بول",unit:"حبة",minQty:3}
  ]},
  "المواد الخام": { icon:"🧪", color:"#A8D5A2", items:[
    {id:"r1",name:"نوتيلا 20كغ",unit:"كجم",minQty:2},{id:"r2",name:"شوكولاته بيضاء 5كغ",unit:"كجم",minQty:1},{id:"r3",name:"شوكولاته لوتس 5كغ",unit:"كجم",minQty:1},{id:"r4",name:"شوكولاته بستاشيو 5كغ",unit:"كجم",minQty:1},{id:"r5",name:"فارماسيل",unit:"كجم",minQty:1},{id:"r6",name:"كرنش",unit:"كجم",minQty:0.5},{id:"r7",name:"بسكويت لوتس حب",unit:"باكيت",minQty:1},{id:"r8",name:"بسكويت لوتس برش",unit:"كجم",minQty:0.5},{id:"r9",name:"سيرب كاراميل",unit:"كجم",minQty:1},{id:"r10",name:"سيرب فراولة",unit:"كجم",minQty:1},{id:"r11",name:"كاجو كسر",unit:"كجم",minQty:0.5},{id:"r12",name:"شعرية باكستانية",unit:"باكيت",minQty:2},{id:"r13",name:"حليب",unit:"لتر",minQty:2},{id:"r14",name:"زبدة قوالب",unit:"قالب",minQty:1},{id:"r15",name:"زبدة رش",unit:"علبة",minQty:1},{id:"r16",name:"فانيلا",unit:"كجم",minQty:0.5},{id:"r17",name:"باكنج باودر",unit:"كجم",minQty:0.5},{id:"r18",name:"نشا",unit:"كجم",minQty:1},{id:"r19",name:"طحين",unit:"كجم",minQty:2},{id:"r20",name:"مانجا",unit:"علبة",minQty:2},{id:"r21",name:"جوافة",unit:"علبة",minQty:1},{id:"r22",name:"فروزين",unit:"علبة",minQty:1}
  ]},
  "البسكويت": { icon:"🍪", color:"#D4A574", items:[
    {id:"b1",name:"سنكرز",unit:"حبة",minQty:5},{id:"b2",name:"توكس",unit:"حبة",minQty:3},{id:"b3",name:"فليك",unit:"حبة",minQty:3},{id:"b4",name:"ماجستو",unit:"حبة",minQty:2},{id:"b5",name:"كيندر",unit:"حبة",minQty:5},{id:"b6",name:"كيت كات",unit:"حبة",minQty:5},{id:"b7",name:"مارشميلو",unit:"حبة",minQty:5},{id:"b8",name:"فيريرو",unit:"حبة",minQty:3},{id:"b9",name:"أوريو",unit:"حبة",minQty:3},{id:"b10",name:"باونتي",unit:"حبة",minQty:2},{id:"b11",name:"مالتيزر",unit:"حبة",minQty:2}
  ]},
  "البوظة": { icon:"🍦", color:"#F4A7B9", items:[
    {id:"z1",name:"عربية",unit:"علبة",minQty:1},{id:"z2",name:"سنكرز",unit:"علبة",minQty:1},{id:"z3",name:"أوريو",unit:"علبة",minQty:1},{id:"z4",name:"تشيز كيك",unit:"علبة",minQty:1},{id:"z5",name:"فراولة",unit:"علبة",minQty:1},{id:"z6",name:"ليمون",unit:"علبة",minQty:1},{id:"z7",name:"علكة",unit:"علبة",minQty:1}
  ]}
};

function todayStr(){ return new Date().toLocaleDateString("ar-EG",{year:"numeric",month:"long",day:"numeric"}); }
function emptyQty(sections){ const q={}; Object.entries(sections).forEach(([sk,{items}])=>{ q[sk]={}; items.forEach(it=>q[sk][it.id]=""); }); return q; }
function getStatus(val,minQty){ if(val===""||val===null||val===undefined)return "blank"; const n=Number(val); if(Number.isNaN(n))return "blank"; if(n===0)return "zero"; if(n<=minQty)return "low"; return "ok"; }
function validSnapshot(s){ return s && s.sections && s.quantities; }
function countLow(s){ if(!validSnapshot(s))return 0; let c=0; Object.entries(s.sections).forEach(([sk,{items}])=>items.forEach(it=>{ const st=getStatus(s.quantities?.[sk]?.[it.id],it.minQty); if(st==="low"||st==="zero")c++; })); return c; }
function orderCount(orders={}){ return Object.values(orders||{}).filter(v=>Number(v)>0).length; }

function Modal({title,onClose,children}){ return <div className="modal"><button className="modal-backdrop" onClick={onClose}/><div className="modal-card"><div className="modal-header"><strong>{title}</strong><button className="icon-btn" onClick={onClose}>✕</button></div>{children}</div></div>; }

function LoginScreen({onLogin}){
  const [mode,setMode]=useState("employee");
  const [code,setCode]=useState("");
  const [error,setError]=useState("");
  function submit(){
    if(code.trim()===LOGIN_CODES[mode]) onLogin(mode);
    else setError("الكود غير صحيح");
  }
  return <main className="app">
    <header className="top"><div><p>نظام الجرد</p><h1>🍒 كرز وعنب</h1></div></header>
    <section className="content">
      <div className="card modal-content">
        <h3>تسجيل الدخول</h3>
        <p className="muted">اختر نوع الدخول. الموظف يرى شاشة الجرد فقط، والمدير يرى كل التبويبات.</p>
        <div className="actions">
          <button className={mode==="employee"?"primary":"secondary"} onClick={()=>{setMode("employee");setCode("");setError("");}}>موظف</button>
          <button className={mode==="manager"?"primary":"secondary"} onClick={()=>{setMode("manager");setCode("");setError("");}}>مدير</button>
        </div>
        <input type="password" inputMode="numeric" placeholder={mode==="employee"?"كود الموظف":"كود المدير"} value={code} onChange={e=>setCode(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")submit();}} />
        {error && <p style={{color:"#F44336"}}>{error}</p>}
        <button className="primary wide" onClick={submit}>دخول</button>
      </div>
    </section>
  </main>;
}

function SnapshotCard({snap}){
  const [open,setOpen]=useState(false); if(!validSnapshot(snap))return null; const orders=snap.managerOrders||{};
  return <div className="card history-card"><button className="history-head" onClick={()=>setOpen(!open)}><div><strong>{snap.date}</strong><span className="tag blue">موافق عليه</span><p>{snap.branch||"فرع أبو زهرة"} — {orderCount(orders)>0?`طلب المدير ${orderCount(orders)} صنف`:"اطلع المدير بدون طلبية"}</p></div><span>{open?"⌃":"⌄"}</span></button>{open&&<div className="history-body">{Object.entries(snap.sections).map(([sk,sec])=><div key={sk}><h4>{sec.icon} {sk}</h4>{sec.items.map(it=>{ const emp=snap.quantities?.[sk]?.[it.id]; const st=getStatus(emp,it.minQty); const manager=orders[`${sk}-${it.id}`]; return <div className="row small" key={it.id}><span>{it.name}</span><strong className={st}>الموجود: {emp===""||emp===undefined?"—":emp} {it.unit}</strong><small>{Number(manager)>0?`المطلوب: ${manager} ${it.unit}`:"لا طلب"}</small></div>; })}</div>)}</div>}</div>;
}

function ManagerSnapshot({snap,onDone}){
  const [open,setOpen]=useState(false); const [openSec,setOpenSec]=useState(null); const [order,setOrder]=useState(snap.managerOrders||{}); const [busy,setBusy]=useState(false); if(!validSnapshot(snap))return null;
  function supplierText(sk){ const sec=snap.sections[sk]; const lines=sec.items.filter(it=>Number(order[`${sk}-${it.id}`]||0)>0).map(it=>`• ${it.name}: ${order[`${sk}-${it.id}`]} ${it.unit}`).join("\n"); return `السلام عليكم، يرجى تزويدنا بالطلبية التالية:\n${sk}\n\n${lines}\n\nكرز وعنب`; }
  function sendSupplier(sk){ const text=supplierText(sk); if(!text.includes("•")){ alert("أدخل كمية طلب واحدة على الأقل في هذا القسم"); return; } window.open("https://wa.me/?text="+encodeURIComponent(text),"_blank"); }
  async function closeReview(type){ if(!snap.firestoreId){alert("لا يوجد معرف للحفظ"); return;} setBusy(true); try{ await updateDoc(doc(db,FIREBASE_COLLECTION,snap.firestoreId),{status:"reviewed",sentByEmployee:false,reviewType:type,managerOrders:type==="seen"?{}:order,reviewedAt:serverTimestamp()}); alert(type==="seen"?"تم نقل الجرد إلى السجل":"تم حفظ لقطة المدير ونقلها إلى السجل"); onDone(); }catch(e){ console.error(e); alert("تعذر الحفظ"); }finally{ setBusy(false); } }
  return <div className="card history-card"><button className="history-head" onClick={()=>setOpen(!open)}><div><strong>{snap.date}</strong><span className="tag blue">بانتظار الإدارة</span><p>{snap.branch||"فرع أبو زهرة"} — جرد الموظف ظاهر لكل صنف</p></div><span>{open?"⌃":"⌄"}</span></button>{open&&<div className="history-body"><div className="actions"><button className="secondary" disabled={busy} onClick={()=>closeReview("seen")}>✅ اطلعت</button><button className="primary" disabled={busy} onClick={()=>closeReview("ordered")}>💾 حفظ لقطة المدير</button></div>{Object.entries(snap.sections).map(([sk,sec])=>{ const secOpen=openSec===sk; return <div className="section-card" key={sk}><button className="section-head" style={{borderColor:sec.color}} onClick={()=>setOpenSec(secOpen?null:sk)}><span className="emoji">{sec.icon}</span><span><strong style={{color:sec.color}}>{sk}</strong><small>{sec.items.length} صنف</small></span><b>{secOpen?"⌃":"⌄"}</b></button>{secOpen&&<div className="items"><div className="row small"><span>الصنف</span><strong>جرد الموظف</strong><small>طلب المدير</small></div>{sec.items.map(it=>{ const emp=snap.quantities?.[sk]?.[it.id]; const st=getStatus(emp,it.minQty); return <div className={`row ${st}`} key={it.id}><span>{it.name}</span><strong>{emp===""||emp===undefined?"—":emp} {it.unit}</strong><input type="number" inputMode="decimal" placeholder="طلب" value={order[`${sk}-${it.id}`]||""} onChange={e=>setOrder(p=>({...p,[`${sk}-${it.id}`]:e.target.value}))} style={{width:72,borderRadius:10,padding:7,background:"#1A1A2E",color:"#fff",border:"1px solid #C8A96E55",textAlign:"center"}}/></div>; })}<button className="primary wide" onClick={()=>sendSupplier(sk)}>📲 إرسال هذا القسم للمورد</button></div>}</div>; })}</div>}</div>;
}

export default function App(){
  const [sections,setSections]=useState(INITIAL_SECTIONS);
  const [quantities,setQuantities]=useState(()=>emptyQty(INITIAL_SECTIONS));
  const [history,setHistory]=useState([]);
  const [activeTab,setActiveTab]=useState("جرد");
  const [openSection,setOpenSection]=useState("العبوات");
  const [toast,setToast]=useState("");
  const [sendOpen,setSendOpen]=useState(false);
  const [loading,setLoading]=useState(false);
  const [settingsOpen,setSettingsOpen]=useState(null);
  const [newItem,setNewItem]=useState({name:"",unit:"حبة",minQty:5});
  const [addingSec,setAddingSec]=useState(false);
  const [newSec,setNewSec]=useState({name:"",icon:"📦",color:"#C8A96E"});
  const [role,setRole]=useState(()=>localStorage.getItem(ROLE_KEY)||"");

  useEffect(()=>{ loadHistory(); try{ const d=JSON.parse(localStorage.getItem(DRAFT_KEY)||"null"); if(d?.quantities)setQuantities(d.quantities); }catch{} },[]);
  useEffect(()=>{ if(role==="employee" && activeTab!=="جرد") setActiveTab("جرد"); },[role,activeTab]);

  function login(nextRole){ localStorage.setItem(ROLE_KEY,nextRole); setRole(nextRole); setActiveTab("جرد"); }
  function logout(){ localStorage.removeItem(ROLE_KEY); setRole(""); setActiveTab("جرد"); }

  async function loadHistory(){ try{ const q=query(collection(db,FIREBASE_COLLECTION),orderBy("createdAt","desc")); const snap=await getDocs(q); setHistory(snap.docs.map(doc=>({firestoreId:doc.id,...doc.data()})).filter(validSnapshot)); }catch(e){ console.error(e); showToast("تعذر تحميل السجل من Firebase"); } }
  function showToast(m){ setToast(m); setTimeout(()=>setToast(""),2500); }
  const allItems=useMemo(()=>{ const a=[]; Object.entries(sections).forEach(([sk,sec])=>sec.items.forEach(it=>a.push({sk,sec,it,val:quantities[sk]?.[it.id]??""}))); return a; },[sections,quantities]);
  const enteredCount=allItems.filter(x=>x.val!=="").length;
  const pending=history.filter(s=>s.status==="submitted");
  const reviewed=history.filter(s=>s.status==="reviewed");
  const managerTabs=[{key:"جرد",label:"جرد"},{key:"الإدارة",label:"الإدارة",badge:pending.length},{key:"السجل",label:"السجل",badge:reviewed.length},{key:"إعدادات",label:"إعدادات"}];
  const tabs=role==="employee"?[{key:"جرد",label:"جرد"}]:managerTabs;
  function setQty(sk,id,v){ setQuantities(p=>({...p,[sk]:{...p[sk],[id]:v}})); }
  function resetInventory(){ setQuantities(emptyQty(sections)); localStorage.removeItem(DRAFT_KEY); }
  function saveDraft(){ const snap={id:Date.now(),date:todayStr(),status:"draft",branch:"فرع أبو زهرة",sections,quantities}; localStorage.setItem(DRAFT_KEY,JSON.stringify(snap)); showToast("تم حفظ الجرد كمسودة على هذا الجهاز"); }
  async function submitToManager(){ setLoading(true); try{ const snap={id:Date.now(),date:todayStr(),status:"submitted",sentByEmployee:true,branch:"فرع أبو زهرة",sections:JSON.parse(JSON.stringify(sections)),quantities:JSON.parse(JSON.stringify(quantities)),createdAt:serverTimestamp()}; await addDoc(collection(db,FIREBASE_COLLECTION),snap); resetInventory(); await loadHistory(); showToast("تم إرسال الجرد للإدارة وتصفير الشاشة"); }catch(e){ console.error(e); showToast("حدث خطأ أثناء الإرسال"); }finally{ setLoading(false); setSendOpen(false); } }
  function deleteItem(sk,id){ setSections(p=>({...p,[sk]:{...p[sk],items:p[sk].items.filter(i=>i.id!==id)}})); setQuantities(p=>{ const c={...(p[sk]||{})}; delete c[id]; return {...p,[sk]:c}; }); }
  function addItem(sk){ if(!newItem.name.trim())return showToast("أدخل اسم الصنف"); const id="x"+Date.now(); const it={id,name:newItem.name.trim(),unit:newItem.unit,minQty:Number(newItem.minQty)||1}; setSections(p=>({...p,[sk]:{...p[sk],items:[...p[sk].items,it]}})); setQuantities(p=>({...p,[sk]:{...(p[sk]||{}),[id]:""}})); setNewItem({name:"",unit:"حبة",minQty:5}); showToast("تمت إضافة الصنف"); }
  function editMin(sk,id,v){ setSections(p=>({...p,[sk]:{...p[sk],items:p[sk].items.map(i=>i.id===id?{...i,minQty:Number(v)||0}:i)}})); }
  function addSection(){ const name=newSec.name.trim(); if(!name)return showToast("أدخل اسم القسم"); if(sections[name])return showToast("القسم موجود مسبقًا"); setSections(p=>({...p,[name]:{icon:newSec.icon||"📦",color:newSec.color||"#C8A96E",items:[]}})); setQuantities(p=>({...p,[name]:{}})); setNewSec({name:"",icon:"📦",color:"#C8A96E"}); setAddingSec(false); }
  function deleteSection(sk){ if(!confirm(`حذف قسم ${sk}؟`))return; setSections(p=>{ const c={...p}; delete c[sk]; return c; }); setQuantities(p=>{ const c={...p}; delete c[sk]; return c; }); }

  if(!role) return <LoginScreen onLogin={login}/>;

  return <main className="app">
    <header className="top"><div><p>فرع أبو زهرة — {todayStr()} — {role==="manager"?"مدير":"موظف"}</p><h1>🍒 كرز وعنب</h1></div><div className="counter"><strong>{enteredCount}/{allItems.length}</strong><span>تم إدخاله</span><button className="icon-btn" onClick={logout}>خروج</button></div></header>
    <div className="progress"><span style={{width:`${allItems.length?(enteredCount/allItems.length)*100:0}%`}}/></div>
    <nav className="tabs">{tabs.map(t=><button key={t.key} className={activeTab===t.key?"active":""} onClick={()=>setActiveTab(t.key)}>{t.label}{!!t.badge&&<em>{t.badge}</em>}</button>)}</nav>
    <section className="content">
      {activeTab==="جرد"&&<><div className="note">شاشة الموظف: أدخل أرقام الجرد. حفظ = مسودة للرجوع لاحقًا. إرسال للمدير = إرسال للإدارة وتصفير الشاشة.</div>{Object.entries(sections).map(([sk,sec])=>{ const isOpen=openSection===sk; const ent=sec.items.filter(it=>quantities[sk]?.[it.id]!=="").length; return <div className="section-card" key={sk}><button className="section-head" style={{borderColor:sec.color}} onClick={()=>setOpenSection(isOpen?"":sk)}><span className="emoji">{sec.icon}</span><span><strong style={{color:sec.color}}>{sk}</strong><small>{ent}/{sec.items.length} صنف</small></span><b>{isOpen?"⌃":"⌄"}</b></button>{isOpen&&<div className="items">{sec.items.map(it=>{ const v=quantities[sk]?.[it.id]??""; const st=getStatus(v,it.minQty); return <div className={`item ${st}`} key={it.id}><div><strong>{it.name}</strong><small>{it.unit} — حد أدنى {it.minQty}</small></div><input inputMode="decimal" type="number" value={v} placeholder="العدد" onChange={e=>setQty(sk,it.id,e.target.value)}/></div>; })}</div>}</div>; })}</>}
      {role==="manager"&&activeTab==="الإدارة"&&<><div className="note blue">شاشة الإدارة: يظهر هنا فقط الجرد الذي يحتاج إجراء. بعد اطلعت أو حفظ لقطة المدير ينتقل مباشرة إلى السجل.</div>{pending.length===0?<div className="empty">لا توجد جرود بانتظار الإدارة</div>:pending.map(s=><ManagerSnapshot key={s.firestoreId||s.id} snap={s} onDone={loadHistory}/>)}</>}
      {role==="manager"&&activeTab==="السجل"&&<><div className="note">السجل: فقط الجرود التي اعتمدها المدير. يظهر رقم الموظف ورقم طلب المدير إن وجد.</div>{reviewed.length===0?<div className="empty">لا توجد جرود معتمدة في السجل بعد</div>:reviewed.map(s=><SnapshotCard key={s.firestoreId||s.id} snap={s}/>)}</>}
      {role==="manager"&&activeTab==="إعدادات"&&<div><div className="note">إدارة الأقسام والأصناف: إضافة قسم، إضافة صنف، تعديل الحد الأدنى، وحذف.</div>{Object.entries(sections).map(([sk,sec])=><div className="card" key={sk}><div className="supplier-head"><button onClick={()=>setSettingsOpen(settingsOpen===sk?null:sk)}><span>{sec.icon} {sk}</span></button><button onClick={()=>deleteSection(sk)}>حذف القسم</button></div>{settingsOpen===sk&&<div className="modal-content">{sec.items.map(it=><div className="row" key={it.id}><span>{it.name} ({it.unit})</span><input type="number" value={it.minQty} onChange={e=>editMin(sk,it.id,e.target.value)} style={{width:65,borderRadius:8,padding:5,background:"#0F1117",color:"#fff",border:"1px solid #C8A96E55"}}/><button onClick={()=>deleteItem(sk,it.id)}>حذف</button></div>)}<div className="summary"><input placeholder="اسم الصنف" value={newItem.name} onChange={e=>setNewItem(p=>({...p,name:e.target.value}))}/><select value={newItem.unit} onChange={e=>setNewItem(p=>({...p,unit:e.target.value}))}>{["حبة","كجم","لتر","علبة","باكيت","قالب","ربطة"].map(u=><option key={u}>{u}</option>)}</select><input type="number" value={newItem.minQty} onChange={e=>setNewItem(p=>({...p,minQty:e.target.value}))}/><button className="primary" onClick={()=>addItem(sk)}>إضافة صنف</button></div></div>}</div>)}{addingSec?<div className="card modal-content"><input placeholder="اسم القسم" value={newSec.name} onChange={e=>setNewSec(p=>({...p,name:e.target.value}))}/><input placeholder="الأيقونة" value={newSec.icon} onChange={e=>setNewSec(p=>({...p,icon:e.target.value}))}/><input type="color" value={newSec.color} onChange={e=>setNewSec(p=>({...p,color:e.target.value}))}/><button className="primary wide" onClick={addSection}>إضافة القسم</button></div>:<button className="secondary wide" onClick={()=>setAddingSec(true)}>+ إضافة قسم جديد</button>}</div>}
    </section>
    {activeTab==="جرد"&&<footer className="bottom"><button className="secondary" disabled={loading} onClick={saveDraft}>💾 حفظ</button><button className="primary" disabled={loading} onClick={()=>setSendOpen(true)}>📤 إرسال للمدير</button></footer>}
    {sendOpen&&<Modal title="إرسال الجرد للمدير" onClose={()=>setSendOpen(false)}><div className="modal-content"><p>سيتم إرسال لقطة كاملة من شاشة الجرد للإدارة، ثم تصفير شاشة الموظف.</p><button className="primary wide" disabled={loading} onClick={submitToManager}>تأكيد الإرسال</button></div></Modal>}
    {toast&&<div className="toast">{toast}</div>}
  </main>;
}
