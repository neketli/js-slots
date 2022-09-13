// Init selectors
// Slot mahine controls
const arm = document.querySelector(".arm");
const roll0 = document.getElementById("roll-0");
const roll1 = document.getElementById("roll-1");
const roll2 = document.getElementById("roll-2");

// Balance
const balanceElement = document.getElementById("balance");

// Side menu
const showBtn = document.getElementById("showBtn");
const sideMenu = document.getElementById("sidemenu");

// Leaderbords table
const tableBody = document.getElementById("tableBody");
const confirmBtn = document.getElementById("confirm");

// Username input
const userName = document.getElementById("name");

// Rewards and expenses
const reward = document.getElementById("reward");
const expense = document.getElementById("expense");

// Daily reward
const getDailyRewardElement = document.getElementById("getDailyReward");
const dailyReward = document.querySelector(".dailyReward");

// Sounds
const coinSound = document.getElementById("coinSound");
const rollSound = document.getElementById("rollSound");
rollSound.loop = true;

// Player object
const user = JSON.parse(localStorage.getItem("user")) || {
  name: "user",
  balance: 50,
  lastReward: Date.now(),
};
balanceElement.innerText = user.balance;

// Daily reward check
if (Date.now() - user.lastReward < 1000 * 60 * 60 * 24) {
  dailyReward.style.display = "none";
}

// Programm flags
let isSideMenuShowing = false;
let isSpining = false;
let spinsCount = 0;

// config
const cardHeight = 140;
const priceGame = 1;
const dailyRewardPrice = 10;

// Additional functions
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const randInt = (max = 10) => {
  return Math.floor(Math.random() * max) + 1;
};

// Balance logic
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

const getDailyReward = () => {
  changeBalance(dailyRewardPrice);
  user.lastReward = Date.now();
  dailyReward.style.display = "none";
  localStorage.setItem("user", JSON.stringify(user));
};

// Alert logic
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

// Menu logic
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
  }
  leaderboardData = leaderboardData.sort((a, b) => b.balance - a.balance);
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

// Animations
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

// Start game function
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

// Init
initLeaderboard();

// Init event listeners
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

getDailyRewardElement.addEventListener("click", getDailyReward);
