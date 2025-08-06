document.getElementById('anonymousReportForm').addEventListener('submit', function(e) {
  e.preventDefault();

  // Normally here you would send data to server API

  // Show success message
  document.getElementById('successMessage').classList.remove('hidden');

  // Reset form
  document.getElementById('anonymousReportForm').reset();
});

document.getElementById('languageBtn').addEventListener('click', function() {
  alert('Language selection feature coming soon!');
});
