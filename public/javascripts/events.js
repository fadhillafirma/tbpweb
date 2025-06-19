// events.js

document.addEventListener("DOMContentLoaded", () => {
    // Get references to the dropdown and sorting options
    const dropdownButton = document.querySelector("button.bg-gradient-to-r");
    const dropdownContent = document.querySelector(".dropdown-content");

    // Toggle dropdown visibility
    dropdownButton.addEventListener("click", () => {
        dropdownContent.classList.toggle("hidden");
    });

    // Get all event cards
    const eventCards = document.querySelectorAll(".event-card");

    // Sorting by Name (A-Z)
    document.getElementById("sortNameAZ").addEventListener("click", () => {
        const sortedEvents = [...eventCards].sort((a, b) => {
            const nameA = a.getAttribute("data-name").toLowerCase();
            const nameB = b.getAttribute("data-name").toLowerCase();
            return nameA.localeCompare(nameB);
        });
        displaySortedEvents(sortedEvents);
    });

    // Sorting by Name (Z-A)
    document.getElementById("sortNameZA").addEventListener("click", () => {
        const sortedEvents = [...eventCards].sort((a, b) => {
            const nameA = a.getAttribute("data-name").toLowerCase();
            const nameB = b.getAttribute("data-name").toLowerCase();
            return nameB.localeCompare(nameA);
        });
        displaySortedEvents(sortedEvents);
    });

    // Sorting by Price (Low to High)
    document.getElementById("sortPriceLowHigh").addEventListener("click", () => {
        const sortedEvents = [...eventCards].sort((a, b) => {
            const priceA = parseInt(a.getAttribute("data-price"), 10);
            const priceB = parseInt(b.getAttribute("data-price"), 10);
            return priceA - priceB;
        });
        displaySortedEvents(sortedEvents);
    });

    // Sorting by Price (High to Low)
    document.getElementById("sortPriceHighLow").addEventListener("click", () => {
        const sortedEvents = [...eventCards].sort((a, b) => {
            const priceA = parseInt(a.getAttribute("data-price"), 10);
            const priceB = parseInt(b.getAttribute("data-price"), 10);
            return priceB - priceA;
        });
        displaySortedEvents(sortedEvents);
    });

    // Function to display sorted events
    function displaySortedEvents(sortedEvents) {
        const container = document.getElementById("eventCards");
        container.innerHTML = ""; // Clear current event cards
        sortedEvents.forEach(event => {
            container.appendChild(event); // Append each sorted event card
        });
    }

    // Handle price update for dynamic sorting
    const priceInputs = document.querySelectorAll(".price-input");
    priceInputs.forEach(input => {
        input.addEventListener("change", (e) => {
            const cardId = e.target.getAttribute("data-card-id");
            const newPrice = parseInt(e.target.value, 10);

            // Update the event card's price and data-price attribute
            const eventCard = document.querySelector(`.event-card[data-name="${e.target.closest('.event-card').getAttribute('data-name')}"]`);
            const priceDisplay = eventCard.querySelector(`#price-${cardId}`);
            eventCard.setAttribute("data-price", newPrice);

            // Update the displayed price
            if (newPrice === 0) {
                priceDisplay.textContent = "FREE";
                priceDisplay.classList.remove("text-red-600");
                priceDisplay.classList.add("text-orange-500");
            } else {
                priceDisplay.textContent = `Rp ${newPrice.toLocaleString()}`;
                priceDisplay.classList.add("text-red-600");
                priceDisplay.classList.remove("text-orange-500");
            }

            // Re-sort the events after price change
            sortEventsByPrice(); // To reflect the updated price sorting
        });
    });

    // Function to re-sort events after price update
    function sortEventsByPrice() {
        const sortedEvents = [...eventCards].sort((a, b) => {
            const priceA = parseInt(a.getAttribute("data-price"), 10);
            const priceB = parseInt(b.getAttribute("data-price"), 10);
            return priceA - priceB;
        });
        displaySortedEvents(sortedEvents);
    }
});
