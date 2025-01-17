
// JS

const apiKey = 'AIzaSyBR5w4s85g-h6j9N2YBfSAPeTbnLTwF3Bk'; 
const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');
const filterFree = document.getElementById('filter-free');
const filterPaid = document.getElementById('filter-paid');
const filterOptions = document.getElementById('filter-options');
const languageSelect = document.getElementById('language-select');
const resultsContainer = document.getElementById('results-container');
const detailsContainer = document.getElementById('details-container');
const paginationContainer = document.getElementById('pagination');

let currentPage = 0; // Start bei Seite 0
const maxResultsPerPage = 20; // Anzahl der Bücher pro Seite

// display filters 
filterOptions.style.display = "none";

// Filter abrufen
function getFilters() {
    const filters = [];
    if (filterFree.checked) filters.push('free-ebooks');
    if (filterPaid.checked) filters.push('paid-ebooks');
    return filters;
}

// Bücher suchen mit Paramtersierung (query, filters, language) mithilfe der fetch-Methode
function fetchBooks(query, filters = [], language = '', startIndex = 0) {
    let filterQuery = filters.length ? filters.map(filter => `filter=${filter}`).join('&') : '';
    let langQuery = language ? `langRestrict=${language}` : '';
    // => filters.length prüft, ob das Filter-Array leer ist:
    //Wenn nicht leer: map() wird verwendet, um jedes Filterkriterium in den Format filter=... umzuwandeln, und die Filter werden mit & verbunden.
    //Wenn leer: filterQuery wird ein leerer String.

    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&${filterQuery}&${langQuery}&startIndex=${startIndex}&maxResults=${maxResultsPerPage}&key=${apiKey}`;

    // Fetch-Methode wird verwendet, um die API abzufragen
    fetch(url) // Ruft die URL auf und sendet eine GET-Anfrage an die Google Books API
        .then(response => response.json())
        .then(data => {
            displayResults(data.items || []); // Darstellung der gefundenen Büchern
            updatePagination(data.totalItems);
        })
        .catch(error => console.error('Fehler beim Abrufen der Bücher:', error)); //Fehlermeldung wenn Dienst nicht zugänglich
}

// Einblenden von Filteroptions nach 4 Buchstaben
searchInput.addEventListener('keyup', function (e) {
    string = this.value;

    if (string.trim().length >= 4) { // muss mindestens 4 Eingaben haben, um die Filteroptionen einzublenden
        filterOptions.style.display = "block";
        paginationContainer.style.display ="flex";
    } else { 
        filterOptions.style.display = "none";
        paginationContainer.style.display ="none"; //Sonst werden die Filter gar nicht eingeblendet 
    }
})

// Event für die Suchfunktion
searchButton.addEventListener('click', () => {
    const query = searchInput.value;

    if (!validateInput(query)) return;

    const filters = getFilters();
    const language = languageSelect.value;
    const preciseQuery = `intitle:${query} OR inauthor:${query}`;

    fetchBooks(preciseQuery, filters, language, currentPage * maxResultsPerPage); // wieder Fetch-Methode um die Seite zu laden & Bücher abzufragen
});

// Validierungslogik 
function validateInput(input) {
    input = input.trim();

    const validPattern = /^[a-zA-Z0-9 ´+'#:-]+$/;
    const forbiddenWords = ['test', '1234', '123456789', '88'];

    if (!input) {
        alert('Eingabe darf nicht leer sein.');
        return false;
    }

    if (!validPattern.test(input)) {
        alert('Ungültige Eingabe: Nur Buchstaben, Zahlen, Leerschläge und die Zeichen ´ \'+ # sind erlaubt.');
        return false;
    }

    if (/^\s+$/.test(input)) {
        alert('Eingabe darf nicht nur aus Leerzeichen bestehen.');
        return false;
    }

    if (forbiddenWords.includes(input.toLowerCase())) {
        alert(`Der Begriff "${input}" ist nicht erlaubt.`);
        return false;
    }

    if (input.length < 2) {
        alert('Die Eingabe muss mindestens 2 Zeichen lang sein.');
        return false;
    }

    return true;
}

// Ergebnisse anzeigen
function displayResults(books) {
    // Bücher alphabetisch nach dem ersten Autor sortieren
    books.sort((a, b) => {
        const authorA = a.volumeInfo.authors ? a.volumeInfo.authors[0].toLowerCase() : "";
        const authorB = b.volumeInfo.authors ? b.volumeInfo.authors[0].toLowerCase() : "";
        return authorA.localeCompare(authorB);
    });

    resultsContainer.innerHTML = ''; // Vorherige Ergebnisse entfernen

    // If-Schleife wenn es keine Bücher mit den angegeben Filtern und dem query gibt
    if (books.length === 0) {
        resultsContainer.innerHTML = '<p>Keine Ergebnisse gefunden.</p>';
        return;
    }

    // Bücher in Kacheln anzeigen (Bootstrap)
    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.classList.add('col-md-4', 'mb-4'); // Bootstrap-Klassen

        bookCard.innerHTML = `
            <div class="card h-100">
                <img src="${book.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/150'}" class="card-img-top" alt="${book.volumeInfo.title}">
                <div class="card-body">
                    <h5 class="card-title">${book.volumeInfo.title}</h5>
                    <p class="card-text">${book.volumeInfo.authors?.join(', ') || 'Unbekannter Autor'}</p>
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#exampleModal" onclick="displayDetails('${encodeURIComponent(JSON.stringify(book))}')">Details anzeigen</button>
                </div>
            </div>
        `;

        resultsContainer.appendChild(bookCard);//Anhängung an das Ende des result-Containers
    });
}

// Inhalt mit den Details füllen
function displayDetails(bookJson) {
    const book = JSON.parse(decodeURIComponent(bookJson));

    // Modal-Titel und Inhalte aktualisieren
    document.getElementById('exampleModalLabel').textContent = book.volumeInfo.title;
    document.querySelector('#exampleModal .modal-body').innerHTML = `
        <img src="${book.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/150'}" alt="${book.volumeInfo.title}" class="img-fluid mb-3"/>
        <p><strong>Autor(en):</strong> ${book.volumeInfo.authors?.join(', ') || 'Unbekannt'}</p>
        <p><strong>Beschreibung:</strong> ${book.volumeInfo.description || 'Keine Beschreibung verfügbar.'}</p>
        <p><strong>Erscheinungsdatum:</strong> ${book.volumeInfo.publishedDate || 'Unbekannt'}</p>
    `;
}

//Pagination => hier stimmt was noch nicht
function updatePagination(totalItems) {
    const paginationContainer = document.getElementById('pagination'); // HTML-Container wird referenziert
    paginationContainer.innerHTML = ''; // Vorherige Pagination löschen

    const totalPages = Math.ceil(totalItems / maxResultsPerPage); // Gesamtseiten berechnen (Gesamtbücher / MaxResultsPerPage, math.ceil = aufrunden)
    
    // Überprüfung: Pagination nur anzeigen, wenn mehrere Seiten vorhanden sind
      if (totalItems <= maxResultsPerPage) {
        paginationContainer.style.display = 'none'; // Pagination ausblenden
        return;
    }
    paginationContainer.style.display = 'flex'; // Pagination sichtbar machen

    const range = 3; // Anzahl der sichtbaren Seitenzahlen

    // "Vorherige"-Button
    const prevItem = document.createElement('li');
    prevItem.classList.add('page-item');
    if (currentPage === 0) prevItem.classList.add('disabled'); // Deaktivieren bei erster Seite
    prevItem.innerHTML = `
        <a class="page-link" href="#" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
        </a>`;
    prevItem.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 0) {
            currentPage--;
            fetchBooks(searchInput.value.trim(), getFilters(), languageSelect.value, currentPage * maxResultsPerPage);//Neue API-Anfrage, um die Bücher auf der vorherigen Seite zu zeigen
        }
    });
    paginationContainer.appendChild(prevItem);

    // Dynamische Seitenzahlen
    const addPage = (pageNum, isActive = false) => {
        const pageItem = document.createElement('li');
        pageItem.classList.add('page-item');
        if (isActive) pageItem.classList.add('active');
        pageItem.innerHTML = `<a class="page-link" href="#">${pageNum + 1}</a>`;
        pageItem.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = pageNum;
            fetchBooks(searchInput.value.trim(), getFilters(), languageSelect.value, currentPage * maxResultsPerPage);
        });
        paginationContainer.appendChild(pageItem);
    };

    // Start- und Endpunkt der sichtbaren Seiten
    const start = Math.max(0, Math.min(currentPage - Math.floor(range / 2), totalPages - range));//Range = 3, vordefiniert
    const end = Math.min(totalPages, start + range);

    // Erste Seite
    if (currentPage > range) addPage(0);

    // Linkes "..."
    if (currentPage > range + 1) {
        const leftDots = document.createElement('li');
        leftDots.classList.add('page-item', 'disabled');
        leftDots.innerHTML = `<span class="page-link">...</span>`;
        paginationContainer.appendChild(leftDots);
    }

    // Sichtbare Seiten
    for (let i = start; i < end; i++) {
        addPage(i, i === currentPage);
    }

    // Rechtes "..."
    if (currentPage < totalPages - range - 1) {
        const rightDots = document.createElement('li');
        rightDots.classList.add('page-item', 'disabled');
        rightDots.innerHTML = `<span class="page-link">...</span>`;
        paginationContainer.appendChild(rightDots);
    }

    // Letzte Seite
    if (currentPage < totalPages - range) addPage(totalPages - 1);

    // "Nächste"-Button
    const nextItem = document.createElement('li');
    nextItem.classList.add('page-item');
    if (currentPage >= totalPages - 1) nextItem.classList.add('disabled'); // Deaktivieren bei letzter Seite
    nextItem.innerHTML = `
        <a class="page-link" href="#" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
        </a>`;
    nextItem.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages - 1) {
            currentPage++;
            fetchBooks(searchInput.value.trim(), getFilters(), languageSelect.value, currentPage * maxResultsPerPage);
        }
    });
    paginationContainer.appendChild(nextItem);
}

//Pagination Ende

// Tooltip
const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
tooltipTriggerList.forEach(function (tooltipTriggerEl) {
    new bootstrap.Tooltip(tooltipTriggerEl);
});

// Modal
const myModal = document.getElementById('myModal')
const myInput = document.getElementById('myInput')

