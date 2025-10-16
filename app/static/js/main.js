import dropdownManager from './utils/dropdown-toggle.js';
import themeManager from './utils/theme/theme-manager.js';
import FormSubmissionHandler from './utils/form-submission-handler.js';
import csrfUtils from './utils/csrf-utils.js';

document.addEventListener("DOMContentLoaded", function () {
    // Initialize all managers
    dropdownManager.init();
    themeManager.init();
    csrfUtils.init();
    // FormSubmissionHandler initializes automatically

    // Close alert messages
    const closeAlertButtons = document.querySelectorAll(".close-alert");
    closeAlertButtons.forEach((button) => {
        button.addEventListener("click", function () {
            this.parentElement.style.display = "none";
        });
    });

    // Auto-hide alerts after 5 seconds
    const alerts = document.querySelectorAll(".alert");
    alerts.forEach((alert) => {
        setTimeout(() => {
            alert.style.opacity = "0";
            setTimeout(() => {
                alert.style.display = "none";
            }, 300);
        }, 5000);
    });

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach((link) => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute("href"));
            if (target) {
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        });
    });

    // Add fade-in animation to elements when they come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("animate");
            }
        });
    }, observerOptions);

    const animateElements = document.querySelectorAll(
        ".feature-card, .mission-card"
    );
    animateElements.forEach((el) => observer.observe(el));
});

// Utility functions
function showAlert(message, type = "success") {
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="close-alert">
            <i class="bi bi-x"></i>
        </button>
    `;

    const container =
        document.querySelector(
            ".max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.mt-4"
        ) || document.body;
    container.insertBefore(alertDiv, container.firstChild);

    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertDiv.style.opacity = "0";
        setTimeout(() => {
            alertDiv.remove();
        }, 300);
    }, 5000);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}