// script.js

let currentlyOpenCard = null; // Keep track of the currently opened card
let cards = null; // The cards are to be filled in from JSON file

fetch ("Data/Chapters.json")
    .then(response => {
        if (!response.ok) {
        throw new Error('Network response was not ok');
        }
        return response.json();  // Parse the JSON from the response
    })
    .then(data => {

        cards = data["Subdivision"];
        console.log(cards);  // Print the JSON data to the console
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const arrowToggle = document.getElementById('arrowToggle');
    const cardContainer = document.getElementById('cardContainer');
    
    sidebar.classList.toggle('expanded');

    if (sidebar.classList.contains('expanded')) {
        arrowToggle.innerHTML = '&#x25C0;'; // Left-facing arrow
        showCards(); // Load cards when expanded
    } else {
        arrowToggle.innerHTML = '&#x25B6;'; // Right-facing arrow
        cardContainer.innerHTML = ''; // Clear cards when collapsed
        // Close the currently opened card if the sidebar is collapsed
        if (currentlyOpenCard) {
            currentlyOpenCard.classList.remove('expanded');
            currentlyOpenCard = null;
        }
    }
}

function showCards() {
    const cardContainer = document.getElementById('cardContainer');
    cardContainer.innerHTML = ''; // Clear any existing cards

    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.innerHTML = `
            <h3>${card.Name}</h3>
            <p>${card.Content}</p>
        `;
        cardElement.style.backgroundImage = card.Style;
        // cardElement.style.backgroundPosition = "center center";
        cardElement.onclick = () => showWelcomeScreen(index, card.DetailedCardInfo, card.Name, card.DetailedDescription); // Bind click event
        cardContainer.appendChild(cardElement);
    });
}

function showWelcomeScreen(cardIndex, detailedCardInfo, title, description) {
    
    // Reset screen
    resetContent();
    
    const mainContent = document.getElementById('mainContent');
    const welcomeScreen = document.getElementById('welcomeScreen');

    const welcomeTitle = document.getElementById('welcome-title');
    const welcomeDescription = document.getElementById('welcome-description');

    const detailedCards = document.getElementById('detailedCards');    
    
    mainContent.style.display = 'flex'; // Ensure main content is visible
    welcomeScreen.style.display = 'flex'; // Show the welcome screen

    welcomeTitle.innerText = title;
    welcomeDescription.innerText = description;

    // Clear previous detailed cards
    detailedCards.innerHTML = '';

    detailedCardInfo.forEach(detail => {
        const detailedCard = document.createElement('div');
        detailedCard.className = 'detailed-card';
        detailedCard.innerHTML = `
            <div class='inner-detailed-card'>
                <img src="${detail.Econ}" alt="${detail.Name}">
                <div>
                    <h3>${detail.Name}</h3>
                    <p>${detail.Description}</p>
                </div>
            </div>
            <div class="expandable-content">
                    <p>${detail.Extra}</p>
            </div>
        `;
        // detailedCard.onclick = () => toggleExpandableContent(detailedCard); SAVE THIS FOR WHEN THERE IS EXPANDABLE CONTENT

        detailedCard.onclick = () => showPage(detail.Page, true);
        detailedCards.appendChild(detailedCard);
    });
}

function toggleExpandableContent(card) {
    if (currentlyOpenCard && currentlyOpenCard !== card) {
        currentlyOpenCard.classList.remove('expanded'); // Close the currently open card
    }

    card.classList.toggle('expanded'); // Toggle the clicked card

    // Update the currently open card reference
    currentlyOpenCard = card.classList.contains('expanded') ? card : null;
}

function showPage(page, load=false){

    fetch(page)
    .then(response => {
        if (!response.ok) {
        throw new Error('Network response was not ok');
        }

        return response.text();
    })
    .then(data => {

        document.getElementById('mainContent').innerHTML = data;

        if (load == true) {loadScript('../Scripts/Questions.js')}

    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });

}

function resetContent(){

    document.getElementById('mainContent').innerHTML = `
    
    <div class="welcome-screen" id="welcomeScreen">
        <div class="welcome-banner">
            <h1 id="welcome-title">Welcome to the Learning App!</h1>
            <p id="welcome-description">Explore the following topics to enhance your knowledge.</p>
        </div>
        <div class="detailed-cards" id="detailedCards">
            <!-- Detailed cards will be inserted here -->
        </div>
    </div>

    ` 

}

function loadScript(src) {
    const script = document.createElement('script');
    script.src = src;
    script.onerror = function() {
        console.error("Error loading script: " + src);
    };
    document.head.appendChild(script);
}
