/* ========= 初期ユーザー ========= */
if (!localStorage.getItem("users")) {
  localStorage.setItem("users", JSON.stringify([
    { username: "child", password: "1234", role: "child" },
    { username: "parent", password: "5678", role: "parent" }
  ]));
}

/* ========= DOM ========= */
const loginView = document.getElementById("loginView");
const appView = document.getElementById("appView");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");

const amountInput = document.getElementById("amount");
const purposeInput = document.getElementById("purpose");
const receiptInput = document.getElementById("receipt");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("list");
const totalSpan = document.getElementById("total");
const childOnly = document.getElementById("childOnly");

/* ========= 状態 ========= */
let users = JSON.parse(localStorage.getItem("users"));
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser"));

/* ========= ログイン ========= */
loginBtn.onclick = () => {
  const u = document.getElementById("username").value;
  const p = document.getElementById("password").value;

  const user = users.find(x => x.username === u && x.password === p);
  if (!user) {
    alert("ログイン失敗");
    return;
  }

  localStorage.setItem("currentUser", JSON.stringify(user));
  currentUser = user;
  showApp();
};

/* ========= ログアウト ========= */
logoutBtn.onclick = () => {
  localStorage.removeItem("currentUser");
  location.reload();
};

/* ========= 表示切替 ========= */
function showApp() {
  loginView.style.display = "none";
  appView.style.display = "block";
  userInfo.textContent = `ログイン中：${currentUser.username}（${currentUser.role}）`;

  if (currentUser.role === "parent") {
    childOnly.style.display = "none";
  }

  render();
}

if (currentUser) showApp();

/* ========= 経費登録 ========= */
addBtn.onclick = () => {
  const amount = Number(amountInput.value);
  const purpose = purposeInput.value;
  if (!amount || !purpose) return;

  const file = receiptInput.files[0];
  if (file) {
    const r = new FileReader();
    r.onload = () => save(amount, purpose, r.result);
    r.readAsDataURL(file);
  } else {
    save(amount, purpose, null);
  }
};

function save(amount, purpose, receipt) {
  expenses.push({
    id: Date.now(),
    amount,
    purpose,
    receipt,
    paid: false,
    date: new Date().toLocaleDateString()
  });
  localStorage.setItem("expenses", JSON.stringify(expenses));
  render();
}

/* ========= 描画 ========= */
function render() {
  list.innerHTML = "";
  let total = 0;

  expenses.forEach(e => {
    if (!e.paid) total += e.amount;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${e.date}</td>
      <td>${e.amount}</td>
      <td>${e.purpose}</td>
      <td>${e.receipt ? `<img src="${e.receipt}">` : "なし"}</td>
      <td>
        ${currentUser.role === "parent"
          ? `<input type="checkbox" ${e.paid ? "checked" : ""}>`
          : e.paid ? "✔" : ""}
      </td>
    `;

    const cb = tr.querySelector("input");
    if (cb) {
      cb.onchange = () => {
        e.paid = cb.checked;
        localStorage.setItem("expenses", JSON.stringify(expenses));
        render();
      };
    }

    list.appendChild(tr);
  });

  totalSpan.textContent = total;
}
