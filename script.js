// =======================
// إعدادات المطعم
// =======================
const STORE_NAME = "مطعم إدريس الشعبي";
const STORE_LOGO_URL = "YOUR_LOGO_LINK_HERE.png";  // ← بعد ما نفرغ الخلفية نحط الرابط
const WHATSAPP_NUMBER = "966593937921";

const API_URL =
  "https://script.google.com/macros/s/AKfycbyWxMo-vJldUk48xCwMBxlDsgo14byzJqRSbM8PmZUnC0dEUmz0iOQspi7ZwBDx-tmi/exec";

let CATEGORIES = []; 
let cart = {}; 
let currentProduct = null;

// =======================
// عناصر الصفحة
// =======================
const storeNameEl = document.getElementById("storeName");
const storeLogoEl = document.getElementById("storeLogo");
const categoryTabsEl = document.getElementById("categoryTabs");
const menuListEl = document.getElementById("menuList");
const cartBarEl = document.getElementById("cartBar");

const productSheetOverlay = document.getElementById("productSheetOverlay");
const productSheetName = document.getElementById("sheetProductName");
const productSheetPrice = document.getElementById("sheetProductPrice");
const sheetQtyEl = document.getElementById("sheetQty");
const sheetNoteEl = document.getElementById("sheetNote");

const cartItemsListEl = document.getElementById("cartItemsList");
const cartTotalEl = document.getElementById("cartTotal");
const cartTotalBottomEl = document.getElementById("cartTotalBottom");

const customerName = document.getElementById("customerName");
const customerPhone = document.getElementById("customerPhone");

// =======================
// تهيئة الاسم والشعار
// =======================
storeNameEl.textContent = STORE_NAME;
storeLogoEl.src = STORE_LOGO_URL;

// =======================
// تحميل المنيو من Google
// =======================
(async function loadMenu() {
  try {
    console.log("🔄 بدء تحميل القائمة...");
    menuListEl.innerHTML =
      "<p style='text-align:center;color:#9ca3af;margin-top:20px;'>جارٍ تحميل القائمة...</p>";

    console.log("📡 إرسال طلب إلى /menu");
    // Add cache-busting parameter
    const cacheBust = `?_t=${Date.now()}`;
const response = await fetch(`${API_URL}?_t=${Date.now()}`);
    console.log("✅ استلام رد:", response.status, response.statusText, response.url);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Response error body:", errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("📦 البيانات المستلمة:", data);
    console.log("📊 عدد العناصر:", data.length || data.items?.length);
    
    handleMenuData(data.items || data);
    console.log("✔️ تم تحميل القائمة بنجاح!");
  } catch (error) {
    console.error("❌ خطأ في تحميل القائمة:", error);
    menuListEl.innerHTML =
      "<p style='text-align:center;color:red;margin-top:20px;'>تعذر تحميل القائمة: " + error.message + "</p>";
  }
})();

// =======================
// Google Data → أقسام
// =======================
function handleMenuData(items) {
  console.log("🎯 handleMenuData received items:", items);
  console.log("🎯 Items type:", Array.isArray(items) ? "Array" : typeof items);
  console.log("🎯 Items length:", items?.length);
  
  const sectionMap = {};
  items.forEach((row, index) => {
    console.log(`📋 Processing item ${index}:`, row);
    const sectionName = row.section || "أخرى";
    if (!sectionMap[sectionName]) sectionMap[sectionName] = [];
    if (!row.name) {
      console.log(`⚠️ Skipping item ${index} - no name`);
      return;
    }
    if (row.status.includes("غير")) {
      console.log(`⚠️ Skipping item ${index} - status contains 'غير'`);
      return;
    }

    sectionMap[sectionName].push({
      id: `p-${index}`,
      name: row.name,
      price: Number(row.price) || 0
    });
  });

  console.log("🗂️ Section map:", sectionMap);

  CATEGORIES = Object.entries(sectionMap).map(([name, products], idx) => ({
    id: `sec-${idx}`,
    name,
    products
  }));

  console.log("📚 CATEGORIES created:", CATEGORIES);
  console.log("🎨 Calling renderCategoryTabs...");
  renderCategoryTabs();
  console.log("🍽️ Calling renderMenu...");
  renderMenu();
  console.log("✅ Done!");
}

// =======================
// رسم التابات (الأقسام)
// =======================
function renderCategoryTabs() {
  categoryTabsEl.innerHTML = "";
  if (!CATEGORIES.length) return;

  CATEGORIES.forEach((cat, index) => {
    const btn = document.createElement("button");
    btn.className = "category-tab";
    if (index === 0) btn.classList.add("active");
    btn.textContent = cat.name;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".category-tab").forEach(el => el.classList.remove("active"));
      btn.classList.add("active");
      const section = document.getElementById(`section-${cat.id}`);
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    categoryTabsEl.appendChild(btn);
  });
}

// =======================
// رسم قائمة المنيو
// =======================
function renderMenu() {
  menuListEl.innerHTML = "";
  if (!CATEGORIES.length) {
    menuListEl.innerHTML = "<p style='text-align:center;color:#9ca3af;margin-top:20px;'>لا توجد أصناف متاحة حالياً.</p>";
    return;
  }

  CATEGORIES.forEach((cat) => {
    const section = document.createElement("section");
    section.className = "category-section";
    section.id = `section-${cat.id}`;

    const title = document.createElement("h2");
    title.className = "category-title";
    title.textContent = cat.name;
    section.appendChild(title);

    cat.products.forEach((p) => {
      const card = document.createElement("div");
      card.className = "product-card";

      const info = document.createElement("div");
      info.className = "product-info";

      const name = document.createElement("div");
      name.className = "product-name";
      name.textContent = p.name;

      const price = document.createElement("div");
      price.className = "product-price";
      price.textContent = `${p.price} ريال`;

      info.appendChild(name);
      info.appendChild(price);

      const arrow = document.createElement("div");
      arrow.className = "product-arrow";
      arrow.textContent = "›";

      card.appendChild(info);
      card.appendChild(arrow);
      card.addEventListener("click", () => openProductSheet(p, cat.name));

      section.appendChild(card);
    });

    menuListEl.appendChild(section);
  });
}

// =======================
// تحديث السلة
// =======================
function updateCart() {
  let total = 0;
  const items = Object.values(cart);
  
  items.forEach((item) => {
    total += item.price * item.qty;
  });

  cartTotalEl.textContent = `${total} ريال`;
  cartTotalBottomEl.textContent = `${total} ريال`;

  if (total <= 0) {
    cartBarEl.classList.add("hidden");
  } else {
    cartBarEl.classList.remove("hidden");
  }

  // رسم عناصر السلة
  cartItemsListEl.innerHTML = "";
  if (items.length === 0) {
    cartItemsListEl.innerHTML = "<p style='text-align:center;color:#9ca3af;font-size:13px;'>السلة فارغة حالياً.</p>";
    return;
  }

  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-item-row";

    const infoBox = document.createElement("div");
    infoBox.className = "cart-item-info";

    const nameEl = document.createElement("div");
    nameEl.className = "cart-item-name";
    nameEl.textContent = item.name;

    const metaEl = document.createElement("div");
    metaEl.className = "cart-item-meta";
    metaEl.textContent = `الكمية: ${item.qty}`;
    if (item.note) metaEl.textContent += ` - ${item.note}`;

    infoBox.appendChild(nameEl);
    infoBox.appendChild(metaEl);

    const rightBox = document.createElement("div");
    rightBox.style.display = "flex";
    rightBox.style.alignItems = "center";

    const priceEl = document.createElement("div");
    priceEl.className = "cart-item-price";
    priceEl.textContent = `${item.price * item.qty} ريال`;

    const removeBtn = document.createElement("button");
    removeBtn.className = "cart-remove";
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", () => {
      delete cart[item.id];
      updateCart();
    });

    rightBox.appendChild(priceEl);
    rightBox.appendChild(removeBtn);

    row.appendChild(infoBox);
    row.appendChild(rightBox);
    cartItemsListEl.appendChild(row);
  });
}

// =======================
// فتح المنتج
// =======================
function openProductSheet(product, categoryName) {
  currentProduct = { ...product, categoryName };
  sheetQtyEl.textContent = "1";
  sheetNoteEl.value = "";
  productSheetName.textContent = product.name;
  productSheetPrice.textContent = `${product.price} ريال`;
  productSheetOverlay.classList.add("active");
}

// =======================
// إضافة للسلة
// =======================
document.getElementById("addToCartBtn").addEventListener("click", () => {
  if (!currentProduct) return;

  const qty = +sheetQtyEl.textContent;
  const note = sheetNoteEl.value.trim();
  const p = cart[currentProduct.id] || {
    id: currentProduct.id,
    name: currentProduct.name,
    price: currentProduct.price,
    qty: 0,
    categoryName: currentProduct.categoryName,
    note: ""
  };

  p.qty += qty;
  if (note) p.note = note;

  cart[currentProduct.id] = p;
  updateCart();
  productSheetOverlay.classList.remove("active");
});

// =======================
// إرسال واتساب
// =======================
document.getElementById("sendWhatsappBtn").addEventListener("click", () => {
  const items = Object.values(cart);
  if (!items.length) return alert("السلة فارغة");

  let total = 0, text = `السلام عليكم 🌟\nطلب جديد من ${STORE_NAME}:\n\n`;

  items.forEach((it) => {
    total += it.price * it.qty;
    text += `• ${it.name} × ${it.qty} = ${it.price * it.qty} ريال`;
    if (it.note) text += ` (ملاحظة: ${it.note})`;
    text += "\n";
  });

  text += `\nالإجمالي: ${total} ريال\n\n`;
  if (customerName.value) text += `اسم العميل: ${customerName.value}\n`;
  if (customerPhone.value) text += `رقم الجوال: ${customerPhone.value}\n`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
});

// =======================
// الأحداث الأخرى
// =======================
// زيادة/تقليل الكمية
document.getElementById("qtyPlus").addEventListener("click", () => {
  let q = parseInt(sheetQtyEl.textContent, 10);
  sheetQtyEl.textContent = String(q + 1);
});

document.getElementById("qtyMinus").addEventListener("click", () => {
  let q = parseInt(sheetQtyEl.textContent, 10);
  if (q > 1) sheetQtyEl.textContent = String(q - 1);
});

// إغلاق شيت المنتج
document.getElementById("closeProductSheet").addEventListener("click", () => {
  productSheetOverlay.classList.remove("active");
});

// فتح/إغلاق السلة
document.getElementById("openCartBtn").addEventListener("click", () => {
  document.getElementById("cartSheetOverlay").classList.add("active");
});

document.getElementById("closeCartSheet").addEventListener("click", () => {
  document.getElementById("cartSheetOverlay").classList.remove("active");
});

// إغلاق الطبقات عند الضغط خارجها
productSheetOverlay.addEventListener("click", (e) => {
  if (e.target === productSheetOverlay) {
    productSheetOverlay.classList.remove("active");
  }
});

document.getElementById("cartSheetOverlay").addEventListener("click", (e) => {
  if (e.target === document.getElementById("cartSheetOverlay")) {
    document.getElementById("cartSheetOverlay").classList.remove("active");
  }
});

// تهيئة السلة في البداية
updateCart();
