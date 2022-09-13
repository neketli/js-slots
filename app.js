const arm = document.querySelector(".arm");
const roll0 = document.getElementById("roll-0");
const roll1 = document.getElementById("roll-1");
const roll2 = document.getElementById("roll-2");

const balanceElement = document.getElementById("balance");

const showBtn = document.getElementById("showBtn");
const sideMenu = document.getElementById("sidemenu");
let isSideMenuShowing = false;

const tableBody = document.getElementById("tableBody");

const confirmBtn = document.getElementById("confirm");

const user = JSON.parse(localStorage.getItem("user")) || {
  name: "user",
  balance: 50,
};

const userName = document.getElementById("name");

balanceElement.innerText = user.balance;

const reward = document.getElementById("reward");
const expense = document.getElementById("expense");

const coinSound = document.getElementById("coinSound");
const rollSound = document.getElementById("rollSound");
rollSound.loop = true;

let isSpining = false;
let spinsCount = 0;

// config

const cardHeight = 140;
const priceGame = 1;

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const randInt = (max = 10) => {
  return Math.floor(Math.random() * max) + 1;
};

const rewardCheck = (arr) => {
  const count = arr.reduce((acc, el) => {
    acc[el] = (acc[el] || 0) + 1;
    return acc;
  }, {});
  const reward = (3 - Object.values(count).length) * 5;
  return reward;
};

const changeBalance = (value) => {
  user.balance += value;
  balanceElement.textContent = user.balance;
};

const showAlert = async (mode, value = priceGame) => {
  if (mode === "expense") {
    expense.innerText = `-${value}$`;
    expense.style.display = "block";
    for (let i = 50; i > 30; i--) {
      expense.style.top = `${i}%`;
      await sleep(1000 / 30);
    }
    expense.style.display = "none";
  } else {
    reward.innerText = `+${value}$`;
    reward.style.display = "block";
    for (let i = 50; i > 30; i--) {
      reward.style.top = `${i}%`;
      await sleep(1000 / 30);
    }
    reward.style.display = "none";
  }
};

const toggleMenu = () => {
  sideMenu.classList.toggle("closed");
  isSideMenuShowing = !isSideMenuShowing;
  showBtn.innerText = isSideMenuShowing ? "←" : "→";
};

const appendTableRow = (item) => {
  const row = document.createElement("tr");
  const name = document.createElement("td");
  name.innerText = item.name;
  const value = document.createElement("td");
  value.innerText = item.balance;
  row.appendChild(name);
  row.appendChild(value);
  tableBody.appendChild(row);
};

const initLeaderboard = (user = null) => {
  const LEADERS = [
    {
      name: "Иван",
      balance: 1017,
    },
    {
      name: "Alek$$",
      balance: 689,
    },
    {
      name: "Rakhim ahmed",
      balance: 377,
    },
    {
      name: "Даша",
      balance: 142,
    },
    {
      name: "Павел Птрович",
      balance: 65,
    },
  ];

  let leaderboardData = JSON.parse(localStorage.getItem("leaderboard"));
  if (!leaderboardData) {
    leaderboardData = LEADERS;
  }

  if (!!user) {
    leaderboardData = leaderboardData.filter((item) => item.name !== user.name);
    leaderboardData = [...leaderboardData, user];
    console.log(leaderboardData);
  }
  leaderboardData = leaderboardData.sort((a, b) => b.value - a.value);
  leaderboardData = leaderboardData.slice(0, 6);

  // Clear table
  if (tableBody.rows) {
    const len = tableBody.rows.length;
    for (var i = 0; i < len; i++) {
      tableBody.deleteRow(0);
    }
  }
  leaderboardData.forEach((item) => appendTableRow(item));
  localStorage.setItem("leaderboard", JSON.stringify(leaderboardData));
};

const armAnimation = () => {
  for (let i = 0; i < 2; i++) {
    setTimeout(() => {
      arm.classList.remove(`arm-${i}`);
      arm.classList.add(`arm-${i + 1}`);
    }, 75 * i);

    setTimeout(() => {
      arm.classList.remove(`arm-${i + 1}`);
      arm.classList.add(`arm-${i}`);
    }, 75 * -i + 400);
  }
};

const spinAnimation = async (element, endPoint, maxSpeed, step = 1) => {
  spinsCount += 1;
  let k = step;
  let position = 0;
  while (k < maxSpeed) {
    if (k < maxSpeed) {
      k += step;
    }
    position += k;
    element.style.backgroundPositionY = `${position}px`;
    await sleep(1);
  }

  while (position < endPoint - 140 * 3) {
    position += k;
    element.style.backgroundPositionY = `${position}px`;
    await sleep(2);
  }

  while (position < endPoint) {
    if (k > step) {
      k -= step;
    } else if (k <= step) {
      k = maxSpeed / 2;
    }
    position += k;
    element.style.backgroundPositionY = `${position}px`;
    await sleep(1);
  }

  spinsCount -= 1;
};

const startGame = async () => {
  if (isSpining || spinsCount || user.balance <= 0) return;
  changeBalance(-priceGame);
  showAlert("expense");

  coinSound.play();
  while (!coinSound.ended) {
    await sleep(1);
  }
  rollSound.play();

  isSpining = true;
  armAnimation();

  const rolls = [
    {
      element: roll0,
      value: randInt(5),
      speed: 4,
    },
    {
      element: roll1,
      value: randInt(5),
      speed: 5,
    },
    {
      element: roll2,
      value: randInt(5),
      speed: 6,
    },
  ];

  rolls.forEach((item) => {
    spinAnimation(item.element, cardHeight * item.value * 7, item.speed);
  });

  while (spinsCount) {
    await sleep(10);
  }

  rollSound.pause();
  const reward = rewardCheck(rolls.map((item) => item.value));
  if (!!reward) {
    showAlert("reward", reward);
    changeBalance(reward);
  }

  localStorage.setItem("user", JSON.stringify(user));
  isSpining = false;
};

initLeaderboard();

arm.addEventListener("click", startGame);
document.getElementById("app").addEventListener("keypress", (event) => {
  if (event.key === "Enter" || event.code === "Space") {
    startGame();
  }
});

showBtn.addEventListener("click", toggleMenu);
confirmBtn.addEventListener("click", () => {
  initLeaderboard(user);
});

userName.addEventListener("input", (event) => {
  user.name = event.target.value;
});
