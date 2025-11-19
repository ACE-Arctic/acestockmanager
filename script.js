/* =========================================================
   RICE STOCK MANAGER — FINAL JS (NO GRAPHS, REPORTS FIXED)
   Includes:
   ✔ Dashboard
   ✔ Products
   ✔ Sales
   ✔ Monthly Reports (Summary + Full Sale List)
   ========================================================= */

/* -------------------- STORAGE -------------------- */
const STORAGE = {
  USERS: "rsm_users_v3",
  PRODUCTS: "rsm_products_v3",
  SALES: "rsm_sales_v3"
};

const DEFAULT_USER = { username: "javeed", password: "javeed0880" };

/* -------------------- LOAD DATA -------------------- */
let users = JSON.parse(localStorage.getItem(STORAGE.USERS) || "[]");
let products = JSON.parse(localStorage.getItem(STORAGE.PRODUCTS) || "[]");
let sales = JSON.parse(localStorage.getItem(STORAGE.SALES) || "[]");

if (!users.length) {
  users = [DEFAULT_USER];
  localStorage.setItem(STORAGE.USERS, JSON.stringify(users));
}

let currentUser = null;

/* -------------------- DOM -------------------- */
const loginBtn = document.getElementById("loginBtn");
const loginBox = document.getElementById("loginBox");
const loginUser = document.getElementById("loginUser");
const loginPass = document.getElementById("loginPass");
const app = document.getElementById("app");
const currentUserLabel = document.getElementById("currentUserLabel");

const logoutBtn = document.getElementById("logoutBtn");

const dashboardMonth = document.getElementById("dashboardMonth");
const cardTotalSales = document.getElementById("cardTotalSales");
const cardTotalProfit = document.getElementById("cardTotalProfit");
const cardItemsSold = document.getElementById("cardItemsSold");
const cardLowStock = document.getElementById("cardLowStock");
const topProductsList = document.getElementById("topProductsList");
const recentSalesList = document.getElementById("recentSalesList");

const pName = document.getElementById("pName");
const pBrand = document.getElementById("pBrand");
const pCost = document.getElementById("pCost");
const pStock = document.getElementById("pStock");
const saveProductBtn = document.getElementById("saveProductBtn");
const clearProductFormBtn = document.getElementById("clearProductFormBtn");
const clearProductsBtn = document.getElementById("clearProductsBtn");
const productList = document.getElementById("productList");

const saleProduct = document.getElementById("saleProduct");
const saleQty = document.getElementById("saleQty");
const salePrice = document.getElementById("salePrice");
const saleDate = document.getElementById("saleDate");
const recordSaleBtn = document.getElementById("recordSaleBtn");
const clearSaleFormBtn = document.getElementById("clearSaleFormBtn");
const resetSalesBtn = document.getElementById("resetSalesBtn");
const salesList = document.getElementById("salesList");

const filterFrom = document.getElementById("filterFrom");
const filterTo = document.getElementById("filterTo");
const applyFilter = document.getElementById("applyFilter");
const clearFilter = document.getElementById("clearFilter");

const reportMonth = document.getElementById("reportMonth");
const monthlySummary = document.getElementById("monthlySummary");

/* -------------------- LOGIN -------------------- */
loginBtn.onclick = function () {
  const u = loginUser.value.trim();
  const p = loginPass.value.trim();

  const found = users.find(x => x.username === u && x.password === p);
  if (!found) return alert("Invalid login!");

  currentUser = found;

  loginBox.style.display = "none";
  app.style.display = "flex";
  currentUserLabel.innerText = found.username;

  initApp();
};

logoutBtn.onclick = () => location.reload();



/* -------------------- TAB NAVIGATION -------------------- */
document.querySelectorAll(".navbtn").forEach(btn => {
  btn.addEventListener("click", () => {
    showTab(btn.dataset.tab);
  });
});

function showTab(tabId) {
  document.querySelectorAll(".tab").forEach(t => t.style.display = "none");
  const tab = document.getElementById(tabId);
  if (tab) tab.style.display = "block";

  document.querySelectorAll(".navbtn").forEach(b => b.classList.remove("active"));
  document.querySelector(`.navbtn[data-tab="${tabId}"]`).classList.add("active");

  if (tabId === "dashboardTab") refreshDashboard();
  if (tabId === "reportsTab") refreshReports();
}

/* -------------------- PRODUCTS -------------------- */
let editingProductId = null;

saveProductBtn.onclick = saveProduct;
clearProductFormBtn.onclick = clearProductForm;

clearProductsBtn.onclick = () => {
  if (!confirm("Delete ALL products?")) return;
  products = [];
  localStorage.setItem(STORAGE.PRODUCTS, JSON.stringify(products));
  renderProducts();
  populateSaleDropdown();
  refreshDashboard();
};

function saveProduct() {
  const name = pName.value.trim();
  const brand = pBrand.value.trim();
  const cost = Number(pCost.value);
  const stock = Number(pStock.value);

  if (!name || !brand || !cost) return alert("Enter product info");

  if (editingProductId) {
    const p = products.find(x => x.id === editingProductId);
    p.name = name;
    p.brand = brand;
    p.cost = cost;
    p.stock = stock;
    editingProductId = null;
  } else {
    products.push({ id: Date.now(), name, brand, cost, stock });
  }

  localStorage.setItem(STORAGE.PRODUCTS, JSON.stringify(products));
  clearProductForm();
  renderProducts();
  populateSaleDropdown();
  refreshDashboard();
}

function editProduct(id) {
  const p = products.find(x => x.id == id);
  editingProductId = id;
  pName.value = p.name;
  pBrand.value = p.brand;
  pCost.value = p.cost;
  pStock.value = p.stock;
}
window.editProduct = editProduct;

function deleteProduct(id) {
  if (!confirm("Delete this product & its sales?")) return;

  products = products.filter(p => p.id != id);
  sales = sales.filter(s => s.productId != id);

  localStorage.setItem(STORAGE.PRODUCTS, JSON.stringify(products));
  localStorage.setItem(STORAGE.SALES, JSON.stringify(sales));

  renderProducts();
  renderSales();
  populateSaleDropdown();
  refreshDashboard();
}
window.deleteProduct = deleteProduct;

function clearProductForm() {
  editingProductId = null;
  pName.value = "";
  pBrand.value = "";
  pCost.value = "";
  pStock.value = "";
}

function renderProducts() {
  productList.innerHTML = "";

  if (!products.length) {
    productList.innerHTML = "<div class='small muted'>No products added</div>";
    return;
  }

  products.forEach(p => {
    const div = document.createElement("div");
    div.className = "productRow";

    div.innerHTML = `
      <div>
        <strong>${p.name}</strong> <span class="small muted">(${p.brand})</span><br>
        <span class="small">Cost: ₹${p.cost} • Stock: ${p.stock}</span>
      </div>

      <div class="rowButtons">
        <button onclick="editProduct(${p.id})">Edit</button>
        <button class="muted" onclick="deleteProduct(${p.id})">Delete</button>
      </div>
    `;

    productList.appendChild(div);
  });
}

/* -------------------- SALES -------------------- */
recordSaleBtn.onclick = recordSale;

clearSaleFormBtn.onclick = () => {
  saleQty.value = 1;
  salePrice.value = "";
};

resetSalesBtn.onclick = () => {
  if (!confirm("Delete ALL sales?")) return;
  sales = [];
  localStorage.setItem(STORAGE.SALES, JSON.stringify(sales));
  renderSales();
  refreshDashboard();
};

applyFilter.onclick = renderSales;

clearFilter.onclick = () => {
  filterFrom.value = "";
  filterTo.value = "";
  renderSales();
};

function recordSale() {
  const productId = Number(saleProduct.value);
  const qty = Number(saleQty.value);
  const price = Number(salePrice.value);
  const date = saleDate.value;

  if (!productId || qty <= 0 || price <= 0) return alert("Fill sale details");

  const p = products.find(x => x.id == productId);

  if (p.stock < qty && !confirm("Stock is low. Continue?")) return;

  p.stock = Math.max(0, p.stock - qty);

  const entry = {
    id: Date.now(),
    sno: sales.length ? Math.max(...sales.map(s => s.sno)) + 1 : 1,
    productId,
    name: p.name,
    brand: p.brand,
    qty,
    sellingPrice: price,
    total: qty * price,
    profit: qty * (price - p.cost),
    date
  };

  sales.push(entry);

  localStorage.setItem(STORAGE.PRODUCTS, JSON.stringify(products));
  localStorage.setItem(STORAGE.SALES, JSON.stringify(sales));

  renderProducts();
  renderSales();
  populateSaleDropdown();
  refreshDashboard();

  saleQty.value = 1;
  salePrice.value = "";
}

function deleteSale(id) {
  if (!confirm("Delete this sale entry?")) return;

  sales = sales.filter(s => s.id !== id);
  localStorage.setItem(STORAGE.SALES, JSON.stringify(sales));

  renderSales();
  refreshDashboard();
}
window.deleteSale = deleteSale;

function renderSales() {
  salesList.innerHTML = "";

  let data = [...sales].sort((a,b) => b.sno - a.sno);

  if (filterFrom.value) data = data.filter(s => s.date >= filterFrom.value);
  if (filterTo.value) data = data.filter(s => s.date <= filterTo.value);

  if (!data.length) {
    salesList.innerHTML = "<div class='small muted'>No sales found</div>";
    return;
  }

  data.forEach(s => {
    const div = document.createElement("div");
    div.className = "saleRow";

    div.innerHTML = `
      <div>
        <strong>SNo ${s.sno}</strong> • ${s.date}<br>
        <span class="small">${s.name} (${s.brand}) — Qty ${s.qty}</span><br>
        <span class="small">Total ₹${s.total} • Profit ₹${s.profit}</span>
      </div>
      <button class="muted" onclick="deleteSale(${s.id})">Delete</button>
    `;

    salesList.appendChild(div);
  });
}

/* -------------------- DASHBOARD -------------------- */
dashboardMonth.onchange = refreshDashboard;

function refreshDashboard() {
  const month = dashboardMonth.value || new Date().toISOString().slice(0,7);

  const filtered = sales.filter(s => s.date && s.date.startsWith(month));

  const totalSales = filtered.reduce((a,b)=>a+b.total,0);
  const totalProfit = filtered.reduce((a,b)=>a+b.profit,0);
  const totalItems = filtered.reduce((a,b)=>a+b.qty,0);
  const lowStock = products.filter(p => p.stock <= 5).length;

  cardTotalSales.innerText = "₹" + totalSales.toLocaleString("en-IN");
  cardTotalProfit.innerText = "₹" + totalProfit.toLocaleString("en-IN");
  cardItemsSold.innerText = totalItems;
  cardLowStock.innerText = lowStock;

  // Top selling
  const t = {};
  filtered.forEach(s => t[s.name] = (t[s.name] || 0) + s.qty);

  topProductsList.innerHTML = "";
  Object.entries(t).sort((a,b)=>b[1]-a[1]).slice(0,5).forEach(([name,qty]) => {
    const li = document.createElement("li");
    li.innerText = `${name} — ${qty} sold`;
    topProductsList.appendChild(li);
  });

  if (!topProductsList.children.length)
    topProductsList.innerHTML = "<li class='small muted'>No sales</li>";

  // Recent sales
  recentSalesList.innerHTML = "";
  filtered.slice(-5).reverse().forEach(s => {
    const li = document.createElement("li");
    li.innerText = `SNo ${s.sno}: ${s.name} (${s.qty}) — ₹${s.total}`;
    recentSalesList.appendChild(li);
  });

  if (!recentSalesList.children.length)
    recentSalesList.innerHTML = "<li class='small muted'>No recent sales</li>";
}

/* -------------------- REPORTS -------------------- */
reportMonth.onchange = refreshReports;

function refreshReports() {
  const month = reportMonth.value || new Date().toISOString().slice(0,7);
  const filtered = sales.filter(s => s.date && s.date.startsWith(month));

  if (!filtered.length) {
    monthlySummary.innerHTML = "<div class='small muted'>No sales this month.</div>";
    return;
  }

  // Group by product
  const summary = {};
  filtered.forEach(s => {
    if (!summary[s.productId]) {
      summary[s.productId] = {
        name: s.name,
        brand: s.brand,
        qty: 0,
        revenue: 0,
        cost: 0,
        profit: 0
      };
    }

    summary[s.productId].qty += s.qty;
    summary[s.productId].revenue += s.total;
    summary[s.productId].cost += (s.total - s.profit);
    summary[s.productId].profit += s.profit;
  });

  // Build table
  let html = `
    <table class="rptTable">
      <thead>
        <tr>
          <th>Product</th>
          <th>Qty Sold</th>
          <th>Revenue (₹)</th>
          <th>Cost (₹)</th>
          <th>Profit (₹)</th>
        </tr>
      </thead>
      <tbody>
  `;

  let totalQty = 0, tRevenue = 0, tCost = 0, tProfit = 0;

  Object.values(summary).forEach(item => {
    html += `
      <tr>
        <td>${item.name} <span class="small">(${item.brand})</span></td>
        <td>${item.qty}</td>
        <td>₹${item.revenue.toLocaleString("en-IN")}</td>
        <td>₹${item.cost.toLocaleString("en-IN")}</td>
        <td>₹${item.profit.toLocaleString("en-IN")}</td>
      </tr>
    `;

    totalQty += item.qty;
    tRevenue += item.revenue;
    tCost += item.cost;
    tProfit += item.profit;
  });

  html += `
      </tbody>
      <tfoot>
        <tr class="totalRow">
          <td>Total</td>
          <td>${totalQty}</td>
          <td>₹${tRevenue.toLocaleString("en-IN")}</td>
          <td>₹${tCost.toLocaleString("en-IN")}</td>
          <td>₹${tProfit.toLocaleString("en-IN")}</td>
        </tr>
      </tfoot>
    </table>
    <hr><h3>All Sales (Full List)</h3>
  `;

  // FULL SALES LIST
  filtered.sort((a,b)=>a.sno - b.sno).forEach(s => {
    html += `
      <div class="saleRow">
        <div>
          <strong>SNo ${s.sno}</strong> — ${s.date}<br>
          <span class="small">${s.name} (${s.brand}) — Qty ${s.qty}</span><br>
          <span class="small">Total ₹${s.total} • Profit ₹${s.profit}</span>
        </div>
      </div>
    `;
  });

  monthlySummary.innerHTML = html;
}

/* -------------------- UTIL -------------------- */
function populateSaleDropdown() {
  saleProduct.innerHTML = "<option value=''>Select product</option>";

  products.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `${p.name} (${p.brand}) — Stock ${p.stock}`;
    saleProduct.appendChild(opt);
  });
}

/* -------------------- INIT -------------------- */
function initApp() {
  saleDate.value = new Date().toISOString().slice(0,10);
  dashboardMonth.value = new Date().toISOString().slice(0,7);
  reportMonth.value = new Date().toISOString().slice(0,7);

  renderProducts();
  renderSales();
  populateSaleDropdown();
  refreshDashboard();
  refreshReports();
}
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const sidebar = document.querySelector(".sidebar");

mobileMenuBtn.onclick = () => {
  sidebar.classList.toggle("open");
};
document.querySelectorAll(".navbtn").forEach(btn => {
  btn.addEventListener("click", () => {
    sidebar.classList.remove("open");
  });
});
