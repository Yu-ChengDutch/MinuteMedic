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
        cardElement.onclick = () => showWelcomeScreen(card.DetailedCardInfo, card.Name, card.DetailedDescription); // Bind click event
        cardContainer.appendChild(cardElement);
    });
}

function showWelcomeScreen(detailedCardInfo, title, description="") {
    
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
                <img src="${detail.Icon}" alt="${detail.Name}">
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

        console.log(Object.keys(detail))

        if (Object.keys(detail).includes('DetailedCardInfo')) {

            detailedCard.onclick = () => showWelcomeScreen(detail.DetailedCardInfo, detail.Name, detail.DetailedDescription);

        } else {

            
            detailedCard.onclick = () => showPage(detail.Page, true);

            if (Object.keys(detail).includes('Page')) {

                detailedCard.id = 'page';

            } else {

                detailedCard.id = 'no-page';

            };

        };
        
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

function showPage(page, load=true){

    console.log(page);

    fetch(page)
    .then(response => {
        if (!response.ok) {
        throw new Error('Network response was not ok');
        }

        return response.text();
    })
    .then(data => {

        document.getElementById('mainContent').innerHTML = data;

        if (load == true) {loadScript('Scripts/Questions.js')}

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

function get_rand(){

    // A more cryptographically sound approach to random float
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const random = array[0] / (2**32); // Normalize to [0, 1)

    return random

}

function fetch_random(category) {

    pages = []

    // Select correct

    if (category == "random") {

        explorable_cards = cards.slice(-1);

    } else {

        explorable_cards = cards.slice(0, -1);

    }

    random = get_rand();

    while(explorable_cards.length != 0) {

        current_card = explorable_cards[0]

        if (Object.keys(current_card).includes("DetailedCardInfo")) {

            explorable_cards = explorable_cards.concat(current_card["DetailedCardInfo"])

        };

        if (Object.keys(current_card).includes("Page")) {

            pages.push(current_card["Page"]);

        };

        explorable_cards = explorable_cards.slice(1);
    
    };

    console.log(pages);

    const random_page = Math.floor(random * pages.length);

    showPage(pages[random_page]);

};
