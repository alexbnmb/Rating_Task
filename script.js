class FeedbackRating extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._value = 0; // Example default value, supporting halves
    this._maxValue = 5;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const style = document.createElement("style");
    style.textContent = `
            .rating-container {
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .rating-star {
                font-size: 36px; /* Adjust for bigger stars */
                color: #cccccc; /* Inactive star color */
                cursor: pointer;
                transition: transform 0.3s ease; /* Smooth transition for hover effect */
                position: relative;
                display: inline-block;
            }
            .rating-star.active {
                color: #ffd700; /* Active star color */
            }
            .rating-star:hover {
                transform: scale(1.2); /* Enlarge star on hover */
            }
            .rating-star.half::after {
                content: '★';
                position: absolute;
                left: 0;
                top: 0;
                width: 50%; /* Show half star */
                overflow: hidden;
                color: #ffd700; /* Active star color */
            }
        `;

    this.shadowRoot.innerHTML = ""; // Clear existing content
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(this.createStars());
  }

  createStars() {
    const container = document.createElement("div");
    container.classList.add("rating-container");

    for (let i = 1; i <= this._maxValue; i++) {
      const star = document.createElement("span");
      star.classList.add("rating-star");
      star.innerHTML = "★"; // Star character

      // Determine if star should be active or half-active based on value
      if (i <= this._value) {
        star.classList.add("active");
      }
      if (i - 0.5 === this._value) {
        star.classList.add("half");
      }

      // Adjust for hover and click to support half-stars
      star.addEventListener("click", (e) =>
        this.updateValue(i, e.offsetX < star.offsetWidth / 2)
      );
      star.addEventListener("mousemove", (e) =>
        this.previewValue(i, e.offsetX < star.offsetWidth / 2)
      );
      star.addEventListener("mouseleave", () => this.render());

      container.appendChild(star);
    }

    return container;
  }

  updateValue(i, isHalf) {
    this._value = isHalf ? i - 0.5 : i;
    this.render();
  }

  previewValue(i, isHalf) {
    // Temporarily adjust visual preview without changing actual value
    this.shadowRoot.querySelectorAll(".rating-star").forEach((star, index) => {
      star.classList.remove("active", "half");
      let value = isHalf ? i - 0.5 : i;
      if (index + 1 <= value) star.classList.add("active");
      if (index + 0.5 === value) star.classList.add("half");
    });
  }
}

customElements.define("feedback-rating", FeedbackRating);
