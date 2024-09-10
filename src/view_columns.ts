const CUSTOM_FIELD_SWARM_CATEGORIES = 14748442953229;

function populateTicketTableExtraColumns(
  tableContainer: HTMLElement,
  tickets: TicketAPIResult[]
) : void {

  if (tableContainer.querySelectorAll('td[data-test-id="ticket-table-cells-subject"]').length != tickets.length) {
    setTimeout(populateTicketTableExtraColumns.bind(null, tickets), 100);
    return
  }

  for (var i = 0; i < tickets.length; i++) {
    if (!tickets[i].custom_fields) {
      continue;
    }

    var swarmCategories = <string[] | null> getCustomFieldValue(tickets[i], CUSTOM_FIELD_SWARM_CATEGORIES);

    if (swarmCategories == null) {
      continue;
    }

    var selector = 'td[data-test-id="ticket-table-cells-subject"] a[href="tickets/' + tickets[i].id + '"]';

    var link = tableContainer.querySelector(selector);

    if (!link) {
      continue;
    }

    var cell = <HTMLTableCellElement> link.closest('td');

    var categoriesContainer = cell.querySelector('.lesa-ui-tags');

    if (categoriesContainer) {
      categoriesContainer.remove();
    }

    categoriesContainer = document.createElement('div');
    categoriesContainer.classList.add('lesa-ui-tags');

    categoriesContainer = swarmCategories.reduce((acc, next) => {
      var categoryElement = document.createElement('span');
      categoryElement.textContent = '+' + next.substring(5);
      acc.appendChild(categoryElement);
      return acc;
    }, categoriesContainer);

    cell.appendChild(categoriesContainer);
  }
}

function addTicketTableExtraColumns(
  tableContainer: HTMLElement,
  requestURL: string
) : void {

  var ticketTable = tableContainer.querySelector(
    'div#views_views-ticket-table > div, div[id^="search-ticket-"]');

  if (!ticketTable) {
    return;
  }

  var currentSorts = Array.from(tableContainer.querySelectorAll('div#views_views-ticket-table thead th[aria-sort]:not([aria-sort="none"])')).map(it => it.textContent).filter(it => it && it.trim()).join(',');
  var previousSorts = ticketTable.getAttribute('data-lesa-ui-filter-sorts');

  var currentURL = requestURL;
  var previousURL = ticketTable.getAttribute('data-lesa-ui-filter-url');

  if ((currentSorts == previousSorts) && (currentURL == previousURL)) {
    return;
  }

  ticketTable.setAttribute('data-lesa-ui-filter-url', currentURL);
  ticketTable.setAttribute('data-lesa-ui-filter-sorts', currentSorts);

  var xhr = new XMLHttpRequest();

  xhr.onload = function() {
    if (xhr.status != 200) {
      console.error("URL: " + xhr.responseURL);
      console.error("Error: " + xhr.status + " - " + xhr.statusText);
      return;
    }

    var response = null;

    try {
      response = JSON.parse(xhr.responseText);
    }
    catch (e) {
      console.error("URL: " + xhr.responseURL);
      console.error("Not JSON: " + xhr.responseText);
      return;
    }

    populateTicketTableExtraColumns(tableContainer, response['tickets'] || response['results']);
  }

  xhr.open('GET', requestURL);

  xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, max-age=0');
  xhr.setRequestHeader('Pragma', 'no-cache');

  xhr.send();
}

function addViewsExtraColumns() : void {
  var currentFilter = unsafeWindow.location.pathname.substring('/agent/filters/'.length);
  var currentPage = '1';

  var pageIndicator = document.querySelector('span[data-test-id="views_views-header-page-amount"]');

  if (pageIndicator) {
    var pageMatcher = (pageIndicator.textContent || '').match(/\d+/g);

    if (pageMatcher) {
      currentPage = pageMatcher[0];
    }
  }

  var tableContainer = <HTMLElement> document.querySelector('div[data-garden-id="pane"][role="tabpanel"]');

  var requestURL = '/api/v2/views/' + currentFilter + '/tickets.json?per_page=30&page=' + currentPage + '&sort_by=';
  addTicketTableExtraColumns(tableContainer, requestURL);
}

function addSearchExtraColumns() : void {
  var activeWorkspaceElement = <HTMLDivElement> document.querySelector('div.workspace:not([style^="display"]');

  if (!activeWorkspaceElement) {
    return;
  }

  var pageElement = <HTMLLIElement | null> activeWorkspaceElement.querySelector('li[data-garden-id="pagination.page"][aria-current="true"]');

  if (!pageElement) {
    return;
  }

  var page = pageElement.title;

  var searchElement = <HTMLInputElement> activeWorkspaceElement.querySelector('input[data-test-id="search_advanced-search-box_input-field_media-input"]');
  var search = searchElement.value;

  if (!search) {
    return;
  }

  var requestURL = '/api/v2/search.json?include=tickets&per_page=30&page=' + page + '&query=' + encodeURIComponent(search);
  addTicketTableExtraColumns(activeWorkspaceElement, requestURL);
};