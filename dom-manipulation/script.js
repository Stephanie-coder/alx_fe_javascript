// ===== Add New Quote Form =====
const quoteForm = document.getElementById('quoteForm');
const quoteTextInput = document.getElementById('quoteText');
const quoteCategoryInput = document.getElementById('quoteCategory');

quoteForm.addEventListener('submit', function(e) {
  e.preventDefault();

  const text = quoteTextInput.value.trim();
  const category = quoteCategoryInput.value.trim().toLowerCase();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  // Add new quote to local array
  quotes.push({ text, category });
  filteredQuotes = [...quotes];

  // Save to localStorage
  localStorage.setItem('quotes', JSON.stringify(quotes));

  // Refresh category dropdown (avoid duplicates)
  categoryFilter.innerHTML = `<option value="all">All</option>`;
  populateCategories();

  // Show the newly added quote
  quoteDisplay.textContent = `"${text}"`;

  // Clear form
  quoteTextInput.value = "";
  quoteCategoryInput.value = "";

  syncStatus.textContent = "Quote added locally.";
  syncStatus.style.color = "blue";
});
