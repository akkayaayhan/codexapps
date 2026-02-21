const STORAGE_KEY = "gelir-gider-kayitlari";

const form = document.getElementById("transaction-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("date");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const balanceEl = document.getElementById("balance");
const listEl = document.getElementById("transaction-list");
const template = document.getElementById("transaction-template");
const clearAllButton = document.getElementById("clear-all");

const currencyFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
});

let transactions = loadTransactions();

render();
setDefaultDate();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);
  const date = dateInput.value;

  if (!description || Number.isNaN(amount) || !date || amount === 0) {
    return;
  }

  transactions.unshift({
    id: crypto.randomUUID(),
    description,
    amount,
    date,
  });

  persistTransactions();
  render();
  form.reset();
  setDefaultDate();
  descriptionInput.focus();
});

clearAllButton.addEventListener("click", () => {
  if (!transactions.length) return;

  const shouldClear = window.confirm("Tüm kayıtlar silinsin mi?");
  if (!shouldClear) return;

  transactions = [];
  persistTransactions();
  render();
});

function removeTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id);
  persistTransactions();
  render();
}

function render() {
  listEl.innerHTML = "";

  let income = 0;
  let expense = 0;

  transactions.forEach((transaction) => {
    if (transaction.amount > 0) {
      income += transaction.amount;
    } else {
      expense += Math.abs(transaction.amount);
    }

    const node = template.content.firstElementChild.cloneNode(true);

    node.classList.add(transaction.amount > 0 ? "income" : "expense");
    node.querySelector(".transaction-description").textContent = transaction.description;
    node.querySelector(".transaction-date").textContent = formatDate(transaction.date);

    const amountText = `${transaction.amount > 0 ? "+" : "-"} ${currencyFormatter.format(
      Math.abs(transaction.amount),
    )}`;
    node.querySelector(".transaction-amount").textContent = amountText;

    node.querySelector(".delete-btn").addEventListener("click", () => {
      removeTransaction(transaction.id);
    });

    listEl.appendChild(node);
  });

  const balance = income - expense;

  incomeEl.textContent = currencyFormatter.format(income);
  expenseEl.textContent = currencyFormatter.format(expense);
  balanceEl.textContent = currencyFormatter.format(balance);
}

function persistTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function loadTransactions() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item) =>
        typeof item === "object" &&
        item &&
        typeof item.id === "string" &&
        typeof item.description === "string" &&
        typeof item.amount === "number" &&
        typeof item.date === "string",
    );
  } catch {
    return [];
  }
}

function setDefaultDate() {
  if (!dateInput.value) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.value = today;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
