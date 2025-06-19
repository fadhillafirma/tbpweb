document.addEventListener('DOMContentLoaded', function() {
    const dropdownButton = document.getElementById('dropdownButton');
    const dropdownContent = document.getElementById('dropdownContent');

    // Toggle dropdown
    dropdownButton.addEventListener('click', function() {
        dropdownContent.classList.toggle('show');
    });

    // Get all event cards
    const eventCards = Array.from(document.querySelectorAll('.event-card'));

    // Function to sort events by price
    function sortByPrice(ascending = true) {
        const sorted = eventCards.sort((a, b) => {
            const priceA = parseFloat(a.getAttribute('data-price'));
            const priceB = parseFloat(b.getAttribute('data-price'));
            return ascending ? priceA - priceB : priceB - priceA;
        });

        // Reorder events in the DOM
        const eventContainer = document.getElementById('eventCards');
        sorted.forEach(card => {
            eventContainer.appendChild(card);
        });
    }

    // Function to sort events by name
    function sortByName(ascending = true) {
        const sorted = eventCards.sort((a, b) => {
            const nameA = a.getAttribute('data-name').toLowerCase();
            const nameB = b.getAttribute('data-name').toLowerCase();
            if (ascending) {
                return nameA.localeCompare(nameB);
            } else {
                return nameB.localeCompare(nameA);
            }
        });

        // Reorder events in the DOM
        const eventContainer = document.getElementById('eventCards');
        sorted.forEach(card => {
            eventContainer.appendChild(card);
        });
    }

    // Handle sort option selection
    document.getElementById('sortPriceLowHigh').addEventListener('click', function() {
        sortByPrice(true); // Sort price low to high
        dropdownContent.classList.remove('show');
    });

    document.getElementById('sortPriceHighLow').addEventListener('click', function() {
        sortByPrice(false); // Sort price high to low
        dropdownContent.classList.remove('show');
    });

    document.getElementById('sortNameAZ').addEventListener('click', function() {
        sortByName(true); // Sort by name A-Z
        dropdownContent.classList.remove('show');
    });

    document.getElementById('sortNameZA').addEventListener('click', function() {
        sortByName(false); // Sort by name Z-A
        dropdownContent.classList.remove('show');
    });
});
