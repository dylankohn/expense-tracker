// Grab the DOM nodes we interact with. These match IDs in the HTML.
const balance = document.getElementById('balance');
const income = document.getElementById('income');
const expense = document.getElementById('expense');
const transactionsList = document.getElementById('transactions');
const form = document.getElementById('transaction-form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const type = document.getElementById('type');
const resetBtn = document.getElementById('reset-btn');

// Load saved transactions from localStorage, or start with an empty array.
// This makes the app persistent between page reloads
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Save the current transactions array to localStorage.
// Tiny helper so we don't repeat JSON.stringify everywhere.
function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Recalculate and display balance, income and expense totals.
// Uses the transactions array, runs quickly even if there are many items.
function updateValues() {
  // grab only the numeric amounts
  const amounts = transactions.map(t => t.amount);

  // total balance = sum of everything
  const total = amounts.reduce((a, b) => a + b, 0).toFixed(2);

  // income is sum of positives
  const incomeTotal = amounts.filter(v => v > 0).reduce((a, b) => a + b, 0).toFixed(2);

  // expense is sum of negatives make positive for display
  const expenseTotal = (amounts.filter(v => v < 0).reduce((a, b) => a + b, 0) * -1).toFixed(2);

  // update the UI. Using template strings keeps it readable.
  balance.textContent = `$${total}`;
  income.textContent = `+$${incomeTotal}`;
  expense.textContent = `-$${expenseTotal}`;
}

// Add a new transaction from the form.
function addTransaction(e) {
  e.preventDefault(); // stop the form from reloading the page

  // quick validation — be nice to the user and require both fields
  if (text.value.trim() === '' || amount.value.trim() === '') {
    alert('Please enter a description and amount');
    return;
  }

  // change to number
  let amt = +amount.value;

  // If the user picked expense but typed a positive number, flip it so math stays sane.
  if (type.value === 'expense' && amt > 0) {
    amt = -amt; // ensure expenses are negative
  }

  // Build the transaction object. `id` is a simple millisecond timestamp.
  const transaction = {
    id: Date.now(),
    text: text.value,
    amount: amt,
    type: type.value // stored for potential future use (filtering, icons, etc.)
  };

  // Add, persist, and update the UI.
  transactions.push(transaction);
  updateLocalStorage();
  renderTransactions();
  updateValues();

  // reset the form to something sensible for next entry
  text.value = '';
  amount.value = '';
  type.value = 'income';
}

// Delete a transaction by id and refresh everything.
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  updateLocalStorage();
  renderTransactions();
  updateValues();
}

// Rebuild the transactions list in the DOM.
// This function recreates the <li>s every time
function renderTransactions() {
  transactionsList.innerHTML = ''; // clear current list

  transactions.forEach(t => {
    const li = document.createElement('li');
    // add a class so CSS can color it green/red via .plus/.minus
    li.classList.add(t.amount > 0 ? 'plus' : 'minus');

    // innerHTML is quick
    li.innerHTML = `
      ${t.text} 
      <span>${t.amount > 0 ? '+' : '-'}$${Math.abs(t.amount).toLocaleString()}</span>
      <button onclick="deleteTransaction(${t.id})">x</button>
    `;

    transactionsList.appendChild(li);
  });
}

// Reset everything after a yes/no confirmation.
function resetAll() {
  if (confirm('Are you sure you want to reset all transactions?')) {
    transactions = [];
    updateLocalStorage();
    renderTransactions();
    updateValues();
  }
}

// set up event listeners
form.addEventListener('submit', addTransaction);
resetBtn.addEventListener('click', resetAll);

// initial render on page load
renderTransactions();
updateValues();
