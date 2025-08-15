// 1) Load quotes from localStorage or use defaults
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Your limitation—it’s only your imagination.", category: "Motivation" },
  { text: "Do something today that your future self will Thankyou for.", category: "Inspiration" },
  { text: "Happiness comes from your own actions.", category: "Happiness" }
];

// Helper to save quotes -> localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// 2) Grab elements from the page
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter"); // from HTML

// 3) Create the category dropdown dynamically (for showing random quotes)
const categorySelect = document.createElement("select");
categorySelect.id = "categorySelect";
quoteDisplay.parentNode.insertBefore(categorySelect, quoteDisplay);

// 4) Function to fill dropdown with categories
function updateCategoryOptions() {
  const categories = [...new Set(quotes.map(q => q.category))].sort();
  categorySelect.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// Populate filter dropdown for Task 2
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))].sort();
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter from localStorage
  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter) {
    categoryFilter.value = savedFilter;
  }
}

// 5) Show a random quote based on selected category
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filteredQuotes = quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteDisplay.textContent = `"${randomQuote.text}" — ${randomQuote.category}`;
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(randomQuote));
}

// 6) Event listener for "Show New Quote"
newQuoteBtn.addEventListener("click", showRandomQuote);

// 7) Populate categories initially
updateCategoryOptions();
populateCategories();

// 8) Filtering logic for Task 2
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("selectedCategory", selected);

  let filteredQuotes = quotes;
  if (selected !== "all") {
    filteredQuotes = quotes.filter(q => q.category === selected);
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteDisplay.textContent = `"${randomQuote.text}" — ${randomQuote.category}`;
}

// 9) Create the Add Quote form
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

// 10) Add new quote
function addQuote(textInput, categoryInput) {
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category!");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();

  textInput.value = "";
  categoryInput.value = "";

  updateCategoryOptions();
  populateCategories();
  showRandomQuote();
}

// 11) Create form
createAddQuoteForm();

// 12) Restore last viewed quote on load
(function restoreLastViewedQuote() {
  const last = sessionStorage.getItem("lastViewedQuote");
  if (last) {
    const parsed = JSON.parse(last);
    quoteDisplay.textContent = `"${parsed.text}" — ${parsed.category}`;
  }
})();

// 13) Export function
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 14) Import function
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);

      if (!Array.isArray(importedQuotes)) {
        alert("Invalid JSON format. Expected an array of quotes.");
        return;
      }

      const valid = importedQuotes.filter(
        q => q && typeof q.text === "string" && typeof q.category === "string"
      );

      if (valid.length === 0) {
        alert("No valid quotes found in file.");
        return;
      }

      quotes.push(...valid);
      saveQuotes();
      updateCategoryOptions();
      populateCategories();
      showRandomQuote();

      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Error reading JSON file.");
    }
  };

  if (event.target.files && event.target.files[0]) {
    fileReader.readAsText(event.target.files[0]);
  }
}
