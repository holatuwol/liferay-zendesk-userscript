function viewsGoToPage(target: number) : void {
  if (target <= 0) {
    return;
  }

  var pageIndicator = document.querySelector('[data-test-id="views_views-header-page-amount"]');

  if (pageIndicator == null) {
    setTimeout(viewsGoToPage.bind(null, target), 100);
    return;
  }

  var pageMatcher = (pageIndicator.textContent || '').match(/\d+/g);

  if (pageMatcher == null) {
    setTimeout(viewsGoToPage.bind(null, target), 100);
    return;
  }

  var [current, total] = pageMatcher.map(it => parseInt(it)).sort((a, b) => a - b);

  if (current == target) {
    return;
  }

  var direction = current > target ? 'previous' : 'next';

  var button = <HTMLButtonElement | null> document.querySelector('button[data-test-id="generic-table-pagination-' + direction + '"]');

  if (button == null) {
    setTimeout(viewsGoToPage.bind(null, target), 100);
    return;
  }

  button.click();
  viewsGoToPage(target);
}

function addViewsGoToPageButton() : void {
  var cursorPaginator = document.querySelector('#views_views-ticket-table nav[data-garden-id="cursor_pagination"]');

  if (!cursorPaginator) {
      return;
  }

  var goToPageButton = <HTMLButtonElement | null> cursorPaginator.querySelector('button.lesa-ui-go-to-page');

  if (goToPageButton) {
      return;
  }

  var nextButton = <HTMLButtonElement | null> cursorPaginator.querySelector('button[data-test-id="generic-table-pagination-next"]');

  if (!nextButton) {
    return;
  }

  goToPageButton = document.createElement('button');
  goToPageButton.classList.add('lesa-ui-go-to-page');
  goToPageButton.textContent = '...';

  goToPageButton.addEventListener('click', function() {
    viewsGoToPage(parseInt(prompt('Which page?') || '0'));
  });

  var buttonContainer = <HTMLElement> nextButton.parentElement;
  buttonContainer.insertBefore(goToPageButton, nextButton);
}