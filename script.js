// JS

// API KEY: AIzaSyBR5w4s85g-h6j9N2YBfSAPeTbnLTwF3Bk
const apiKey = 'AIzaSyBR5w4s85g-h6j9N2YBfSAPeTbnLTwF3Bk'; // Ersetze mit deinem Google Books API Key
const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');
const filterFree = document.getElementById('filter-free');
const filterPaid = document.getElementById('filter-paid');
const languageSelect = document.getElementById('language-select');
const resultsContainer = document.getElementById('results-container');
const detailsContainer = document.getElementById('details-container');
const paginationContainer = document.getElementById('pagination');

let currentPage = 0; // Start bei Seite 0
const maxResultsPerPage = 20; // Anzahl der Bücher pro Seite

// Filter abrufen
function getFilters() {
    const filters = [];
    if (filterFree.checked) filters.push('free-ebooks');
    if (filterPaid.checked) filters.push('paid-ebooks');
    return filters;
}

// Bücher suchen
function fetchBooks(query, filters = [], language = '', startIndex = 0) {
    let filterQuery = filters.length ? filters.map(filter => `filter=${filter}`).join('&') : '';
    let langQuery = language ? `langRestrict=${language}` : '';

    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&${filterQuery}&${langQuery}&startIndex=${startIndex}&maxResults=${maxResultsPerPage}&key=${apiKey}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayResults(data.items || []);
            updatePagination(data.totalItems);
        })
        .catch(error => console.error('Fehler beim Abrufen der Bücher:', error));
}

// Event für die Suchfunktion
searchButton.addEventListener('click', () => {
    const query = searchInput.value;

    if (!validateInput(query)) return;

    const filters = getFilters();
    const language = languageSelect.value;
    const preciseQuery = `intitle:${query} OR inauthor:${query}`;

    fetchBooks(preciseQuery, filters, language, currentPage * maxResultsPerPage);
});

// Validierungslogik
function validateInput(input) {
    input = input.trim();

    const validPattern = /^[a-zA-Z0-9 ´+'#:-]+$/;
    const forbiddenWords = ['test', '1234'];

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

      // Sortiere die Bücher alphabetisch nach dem ersten Autor
      books.sort((a, b) => {
        // Stelle sicher, dass das Autorenfeld existiert und das erste Element verwendet wird
        const authorA = a.volumeInfo.authors ? a.volumeInfo.authors[0].toLowerCase() : "";
        const authorB = b.volumeInfo.authors ? b.volumeInfo.authors[0].toLowerCase() : "";
        
        // Vergleiche die Autoren alphabetisch
        return authorA.localeCompare(authorB);
    });

    resultsContainer.innerHTML = ''; // Vorherige Ergebnisse entfernen
    if (books.length === 0) {
        resultsContainer.innerHTML = '<p>Keine Ergebnisse gefunden.</p>';
        return;
    }

    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.classList.add('col-md-4', 'mb-4'); // Bootstrap Grid-Klassen

        bookCard.innerHTML = `
            <div class="card h-100">
                <img src="${book.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/150'}" class="card-img-top" alt="${book.volumeInfo.title}">
                <div class="card-body">
                    <h5 class="card-title">${book.volumeInfo.title}</h5>
                    <p class="card-text">${book.volumeInfo.authors?.join(', ') || 'Unbekannter Autor'}</p>
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary btn-sm" onclick="displayDetails(${JSON.stringify(book).replace(/"/g, '&quot;')})">Details anzeigen</button>
                </div>
            </div>
        `;

        resultsContainer.appendChild(bookCard);
    });
}

/*

function displayResults(books) {
    // Sortiere die Bücher alphabetisch nach dem ersten Autor
    books.sort((a, b) => {
        // Stelle sicher, dass das Autorenfeld existiert und das erste Element verwendet wird
        const authorA = a.volumeInfo.authors ? a.volumeInfo.authors[0].toLowerCase() : "";
        const authorB = b.volumeInfo.authors ? b.volumeInfo.authors[0].toLowerCase() : "";
        
        // Vergleiche die Autoren alphabetisch
        return authorA.localeCompare(authorB);
    });

    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = '';

    if (books.length === 0) {
        resultsContainer.innerHTML = '<p>Keine Ergebnisse gefunden.</p>';
    } else {
        books.forEach(book => {
            const bookElement = document.createElement('div');
            bookElement.classList.add('book');

            const title = book.volumeInfo.title || 'Unbekannter Titel';
            const authors = book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unbekannter Autor';
            const imageUrl = book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : 'https://via.placeholder.com/128x192';

            bookElement.innerHTML = `
                <img src="${imageUrl}" alt="${title}" />
                <h3>${title}</h3>
                <p><strong>Autor(en):</strong> ${authors}</p>
            `;
            resultsContainer.appendChild(bookElement);
        });
    }
}


*/

// Buchdetails anzeigen
function displayDetails(book) {
    detailsContainer.innerHTML = `
        <h3>${book.volumeInfo.title}</h3>
        <p><strong>Autor(en):</strong> ${book.volumeInfo.authors?.join(', ') || 'Unbekannt'}</p>
        <p><strong>Beschreibung:</strong> ${book.volumeInfo.description || 'Keine Beschreibung verfügbar.'}</p>
        <p><strong>Verlag:</strong> ${book.volumeInfo.publisher || 'Unbekannt'}, ${book.volumeInfo.publishedDate || 'Unbekannt'}</p>
        <img src="${book.volumeInfo.imageLinks?.thumbnail || ''}" alt="${book.volumeInfo.title}" />
    `;

    // Automatisch zum Details-Bereich scrollen
    detailsContainer.scrollIntoView({ behavior: 'smooth' });
    
}


// Pagination
function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / maxResultsPerPage); // Gesamtseiten berechnen
    const paginationContainer = document.getElementById('pagination');

    // Pagination-Container leeren
    paginationContainer.innerHTML = ''; 

    // "Vorherige"-Button
    const prevItem = document.createElement('li');
    prevItem.classList.add('page-item');
    if (currentPage === 0) prevItem.classList.add('disabled');

    prevItem.innerHTML = `
        <a class="page-link" href="#" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
        </a>`;
    prevItem.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 0) {
            currentPage--;
            fetchBooks(searchInput.value.trim(), getFilters(), languageSelect.value, currentPage * maxResultsPerPage);
        }
    });
    paginationContainer.appendChild(prevItem);

    // Dynamische Seitenzahlen mit "..."
    const range = 3; // Anzahl der sichtbaren Seitenzahlen
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

    // Erste Seite
    if (currentPage > range) addPage(0);

    // Linkes "..."
    if (currentPage > range + 1) {
        const dots = document.createElement('li');
        dots.classList.add('page-item', 'disabled');
        dots.innerHTML = `<span class="page-link">...</span>`;
        paginationContainer.appendChild(dots);
    }

    // Sichtbare Seitenzahlen
    const start = Math.max(0, currentPage - Math.floor(range / 2));
    const end = Math.min(totalPages, start + range);

    for (let i = start; i < end; i++) {
        addPage(i, i === currentPage);
    }

    // Rechtes "..."
    if (currentPage < totalPages - range - 1) {
        const dots = document.createElement('li');
        dots.classList.add('page-item', 'disabled');
        dots.innerHTML = `<span class="page-link">...</span>`;
        paginationContainer.appendChild(dots);
    }

    // Letzte Seite
    if (currentPage < totalPages - range) addPage(totalPages - 1);

    // "Nächste"-Button
    const nextItem = document.createElement('li');
    nextItem.classList.add('page-item');
    if (currentPage >= totalPages - 1) nextItem.classList.add('disabled');

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



