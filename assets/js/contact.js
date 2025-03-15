// Contact Form Handler for InterPlus
// This script handles validation and submission of the contact form

document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.getElementById("contactForm");

  if (contactForm) {
    setupContactForm(contactForm);
  }
});

/**
 * Sets up event listeners and validation for the contact form
 * @param {HTMLFormElement} form - The contact form element
 */
function setupContactForm(form) {
  // Add submit event listener
  form.addEventListener("submit", function (event) {
    // Always prevent default form submission
    event.preventDefault();

    // Get form inputs
    const fullNameInput = form.querySelector('input[type="text"]');
    const emailInput = form.querySelector('input[type="email"]');
    const phoneInput = form.querySelector('input[type="tel"]'); // Updated to match the form HTML
    const messageInput = form.querySelector("textarea");

    // Clear any previous error indicators
    clearFormErrors(form);

    // Get form values
    const formData = {
      full_name: fullNameInput.value.trim(),
      email: emailInput.value.trim() || undefined, // Make undefined if empty (since it's optional)
      phone_number: phoneInput.value.trim(),
      message_content: messageInput.value.trim(),
    };

    // Validate the form data
    const validationResult = validateContactForm(formData);

    if (validationResult.isValid) {
      // Show loading state on button
      const submitButton = form.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = "Göndərilir...";

      // Submit the form data
      submitContactRequest(formData)
        .then((response) => {
          console.log("Form submitted successfully:", response);

          // Show success message
          showNotification("Sorğunuz uğurla göndərildi!", "success");

          // Reset the form
          form.reset();
        })
        .catch((error) => {
          console.error("Contact form submission error:", error);

          // Show error message
          showNotification(
            "Sorğu göndərilmədi. Xahiş edirik yenidən cəhd edin.",
            "error"
          );
        })
        .finally(() => {
          // Reset button state
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        });
    } else {
      // Show validation errors
      showFormErrors(form, validationResult.errors);

      // Also show the first error as a notification
      showNotification(validationResult.errors[0], "error");

      console.log("Form validation failed:", validationResult.errors);
    }
  });
}

/**
 * Validates the contact form data based on the provided schema
 * @param {Object} formData - The form data to validate
 * @returns {Object} Validation result with isValid flag and any errors
 */
function validateContactForm(formData) {
  const errors = [];
  const fieldErrors = {};

  // Validate full name (2-100 characters)
  if (!formData.full_name) {
    const error = "Ad Soyad tələb olunur";
    errors.push(error);
    fieldErrors.full_name = error;
  } else if (formData.full_name.length < 2) {
    const error = "Ad Soyad ən azı 2 simvol olmalıdır";
    errors.push(error);
    fieldErrors.full_name = error;
  } else if (formData.full_name.length > 100) {
    const error = "Ad Soyad 100 simvoldan çox olmamalıdır";
    errors.push(error);
    fieldErrors.full_name = error;
  }

  // Validate phone number (5-20 characters)
  if (!formData.phone_number) {
    const error = "Mobil nömrə tələb olunur";
    errors.push(error);
    fieldErrors.phone_number = error;
  } else if (formData.phone_number.length < 5) {
    const error = "Mobil nömrə ən azı 5 simvol olmalıdır";
    errors.push(error);
    fieldErrors.phone_number = error;
  } else if (formData.phone_number.length > 20) {
    const error = "Mobil nömrə 20 simvoldan çox olmamalıdır";
    errors.push(error);
    fieldErrors.phone_number = error;
  }

  // Validate email (if provided)
  if (formData.email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      const error = "E-poçt ünvanı düzgün deyil";
      errors.push(error);
      fieldErrors.email = error;
    }
  }

  // Validate message (10-1000 characters)
  if (!formData.message_content) {
    const error = "Mesaj tələb olunur";
    errors.push(error);
    fieldErrors.message_content = error;
  } else if (formData.message_content.length < 10) {
    const error = "Mesaj ən azı 10 simvol olmalıdır";
    errors.push(error);
    fieldErrors.message_content = error;
  } else if (formData.message_content.length > 1000) {
    const error = "Mesaj 1000 simvoldan çox olmamalıdır";
    errors.push(error);
    fieldErrors.message_content = error;
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
    fieldErrors: fieldErrors,
  };
}

/**
 * Shows validation errors on the form fields
 * @param {HTMLFormElement} form - The form element
 * @param {Object} fieldErrors - Object mapping field names to error messages
 */
function showFormErrors(form, errors) {
  // Map form fields to their input elements
  const inputMap = {
    full_name: form.querySelector('input[type="text"]'),
    email: form.querySelector('input[type="email"]'),
    phone_number: form.querySelector('input[type="tel"]'),
    message_content: form.querySelector("textarea"),
  };

  // Loop through field errors and add error indicators
  for (const [fieldName, errorMessage] of Object.entries(errors)) {
    const input = inputMap[fieldName];
    if (input) {
      // Add error class to input
      input.classList.add("border-red-500");

      // Add error message below the input
      const errorEl = document.createElement("p");
      errorEl.className = "text-red-500 text-sm mt-1 error-message";
      errorEl.textContent = errorMessage;

      // Insert after the input
      const parentDiv = input.parentElement;
      parentDiv.appendChild(errorEl);
    }
  }
}

/**
 * Clears all error indicators from the form
 * @param {HTMLFormElement} form - The form element
 */
function clearFormErrors(form) {
  // Remove error classes from inputs
  form.querySelectorAll("input, textarea").forEach((input) => {
    input.classList.remove("border-red-500");
  });

  // Remove error messages
  form.querySelectorAll(".error-message").forEach((el) => el.remove());
}

/**
 * Submits the contact request to the API
 * @param {Object} formData - The validated form data
 * @returns {Promise} Promise that resolves when the request is complete
 */
function submitContactRequest(formData) {
  console.log("Submitting data to API:", formData);

  return fetch("https://api.interplast-a.com/api/contact-requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  });
}

/**
 * Shows a notification message to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success or error)
 */
function showNotification(message, type) {
  // Check if notification container exists, create if not
  let notificationContainer = document.getElementById("notification-container");

  if (!notificationContainer) {
    notificationContainer = document.createElement("div");
    notificationContainer.id = "notification-container";
    notificationContainer.className =
      "fixed top-4 right-4 z-50 flex flex-col gap-2";
    document.body.appendChild(notificationContainer);
  }

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `px-4 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full opacity-0 ${
    type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
  }`;
  notification.textContent = message;

  // Add to container
  notificationContainer.appendChild(notification);

  // Trigger animation
  setTimeout(() => {
    notification.classList.remove("translate-x-full", "opacity-0");
  }, 10);

  // Remove after delay
  setTimeout(() => {
    notification.classList.add("translate-x-full", "opacity-0");

    // Remove from DOM after animation completes
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 5000);
}
