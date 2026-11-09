// ===== PRODUCTOS (edita aquí: nombre, precio, tallas y la ruta de tu foto en "img") =====
const TALLAS = ["S", "M", "L", "XL"];
const productos = [
  { id: 1, nombre: "Camiseta titular", cat: "camisetas", precio: 229900, tallas: TALLAS, emoji: "👕", img: "", desc: "Camiseta de juego en tela liviana y transpirable, con el escudo al pecho." },
  { id: 2, nombre: "Camiseta visitante", cat: "camisetas", precio: 229900, tallas: TALLAS, emoji: "👕", img: "", desc: "Diseño alterno para alentar fuera de casa, con acabado ligero y cómodo." },
  { id: 3, nombre: "Camiseta de entrenamiento", cat: "camisetas", precio: 149900, tallas: TALLAS, emoji: "🎽", img: "", desc: "Ideal para entrenar o jugar con tus amigos. Seca rápido y no pesa." },
  { id: 4, nombre: "Gorra clásica", cat: "accesorios", precio: 79900, tallas: null, emoji: "🧢", img: "", desc: "Gorra ajustable con el escudo bordado al frente." },
  { id: 5, nombre: "Gorra snapback", cat: "accesorios", precio: 89900, tallas: null, emoji: "🧢", img: "", desc: "Visera plana y cierre ajustable. Para el día a día y la tribuna." },
  { id: 6, nombre: "Bufanda de hincha", cat: "accesorios", precio: 59900, tallas: null, emoji: "🧣", img: "", desc: "Bufanda tejida en verde y blanco para los días de partido." },
  { id: 7, nombre: "Buzo con capota", cat: "casual", precio: 189900, tallas: TALLAS, emoji: "🧥", img: "", desc: "Buzo grueso y suave con capota y bolsillo canguro." },
  { id: 8, nombre: "Chaqueta rompevientos", cat: "casual", precio: 219900, tallas: TALLAS, emoji: "🧥", img: "", desc: "Ligera e impermeable, perfecta para el clima de la tarde." },
  { id: 9, nombre: "Camiseta casual", cat: "casual", precio: 99900, tallas: TALLAS, emoji: "👕", img: "", desc: "Algodón suave con estampado del escudo para usar todos los días." },
  { id: 10, nombre: "Termo verdolaga", cat: "souvenirs", precio: 69900, tallas: null, emoji: "🥤", img: "", desc: "Termo de acero que mantiene tu bebida fría o caliente por horas." },
  { id: 11, nombre: "Llavero del escudo", cat: "souvenirs", precio: 24900, tallas: null, emoji: "🔑", img: "", desc: "Llavero metálico con el escudo, un detalle pequeño y fácil de regalar." },
  { id: 12, nombre: "Balón mini", cat: "souvenirs", precio: 64900, tallas: null, emoji: "⚽", img: "", desc: "Balón de colección en tamaño mini, para firmar o decorar." }
];
const CATS = { camisetas: "Camisetas y uniformes", accesorios: "Gorras y accesorios", casual: "Ropa casual", souvenirs: "Souvenirs" };

// ===== ESTADO =====
const $ = s => document.querySelector(s);
const cop = n => n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const thumb = p => p.img ? `<img src="${p.img}" alt="${p.nombre}">` : p.emoji;
let filtro = "todos", q = "", actual = null, talla = null, carrito = [], aviso;
try { carrito = JSON.parse(localStorage.getItem("verdolaga")) || []; } catch (e) {}
carrito = carrito.filter(i => productos.some(p => p.id === i.id));
const guardar = () => { try { localStorage.setItem("verdolaga", JSON.stringify(carrito)); } catch (e) {} };

// ===== CATÁLOGO =====
function pintar() {
  const lista = productos.filter(p => (filtro === "todos" || p.cat === filtro) && (p.nombre + " " + CATS[p.cat]).toLowerCase().includes(q));
  $("#grid").innerHTML = lista.map(p => `
    <article class="card">
      <div class="ph" data-ver="${p.id}">${thumb(p)}</div>
      <div class="info">
        <span class="cat">${CATS[p.cat]}</span>
        <h3>${p.nombre}</h3>
        <span class="precio">${cop(p.precio)}</span>
        <button class="btn-sm" data-ver="${p.id}">Ver producto</button>
      </div>
    </article>`).join("");
  $("#vacio").hidden = lista.length > 0;
}

function pintarFiltros() {
  $("#filtros").innerHTML = `<button data-cat="todos">Todos</button>` +
    Object.entries(CATS).map(([k, v]) => `<button data-cat="${k}">${v}</button>`).join("");
  marcarFiltro();
}
const marcarFiltro = () => document.querySelectorAll("[data-cat]").forEach(b => b.classList.toggle("on", b.dataset.cat === filtro));

// ===== DETALLE DEL PRODUCTO =====
function ver(id) {
  actual = productos.find(p => p.id == id);
  talla = null;
  const p = actual;
  $("#detalle").innerHTML = `
    <button class="cerrar" data-cerrar aria-label="Cerrar">✕</button>
    <div class="det">
      <div class="ph">${thumb(p)}</div>
      <div class="txt">
        <span class="cat">${CATS[p.cat]}</span>
        <h3>${p.nombre}</h3>
        <span class="precio">${cop(p.precio)}</span>
        <p>${p.desc}</p>
        ${p.tallas ? `<div><b>Elige tu talla</b><div class="tallas">${p.tallas.map(t => `<button data-talla="${t}">${t}</button>`).join("")}</div></div>` : ""}
        <button class="btn-sm" data-add>Agregar al carrito</button>
      </div>
    </div>`;
  $("#modal").showModal();
}

// ===== CARRITO =====
function agregar() {
  const p = actual;
  if (p.tallas && !talla) return avisar("Elige una talla primero");
  const key = p.id + "-" + (talla || "u");
  const it = carrito.find(i => i.key === key);
  it ? it.cant++ : carrito.push({ key, id: p.id, talla, cant: 1 });
  guardar(); pintarCarrito();
  $("#modal").close();
  avisar("Agregado al carrito");
}

function cambiar(key, d) {
  const i = carrito.find(x => x.key === key);
  i.cant += d;
  if (i.cant < 1) carrito = carrito.filter(x => x !== i);
  guardar(); pintarCarrito();
}

function pintarCarrito() {
  let total = 0, n = 0;
  $("#items").innerHTML = carrito.length ? carrito.map(i => {
    const p = productos.find(x => x.id === i.id);
    total += p.precio * i.cant; n += i.cant;
    return `<div class="item">
      <div class="mini">${thumb(p)}</div>
      <div><b>${p.nombre}</b>${i.talla ? " · Talla " + i.talla : ""}<br>${cop(p.precio)}</div>
      <div class="cant"><button data-menos="${i.key}" aria-label="Quitar uno">−</button>${i.cant}<button data-mas="${i.key}" aria-label="Agregar uno">+</button></div>
    </div>`;
  }).join("") : `<p class="vacio">Tu carrito está vacío. Agrega tu primer producto.</p>`;
  $("#total").textContent = cop(total);
  $("#contador").textContent = n;
  $("#pagar").disabled = !carrito.length;
}

const panel = on => { $("#carrito").classList.toggle("open", on); $("#overlay").classList.toggle("on", on); };

function avisar(msg) {
  const t = $("#toast");
  t.textContent = msg; t.classList.add("on");
  clearTimeout(aviso);
  aviso = setTimeout(() => t.classList.remove("on"), 2200);
}

// ===== EVENTOS =====
document.addEventListener("click", e => {
  const d = e.target.closest("[data-ver],[data-cat],[data-talla],[data-add],[data-cerrar],[data-mas],[data-menos]");
  if (!d) return;
  const s = d.dataset;
  if (s.ver) ver(s.ver);
  else if (s.cat) { filtro = s.cat; marcarFiltro(); pintar(); }
  else if (s.talla) { talla = s.talla; document.querySelectorAll("[data-talla]").forEach(b => b.classList.toggle("on", b === d)); }
  else if ("add" in s) agregar();
  else if ("cerrar" in s) $("#modal").close();
  else if (s.mas) cambiar(s.mas, 1);
  else if (s.menos) cambiar(s.menos, -1);
});

$("#buscar").addEventListener("input", e => { q = e.target.value.toLowerCase().trim(); pintar(); });
$("#modal").addEventListener("click", e => { if (e.target === e.currentTarget) e.currentTarget.close(); });
$("#abrirCarrito").onclick = () => panel(true);
$("#cerrarCarrito").onclick = () => panel(false);
$("#overlay").onclick = () => panel(false);
$("#pagar").onclick = () => {
  carrito = []; guardar(); pintarCarrito(); panel(false);
  avisar("Compra simulada completada. ¡Gracias, hincha!");
};

pintarFiltros();
pintar();
pintarCarrito();
