class LottoBall extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const number = this.getAttribute('number');
    let color = '#f2c648'; // Yellow

    if (number > 10 && number <= 20) {
        color = '#4a89dc'; // Blue
    } else if (number > 20 && number <= 30) {
        color = '#da4453'; // Red
    } else if (number > 30 && number <= 40) {
        color = '#aab2bd'; // Gray
    } else if (number > 40) {
        color = '#37bc9b'; // Green
    }
    

    this.shadowRoot.innerHTML = `
      <style>
        .ball {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 20px;
          font-weight: bold;
          color: white;
          background-color: ${color};
        }
      </style>
      <div class="ball">${number}</div>
    `;
  }
}

customElements.define('lotto-ball', LottoBall);

document.getElementById('generate-btn').addEventListener('click', () => {
  const lottoNumbersContainer = document.getElementById('lotto-numbers');
  lottoNumbersContainer.innerHTML = '';
  const numbers = new Set();
  while (numbers.size < 6) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }

  for (const number of Array.from(numbers).sort((a,b) => a-b)) {
    const lottoBall = document.createElement('lotto-ball');
    lottoBall.setAttribute('number', number);
    lottoNumbersContainer.appendChild(lottoBall);
  }
});

document.getElementById('theme-toggle-btn').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
});