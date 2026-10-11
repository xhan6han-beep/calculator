const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");

const MAX_DIGITS = 12;

let current = "0";
let previous = null;
let operator = null;
let justEvaluated = false;

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "错误";
  }

  const abs = Math.abs(value);
  if (abs !== 0 && (abs >= 1e12 || abs < 1e-9)) {
    return value.toExponential(6).replace(/\.?0+e/, "e");
  }

  const rounded = Number(value.toPrecision(12));
  return String(rounded);
}

function updateDisplay() {
  expressionEl.textContent = previous !== null && operator
    ? `${formatNumber(previous)} ${operator}`
    : "";
  resultEl.textContent = current;
}

function inputDigit(digit) {
  if (justEvaluated) {
    current = digit;
    previous = null;
    operator = null;
    justEvaluated = false;
    updateDisplay();
    return;
  }

  if (current.replace("-", "").replace(".", "").length >= MAX_DIGITS) {
    return;
  }

  current = current === "0" ? digit : current + digit;
  updateDisplay();
}

function inputDecimal() {
  if (justEvaluated) {
    current = "0.";
    previous = null;
    operator = null;
    justEvaluated = false;
    updateDisplay();
    return;
  }

  if (!current.includes(".")) {
    current += ".";
    updateDisplay();
  }
}

function toggleSign() {
  if (current === "0" || current === "错误") {
    return;
  }
  current = current.startsWith("-") ? current.slice(1) : `-${current}`;
  justEvaluated = false;
  updateDisplay();
}

function applyPercent() {
  const value = Number(current);
  if (!Number.isFinite(value)) {
    return;
  }
  current = formatNumber(value / 100);
  justEvaluated = false;
  updateDisplay();
}

function calculate(a, op, b) {
  switch (op) {
    case "+":
      return a + b;
    case "−":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      return b === 0 ? NaN : a / b;
    default:
      return b;
  }
}

function setOperator(nextOperator) {
  const value = Number(current);

  if (previous !== null && operator && !justEvaluated) {
    const result = calculate(previous, operator, value);
    current = formatNumber(result);
    previous = Number.isFinite(result) ? result : null;
  } else {
    previous = value;
  }

  operator = nextOperator;
  justEvaluated = false;
  current = "0";
  updateDisplay();
}

function equals() {
  if (previous === null || !operator) {
    return;
  }

  const result = calculate(previous, operator, Number(current));
  current = formatNumber(result);
  previous = null;
  operator = null;
  justEvaluated = true;
  updateDisplay();
}

function clearAll() {
  current = "0";
  previous = null;
  operator = null;
  justEvaluated = false;
  updateDisplay();
}

document.querySelector(".keys").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  if (button.dataset.digit) {
    inputDigit(button.dataset.digit);
  } else if (button.dataset.op) {
    setOperator(button.dataset.op);
  } else if (button.dataset.action === "decimal") {
    inputDecimal();
  } else if (button.dataset.action === "clear") {
    clearAll();
  } else if (button.dataset.action === "sign") {
    toggleSign();
  } else if (button.dataset.action === "percent") {
    applyPercent();
  } else if (button.dataset.action === "equals") {
    equals();
  }
});

document.addEventListener("keydown", (event) => {
  const { key } = event;

  if (/\d/.test(key)) {
    inputDigit(key);
    return;
  }

  const operatorMap = {
    "+": "+",
    "-": "−",
    "*": "×",
    "/": "÷",
    "x": "×",
    "X": "×",
  };

  if (key in operatorMap) {
    event.preventDefault();
    setOperator(operatorMap[key]);
    return;
  }

  if (key === "." || key === ",") {
    inputDecimal();
    return;
  }

  if (key === "Enter" || key === "=") {
    event.preventDefault();
    equals();
    return;
  }

  if (key === "Escape" || key === "Delete") {
    clearAll();
    return;
  }

  if (key === "Backspace") {
    if (justEvaluated || current === "错误") {
      clearAll();
      return;
    }
    current = current.length <= 1 || (current.length === 2 && current.startsWith("-"))
      ? "0"
      : current.slice(0, -1);
    updateDisplay();
  }

  if (key === "%") {
    applyPercent();
  }
});

updateDisplay();
