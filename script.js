const BASE_URL = "http://localhost:3000";

let currentLang = localStorage.getItem('lang') || 'ru';
const translations = {
  ru: {
    menu_title: "Меню",
    get_bonuses: "Получить бонусы",
    spin: "Крутить",
    close: "Закрыть",
    play: "Играть",
    label_bonuses: "Бонусы:",
    soms: "Сомов"
  },
  en: {
    menu_title: "Coffee Menu",
    get_bonuses: "Get Bonuses",
    spin: "Spin",
    close: "Close",
    play: "Play",
    label_bonuses: "Bonuses:",
    soms: "Soms"
  }
};

function applyStaticTranslations() {
  document.querySelectorAll('[data-lang]').forEach(el => {
    const key = el.getAttribute('data-lang');
    if (translations[currentLang] && translations[currentLang][key]) {
      el.textContent = translations[currentLang][key];
    }
  });
  const langBtn = document.getElementById('langToggle');
  if (langBtn) langBtn.textContent = currentLang.toUpperCase();
}

const userName = localStorage.getItem('userName') || 'guest';
let bonusBalance = 0;

async function loadBonus() {
  try {
    const res = await fetch(`${BASE_URL}/api/bonus/${encodeURIComponent(userName)}`);
    if (!res.ok) throw new Error('bonus fetch failed');
    const data = await res.json();
    bonusBalance = data.bonus || 0;
    const footerEl = document.getElementById('bonus-balance-footer');
    if (footerEl) footerEl.textContent = bonusBalance;
  } catch (e) {
    console.warn('loadBonus error', e);
  }
}

async function addBonusToServer(amount) {
  try {
    const res = await fetch(`${BASE_URL}/api/bonus/add`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ username: userName, amount })
    });
    if (!res.ok) throw new Error('bonus add failed');
    await loadBonus();
  } catch (e) {
    console.error('addBonusToServer', e);
  }
}

let carouselTrackEl = null;
let infiniteInited = false;
let autoScrollRAF = null;

async function loadCarouselData() {
  try {
    const track = document.getElementById("carousel-track");
    if (!track) return;
    track.innerHTML = "";

    const catsRes = await fetch(`${BASE_URL}/api/categories`);
    if (!catsRes.ok) return;
    const categories = await catsRes.json();

    let allProducts = [];

    for (const c of categories) {
      try {
        const prodRes = await fetch(`${BASE_URL}/api/products/${encodeURIComponent(c.name)}`);
        if (!prodRes.ok) continue;
        const products = await prodRes.json();
        // normalize in case of empty
        if (Array.isArray(products) && products.length) {
          allProducts.push(...products);
        }
      } catch (e) {
        console.warn('product fetch failed for', c.name, e);
      }
    }

    if (allProducts.length === 0) return;

    // shuffle
    allProducts.sort(() => Math.random() - 0.5);

    // create cards
    allProducts.forEach(item => {
      const title = currentLang === "en" ? (item.name_en || item.name) : (item.name_ru || item.name);
      const comp  = currentLang === "en" ? (item.comp_en || "") : (item.comp_ru || "");
      const imgSrc = item.image_path || '/img/default.png';

      const card = document.createElement("div");
      card.className = "carousel-card";
      // use loading="lazy" to avoid blocking render
      card.innerHTML = `
        <img src="${encodeURI(imgSrc)}" alt="" loading="lazy">
        <div class="carousel-title">${escapeHtml(title)}</div>
        <div class="carousel-comp">${escapeHtml(comp)}</div>
      `;
      track.appendChild(card);
    });

    makeInfiniteCarouselOnce();
  } catch (err) {
    console.error("Carousel load error:", err);
  }
}

function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function makeInfiniteCarouselOnce() {
  const track = document.getElementById("carousel-track");
  if (!track) return;
  if (track.dataset.infinite === '1') return; // already done

  const items = Array.from(track.children);
  if (items.length === 0) return;

  items.forEach(el => {
    const clone = el.cloneNode(true);
    track.appendChild(clone);
  });

  track.dataset.infinite = '1';

  track.addEventListener("mouseenter", () => track.classList.add("paused"));
  track.addEventListener("mouseleave", () => track.classList.remove("paused"));

  enableAutoScrollCarousel();
}

function enableAutoScrollCarousel() {
  const track = document.getElementById("carousel-track");
  if (!track) return;

  if (autoScrollRAF) {
    cancelAnimationFrame(autoScrollRAF);
    autoScrollRAF = null;
  }

  let speed = 0.5;
  let isHovered = false;

  const onEnter = () => isHovered = true;
  const onLeave = () => isHovered = false;

  track.addEventListener('mouseenter', onEnter);
  track.addEventListener('mouseleave', onLeave);

  function step() {
    if (!isHovered) {
      track.scrollLeft += speed;
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 1) {
        track.scrollLeft = 0;
      }
    }
    autoScrollRAF = requestAnimationFrame(step);
  }

  autoScrollRAF = requestAnimationFrame(step);
}

async function renderMenu() {
  try {
    const res = await fetch(`${BASE_URL}/api/categories`);
    if (!res.ok) throw new Error('cats load err');
    const cats = await res.json();

    const container = document.getElementById('dynamic-menu-list');
    if (!container) return;
    container.innerHTML = '';

    for (const c of cats) {
      const catEl = document.createElement('div');
      catEl.className = 'category fade-in';
      const titleText = currentLang === 'en' ? (c.name_en || c.name) : (c.name_ru || c.name);
      catEl.innerHTML = `<h3>${escapeHtml(titleText)} <span style="font-size:14px;color:#9a816f">▾</span></h3><div class="items" id="items-${c.name}"></div>`;
      container.appendChild(catEl);

      setTimeout(()=> catEl.classList.add('visible'), 60);

      const header = catEl.querySelector('h3');
      header.addEventListener('click', async () => {
        catEl.classList.toggle('open');
        const itemsWrap = document.getElementById(`items-${c.name}`);
        if (itemsWrap && itemsWrap.children.length === 0) {
          try {
            const prods = await fetch(`${BASE_URL}/api/products/${encodeURIComponent(c.name)}`).then(r => r.ok ? r.json() : []);
            if (prods && prods.length) {
              prods.forEach(p => {
                const item = document.createElement('div');
                item.className = 'menu-item fade-in pop';
                const name = currentLang === 'en' ? (p.name_en || p.name) : (p.name_ru || p.name);
                const comp = currentLang === 'en' ? (p.comp_en || '') : (p.comp_ru || '');
                item.innerHTML = `
                  <img src="${encodeURI(p.image_path || '/img/default.png')}" alt="" loading="lazy">
                  <div style="flex:1">
                    <div style="font-weight:700">${escapeHtml(name)}</div>
                    <div style="font-size:13px;color:#666">${escapeHtml(comp)}</div>
                  </div>
                  <div style="font-weight:700" class = "soms">${p.cost} Soms</div>
                `;
                itemsWrap.appendChild(item);
                requestAnimationFrame(() => {
                  item.classList.add('visible');
                });
              });
            } else {
              itemsWrap.innerHTML = '<div style="color:#999">No items</div>';
            }
          } catch(e){ console.warn('load prods failed', e); itemsWrap.innerHTML = '<div style="color:#999">No items</div>'; }
        }
      });
    }
  } catch (err) {
    console.error('renderMenu error', err);
  }
}

const rewards = [0,5,10,20,50,100];
function drawWheel(canvasEl) {
  if (!canvasEl) return;
  const ctx = canvasEl.getContext('2d');
  const w = canvasEl.width, h = canvasEl.height, cx = w/2, cy = h/2, r = Math.min(cx,cy)-6;
  ctx.clearRect(0,0,w,h);
  for (let i=0;i<rewards.length;i++){
    const a1 = (i/rewards.length)*Math.PI*2;
    const a2 = ((i+1)/rewards.length)*Math.PI*2;
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.arc(cx,cy,r,a1,a2);
    ctx.closePath();
    ctx.fillStyle = i%2? '#fff4f1' : '#fff8f5';
    ctx.fill();
    ctx.strokeStyle = '#f3d7d4';
    ctx.stroke();

    ctx.save();
    ctx.translate(cx,cy);
    ctx.rotate(a1 + (a2-a1)/2);
    ctx.fillStyle = '#3a2a22';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(rewards[i] + 'b', r - 8, 6);
    ctx.restore();
  }
}

function initWheel() {
  const wheelFooter = document.getElementById('wheel-footer');
  const wheelHandle = document.getElementById('wheelHandle');
  const spinBtn = document.getElementById('spinBtn');
  const closeWheelBtn = document.getElementById('closeWheelBtn');
  const wheelCanvas = document.getElementById('wheelCanvas');
  const wheelEl = document.getElementById('wheel');
  const wheelMsg = document.getElementById('wheel-msg');

  drawWheel(wheelCanvas);

  wheelHandle?.addEventListener('click', () => {
    wheelFooter.classList.toggle('expanded');
    wheelFooter.classList.toggle('collapsed');
  });

  spinBtn?.addEventListener('click', async () => {
    if (spinBtn.disabled) return;
    spinBtn.disabled = true;
    let spinning = true;
    wheelMsg.textContent = (translations[currentLang]?.play || 'Play') + '...';

    const index = Math.floor(Math.random()*rewards.length);
    const full = 360*5;
    const slice = 360 / rewards.length;
    const target = full + (360 - (index*slice) - slice/2) + (Math.random()*slice - slice/2);

    if (wheelEl) {
      wheelEl.style.transition = `transform 4200ms cubic-bezier(.17,.67,.33,1)`;
      wheelEl.style.transform = `rotate(${target}deg)`;
    }

    setTimeout(async ()=>{
      const final = target % 360;
      if (wheelEl) {
        wheelEl.style.transition = 'none';
        wheelEl.style.transform = `rotate(${final}deg)`;
      }

      const reward = rewards[index];
      if (reward>0) await addBonusToServer(reward);
      await loadBonus();
      if (wheelMsg) wheelMsg.textContent = `+${reward} ${translations[currentLang].label_bonuses || 'bonus'}`;
      spinning=false;
      if (spinBtn) spinBtn.disabled=false;
    }, 4300);
  });

  closeWheelBtn?.addEventListener('click', ()=> {
    wheelFooter.classList.remove('expanded');
    wheelFooter.classList.add('collapsed');
  });

  document.addEventListener('keydown', e=> { if (e.key==='Escape') { wheelFooter.classList.add('collapsed'); wheelFooter.classList.remove('expanded'); } });
}

document.addEventListener('DOMContentLoaded', async () => {
  carouselTrackEl = document.getElementById('carousel-track');

  const langBtn = document.getElementById('langToggle');
  langBtn?.addEventListener('click', async () => {
    currentLang = currentLang === 'ru' ? 'en' : 'ru';
    localStorage.setItem('lang', currentLang);
    applyStaticTranslations();
    await renderMenu();
    await loadCarouselData();
  });

  applyStaticTranslations();

  // init services
  await loadBonus();
  await loadCarouselData();
  await renderMenu();
  initWheel();
});
