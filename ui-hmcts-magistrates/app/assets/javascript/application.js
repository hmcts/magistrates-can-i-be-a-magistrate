// Custom JavaScript for Magistrates Recruitment UI
// GOV.UK Frontend is initialised in the main layout via window.GOVUKFrontend.initAll()

(function () {
  'use strict';

  // Character count display for textareas with maxlength
  var textareas = document.querySelectorAll('textarea[maxlength]');
  textareas.forEach(function (textarea) {
    var maxLength = parseInt(textarea.getAttribute('maxlength'), 10);
    var countDisplay = document.createElement('div');
    countDisplay.className = 'govuk-hint govuk-character-count__message';
    countDisplay.setAttribute('aria-live', 'polite');
    textarea.parentNode.insertBefore(countDisplay, textarea.nextSibling);

    function updateCount() {
      var remaining = maxLength - textarea.value.length;
      if (remaining >= 0) {
        countDisplay.textContent = 'You have ' + remaining + ' characters remaining';
        countDisplay.classList.remove('govuk-error-message');
      } else {
        countDisplay.textContent = 'You have ' + Math.abs(remaining) + ' characters too many';
        countDisplay.classList.add('govuk-error-message');
      }
    }

    textarea.addEventListener('input', updateCount);
    updateCount();
  });
})();
