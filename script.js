class FeedbackRating extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._value = parseFloat(this.getAttribute("value")) || 3.5; // Default value, supporting halves
    this._maxValue = parseInt(this.getAttribute("max")) || 5; // Default max value
    this._starColor = "#ffd700"; // Default star active color
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
                font-size: ${this._starSize};
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
            .rating-text {
                margin-top: 8px;
                color: #ffffff;
                font-size: 20px;
                text-align: center;
            }
        `;

    this.shadowRoot.innerHTML = ""; // Clear existing content
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(this.createStars());

    // Create and append the rating text element
    const ratingText = document.createElement("div");
    ratingText.classList.add("rating-text");
    ratingText.textContent = `Rating: ${this._value}/${this._maxValue}`;
    this.shadowRoot.appendChild(ratingText);
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
    this.render(); // Re-render to update the displayed rating
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
  const numStarsInput = document.getElementById("num-stars");
  const defaultValueInput = document.getElementById("default-value");

  document.getElementById("apply-settings").addEventListener("click", () => {
    const numStars = numStarsInput.value;
    const defaultValue = defaultValueInput.value;
    const starColor = document.getElementById("star-color").value;
    const starSize = document.getElementById("star-size").value + "px";

    // Validation to ensure default value does not exceed number of stars
    const validatedDefaultValue = Math.min(defaultValue, numStars);

    ratingElement.updateProperties(
      numStars,
      validatedDefaultValue,
      starColor,
      starSize
    );
  });

  // Ensure default value does not exceed number of stars
  numStarsInput.addEventListener("change", () => {
    const numStars = parseInt(numStarsInput.value);
    const defaultValue = parseFloat(defaultValueInput.value);

    if (defaultValue > numStars) {
      defaultValueInput.value = numStars;
    }
  });
});
