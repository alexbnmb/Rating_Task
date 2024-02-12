// Define a class for the custom element 'FeedbackRating' extending HTMLElement
class FeedbackRating extends HTMLElement {
  constructor() {
    super(); // Call to the constructor of HTMLElement
    this.attachShadow({ mode: "open" }); // Attach a shadow DOM to the custom element
    // Initialize properties with default values or values from attributes
    this._value = parseFloat(this.getAttribute("value")) || 3.5; // The current rating value
    this._maxValue = parseInt(this.getAttribute("max")) || 5; // The maximum rating value
    this._starColor = "#ffd700"; // Color for active stars
    this._starSize = "36px"; // Size of the stars
    this.dragging = false; // Flag to track if the user is dragging for rating
    this.startTime = 0; // Time when the touch interaction starts
    this.startX = 0; // Starting X position of a touch interaction
  }

  // Lifecycle callback called when the element is added to the document
  connectedCallback() {
    this.render(); // Render the initial state of the component
  }

  // Renders the component's HTML and styles
  render() {
    // Define the internal styles for the component
    const style = document.createElement("style");
    style.textContent = `
        .rating-container {
            display: flex; 
            justify-content: center; 
            align-items: center; 
        }
        .rating-star {
            font-size: ${this._starSize}; 
            color: #cccccc; 
            cursor: pointer; 
            transition: transform 0.3s ease; 
            position: relative; 
            display: inline-block; 
        }
        .rating-star.active, .rating-star.half::after {
            color: ${this._starColor}; 
        }
        .rating-star:hover {
            transform: scale(1.2); 
        }
        .rating-star.half::after {
            content: '★'; 
            position: absolute; 
            left: 0;
            top: 0;
            width: 50%; 
            overflow: hidden; 
        }
        .rating-text {
            margin-top: 8px; 
            color: #ffffff; 
            font-size: 20px; 
            text-align: center; 
        }
      `;

    // Clear any existing content in the shadow root
    this.shadowRoot.innerHTML = "";
    // Add the style element and the dynamically created stars to the shadow root
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(this.createStars());

    // Create and append a div to display the current rating value
    const ratingText = document.createElement("div");
    ratingText.classList.add("rating-text");
    ratingText.textContent = `Rating: ${this._value}/${this._maxValue}`;
    this.shadowRoot.appendChild(ratingText);
  }

  // Creates the stars based on the current rating value and max value
  createStars() {
    const container = document.createElement("div");
    container.classList.add("rating-container");

    // Loop to create each star
    for (let i = 1; i <= this._maxValue; i++) {
      const star = document.createElement("span");
      star.classList.add("rating-star");
      star.innerHTML = "★"; // Use the Unicode star character

      // Determine if the star should be active or half based on the current rating value
      if (i <= this._value) {
        star.classList.add("active");
      }
      if (i - 0.5 === this._value) {
        star.classList.add("half");
      }

      // Event listeners for desktop interactions
      star.addEventListener("click", (e) =>
        this.updateValue(i, e.offsetX < star.offsetWidth / 2)
      );
      star.addEventListener("mousemove", (e) =>
        this.previewValue(i, e.offsetX < star.offsetWidth / 2)
      );
      star.addEventListener("mouseleave", () => this.render());

      // Event listeners for touch interactions
      star.addEventListener("touchstart", (e) => {
        e.preventDefault();
        this.startX = e.touches[0].clientX; // Store the start X position of the touch
        this.startTime = Date.now(); // Record the start time for distinguishing taps from slides
        this.dragging = false; // Assume it's not dragging initially
      });

      star.addEventListener("touchmove", (e) => {
        e.preventDefault();
        const touchX = e.touches[0].clientX;
        const diffX = touchX - this.startX;

        // If there's significant horizontal movement, treat it as dragging
        if (Math.abs(diffX) > 5) {
          // Sensitivity threshold for dragging
          this.dragging = true;
          this.updateValueOnTouchMove(e);
        }
      });

      star.addEventListener("touchend", (e) => {
        const endTime = Date.now();
        // If the interaction is short and not dragging, treat it as a tap
        if (!this.dragging && endTime - this.startTime < 300) {
          // Tap threshold
          const rect = star.getBoundingClientRect();
          const endX = e.changedTouches[0].clientX;
          const isHalf = endX < rect.left + rect.width / 2;
          this.updateValue(i, isHalf);
        }
        this.dragging = false; // Reset dragging status
        this.render(); // Re-render to update the displayed rating
      });

      container.appendChild(star);
    }

    return container;
  }

  // Updates the rating value and re-renders the component
  updateValue(newValue, isHalf) {
    const roundedValue = Math.round(newValue * 2) / 2;
    this._value = isHalf ? roundedValue - 0.5 : roundedValue;
    this.render();
  }

  // Updates the visual preview of the rating based on mouse or touch movement
  previewValue(i, isHalf) {
    this.shadowRoot.querySelectorAll(".rating-star").forEach((star, index) => {
      star.classList.remove("active", "half");
      let value = isHalf ? i - 0.5 : i;
      if (index + 1 <= value) star.classList.add("active");
      if (index + 0.5 === value) star.classList.add("half");
    });
  }

  // Updates the rating value based on touch movement
  updateValueOnTouchMove(e) {
    const touchX = e.touches[0].clientX;
    const stars = this.shadowRoot.querySelectorAll(".rating-star");
    stars.forEach((star, index) => {
      const rect = star.getBoundingClientRect();
      // Update the rating based on the touch position relative to the stars
      if (touchX >= rect.left && touchX <= rect.right) {
        const isHalf = touchX < rect.left + rect.width / 2;
        this.updateValue(index + 1, isHalf);
      }
    });
  }

  // Allows updating component properties dynamically
  updateProperties(numStars, defaultValue, starColor, starSize) {
    this._maxValue = parseInt(numStars);
    this._value = parseFloat(defaultValue);
    this._starColor = starColor;
    this._starSize = starSize;
    this.render(); // Re-render the component with the new properties
  }
}

// Define the custom element
customElements.define("feedback-rating", FeedbackRating);

// Listen for the DOMContentLoaded event to ensure the DOM is fully loaded before attempting to manipulate it
document.addEventListener("DOMContentLoaded", () => {
  // Obtain a reference to the 'feedback-rating' element in the document
  const ratingElement = document.querySelector("feedback-rating");

  // Obtain references to input elements for configuring the rating component
  const numStarsInput = document.getElementById("num-stars"); // Input for number of stars
  const defaultValueInput = document.getElementById("default-value"); // Input for the default rating value

  // Listen for clicks on the 'apply-settings' button to apply user-defined settings to the rating component
  document.getElementById("apply-settings").addEventListener("click", () => {
    // Retrieve the user input values from the form
    const numStars = numStarsInput.value;
    const defaultValue = defaultValueInput.value;
    const starColor = document.getElementById("star-color").value; // Color for active stars
    const starSize = document.getElementById("star-size").value + "px"; // Size of stars, appending 'px' to make it a valid CSS value

    // Perform validation to ensure the default value does not exceed the total number of stars
    // This prevents the component from trying to display a rating higher than the maximum allowed stars
    const validatedDefaultValue = Math.min(defaultValue, numStars);

    // Call the updateProperties method of the 'feedback-rating' element
    // This method updates the component's properties based on user inputs and re-renders it
    ratingElement.updateProperties(
      numStars,
      validatedDefaultValue,
      starColor,
      starSize
    );
  });

  // Listen for changes to the number of stars input to ensure the default value does not exceed it
  numStarsInput.addEventListener("change", () => {
    // Parse the input values to their respective numeric types for comparison
    const numStars = parseInt(numStarsInput.value);
    const defaultValue = parseFloat(defaultValueInput.value);

    // If the default value exceeds the number of stars, update the default value input to match the number of stars
    // This ensures consistency and prevents user error where the default rating would be unrepresentable
    if (defaultValue > numStars) {
      defaultValueInput.value = numStars;
    }
  });
});
