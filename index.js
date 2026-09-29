const STORAGE_KEY = 'transactions';
const form = document.querySelector('form');
const dateInput = document.querySelector('#date');
const itemInput = document.querySelector('#item');
const typeInput = document.querySelector('#type');
const amountInput = document.querySelector('#amount');
const tableBody = document.querySelector('tbody');
const totalOutput = document.querySelector('.summary-panel output');
const amountFormatter = new Intl.NumberFormat('ja-JP');

let transactions = [];

function isTransaction(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.date === 'string' &&
    typeof value.item === 'string' &&
    (value.type === 'income' || value.type === 'expense') &&
    Number.isInteger(value.amount) &&
    value.amount > 0
  );
}

function loadTransactions() {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData === null) {
    return [];
  }

  const parsedData = JSON.parse(savedData);
  if (!Array.isArray(parsedData) || !parsedData.every(isTransaction)) {
    throw new Error('保存された収支データの形式が正しくありません。');
  }
  return parsedData;
}

function renderTransactions() {
  tableBody.replaceChildren();

  if (transactions.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 4;
    cell.textContent = '記録はありません。';
    row.append(cell);
    tableBody.append(row);
  } else {
    transactions.forEach((transaction) => {
      const row = document.createElement('tr');
      const values = [
        transaction.date,
        transaction.item,
        transaction.type === 'income' ? '収入' : '支出',
        `${amountFormatter.format(transaction.amount)}円`,
      ];

      values.forEach((value) => {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.append(cell);
      });
      tableBody.append(row);
    });
  }

  const total = transactions.reduce((sum, transaction) => {
    return sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
  }, 0);
  totalOutput.textContent = `${amountFormatter.format(total)}円`;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const amount = Number(amountInput.value);
  const transaction = {
    date: dateInput.value,
    item: itemInput.value.trim(),
    type: typeInput.value,
    amount,
  };

  if (
    !transaction.date ||
    !transaction.item ||
    (transaction.type !== 'income' && transaction.type !== 'expense') ||
    !Number.isInteger(transaction.amount) ||
    transaction.amount < 1
  ) {
    alert('日付・品目・区分・1円以上の整数の金額を入力してください。');
    return;
  }

  const updatedTransactions = [...transactions, transaction];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTransactions));
  } catch (error) {
    console.error('収支データを保存できませんでした。', error);
    alert('収支データを保存できませんでした。ブラウザーの保存領域を確認してください。');
    return;
  }

  transactions = updatedTransactions;
  renderTransactions();
  form.reset();
});

try {
  transactions = loadTransactions();
  renderTransactions();
} catch (error) {
  console.error('収支データを読み込めませんでした。', error);
  alert('保存された収支データを読み込めませんでした。データ形式を確認してください。');
  renderTransactions();
}
