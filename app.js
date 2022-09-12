const arm = document.querySelector(".arm");
const roll0 = document.getElementById("roll-0");
const roll1 = document.getElementById("roll-1");
const roll2 = document.getElementById("roll-2");

const balanceElement = document.getElementById("balance");
let balance = Number.parseInt(balanceElement.textContent);

const changeBalance = (value) => {
  balance += value;
  balanceElement.textContent = balance;
};

let isSpining = false;
let spinsCount = 0;

// config

const cardHeight = 140;
const priceGame = 1;
const winReward = 5;

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const randInt = (max = 10) => {
  return Math.floor(Math.random() * max) + 1;
};

const rewardCheck = (arr) => {
  let reward = arr.reduce((acc, el) => {
    acc[el] = (acc[el] || 0) + 1;
    return acc;
  }, {});
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

  return sleep(400);
};

const spin = async (element, endPoint, maxSpeed, step = 1) => {
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
  if (isSpining || spinsCount || balance <= 0) return;
  changeBalance(-priceGame);
  isSpining = true;
  await armAnimation();

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

  await rolls.forEach((item) => {
    spin(item.element, cardHeight * item.value * 7, item.speed);
  });

  isSpining = false;
};

arm.addEventListener("click", startGame);
