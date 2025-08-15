// ========================
// Dynamic Quote Generator
// ========================

// Sample local quotes array
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "Be yourself; everyone else is already taken.", category: "inspirational" },
  { text: "Two things are infinite: the universe and human stupidity.", category: "humor" },
  { text: "So many books, so little time.", category: "books" }
];

let filteredQuotes = [...quotes];

// DOM references
const quoteDisplay = document.getElementById('quoteDisplay');
const categoryFilter = document.getElementById('categoryFilter');
const newQuoteBtn = document.getElementById('newQuote');

// Create sync status element
const syncStatus = document.createElement("div");
syncStatus.id = "syncStatus";
syncStatus.style.marginTop = "10px";
syncStatus.style.color = "green";
document.body.insertBefore(syncStatus, quoteDisplay);

// Populate category dropdown
function populateCategories() {
  categoryFilter.innerHTML = `<option value="all">All</option>`; // reset before adding
  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option);
  });
}
populateCategories();

// Show random quote
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  filteredQuotes = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteDisplay.textContent = `"${randomQuote.text}" — ${randomQuote.category}`;
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(randomQuote));
}
newQuoteBtn.addEventListener('click', showRandomQuote);

// Filter quotes by category
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  filteredQuotes = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);
  showRandomQuote();
}
window.filterQuotes = filterQuotes;

// Create the Add Quote form
function createAddQuoteForm() {
  const formDiv = document.createElement("div");
  formDiv.className = "form";

  const newQuoteTextInput = document.createElement("input");
  newQuoteTextInput.type = "text";
  newQuoteTextInput.placeholder = "Enter a new quote";

  const newQuoteCategoryInput = document.createElement("input");
  newQuoteCategoryInput.type = "text";
  newQuoteCategoryInput.placeholder = "Enter quote category";

  const addQuoteBtn = document.createElement("button");
  addQuoteBtn.textContent = "Add Quote";

  addQuoteBtn.addEventListener("click", function () {
    addQuote(newQuoteTextInput, newQuoteCategoryInput);
  });

  formDiv.append(newQuoteTextInput, newQuoteCategoryInput, addQuoteBtn);
  document.body.appendChild(formDiv);
}

// Add new quote
function addQuote(textInput, categoryInput) {
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category!");
    return;
  }

  quotes.push({ text, category });
  localStorage.setItem('quotes', JSON.stringify(quotes));

  textInput.value = "";
  categoryInput.value = "";

  populateCategories();
  showRandomQuote();
  postQuotesToServer({ text, category }); // Optional: post new quote to server
}

// Initialize form
createAddQuoteForm();

// Restore last viewed quote on load
(function restoreLastViewedQuote() {
  const last = sessionStorage.getItem("lastViewedQuote");
  if (last) {
    const parsed = JSON.parse(last);
    quoteDisplay.textContent = `"${parsed.text}" — ${parsed.category}`;
  }
})();

// Export quotes
function exportToJsonFile() {
  const jsonStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
}
window.exportToJsonFile = exportToJsonFile;

// Import quotes
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes = importedQuotes;
        filteredQuotes = [...quotes];
        localStorage.setItem('quotes', JSON.stringify(quotes));
        syncStatus.textContent = "Quotes imported successfully.";
        populateCategories();
        showRandomQuote();
      } else {
        throw new Error("Invalid JSON format");
      }
    } catch (err) {
      alert("Error importing quotes: " + err.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}
window.importFromJsonFile = importFromJsonFile;

// =============================
// Task 3: Server Sync + Conflict
// =============================

// Fetch quotes from server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const data = await response.json();
    const serverQuotes = data.map(item => ({
      text: item.title,
      category: "server"
    }));
    syncQuotes(serverQuotes);
  } catch (error) {
    console.error("Error fetching from server:", error);
    syncStatus.textContent = "Server sync failed.";
    syncStatus.style.color = "red";
  }
}

// Post quotes to server (mock API)
async function postQuotesToServer(newQuote) {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newQuote)
    });
    const result = await response.json();
    console.log("Posted to server:", result);
  } catch (error) {
    console.error("Error posting to server:", error);
  }
}

// Sync quotes with conflict resolution
function syncQuotes(serverQuotes) {
  let conflictDetected = false;
  if (JSON.stringify(quotes) !== JSON.stringify(serverQuotes)) {
    conflictDetected = true;
    quotes = serverQuotes;
    filteredQuotes = [...quotes];
    localStorage.setItem('quotes', JSON.stringify(quotes));
    populateCategories();
    showRandomQuote();
  }

  if (conflictDetected) {
    syncStatus.textContent = "Conflict detected — server data replaced local changes.";
    syncStatus.style.color = "orange";
  } else {
    syncStatus.textContent = "Quotes synced with server!";
    syncStatus.style.color = "green";
  }
}

// Periodic sync every 30 seconds
setInterval(fetchQuotesFromServer, 30000);

// Initial load
showRandomQuote();

