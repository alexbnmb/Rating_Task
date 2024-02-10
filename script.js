class FeedbackRating extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // Initialize default properties
    this._value = parseFloat(this.getAttribute("value")) || 3.5; // Supporting halves by default
    this._maxValue = parseInt(this.getAttribute("max")) || 5;
    this._starColor = "#ffd700"; // Default star color
    this._starSize = "36px"; // Default star size, increased by 20%
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
                font-size: ${this._starSize}; /* Dynamic star size */
                color: #cccccc; /* Inactive star color */
                cursor: pointer;
                transition: transform 0.3s ease; /* Smooth transition for hover effect */
                position: relative;
                display: inline-block;
            }
            .rating-star.active, .rating-star.half::after {
                color: ${this._starColor}; /* Dynamic active star color */
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

      if (i <= this._value) {
        star.classList.add("active");
      }
      if (i - 0.5 === this._value) {
        star.classList.add("half");
      }

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
    // Temporarily adjust visual preview without changing the actual value
    this.shadowRoot.querySelectorAll(".rating-star").forEach((star, index) => {
      star.classList.remove("active", "half");
      let value = isHalf ? i - 0.5 : i;
      if (index + 1 <= value) star.classList.add("active");
      if (index + 0.5 === value) star.classList.add("half");
    });
  }

  updateProperties(numStars, defaultValue, starColor, starSize) {
    this._maxValue = parseInt(numStars);
    this._value = parseFloat(defaultValue);
    this._starColor = starColor;
    this._starSize = starSize;
    this.render();
  }
}

customElements.define("feedback-rating", FeedbackRating);

document.addEventListener("DOMContentLoaded", () => {
  const ratingElement = document.querySelector("feedback-rating");

  document.getElementById("apply-settings").addEventListener("click", () => {
    const numStars = document.getElementById("num-stars").value;
    const defaultValue = document.getElementById("default-value").value;
    const starColor = document.getElementById("star-color").value;
    const starSize = document.getElementById("star-size").value + "px";

    ratingElement.updateProperties(numStars, defaultValue, starColor, starSize);
  });
});
