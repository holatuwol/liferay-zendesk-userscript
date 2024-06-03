const CUSTOM_FIELD_SWARM_CATEGORIES = 14748442953229;


function populateViewsExtraColumns(
  tickets: TicketAPIResult[]
) : void {

  if (document.querySelectorAll('td[data-test-id="ticket-table-cells-subject"]').length != tickets.length) {
    setTimeout(populateViewsExtraColumns.bind(null, tickets), 100);
    return
  }

  for (var i = 0; i < tickets.length; i++) {
    var swarmCategories = <string[] | null> getCustomFieldValue(tickets[i], CUSTOM_FIELD_SWARM_CATEGORIES);

    if (swarmCategories == null) {
      continue;
    }
    var selector = 'td[data-test-id="ticket-table-cells-subject"] a[href="tickets/' + tickets[i].id + '"]';

    var link = document.querySelector(selector);

    if (!link) {
      continue;
    }

    var categoriesContainer = document.createElement('div');
    categoriesContainer.classList.add('lesa-ui-tags');

    categoriesContainer = swarmCategories.reduce((acc, next) => {
      var categoryElement = document.createElement('span');
      categoryElement.textContent = '+' + next.substring(5);
      acc.appendChild(categoryElement);
      return acc;
    }, categoriesContainer);

    var cell = <HTMLTableCellElement> link.closest('td');

    cell.appendChild(categoriesContainer);
  }
}

function addViewsExtraColumns() : void {
  var ticketTable = document.querySelector('div#views_views-ticket-table > div');

  if (!ticketTable) {
    return;
  }

  var currentFilter = unsafeWindow.location.pathname.substring('/agent/filters/'.length);
  var currentPage = '1';

  var pageIndicator = document.querySelector('span[data-test-id="views_views-header-page-amount"]');

  if (pageIndicator) {
    var pageMatcher = (pageIndicator.textContent || '').match(/\d+/g);

    if (pageMatcher) {
      currentPage = pageMatcher[0];
    }
  }

  var previousFilter = ticketTable.getAttribute('data-lesa-ui-filter-container-id');
  var previousPage = ticketTable.getAttribute('data-lesa-ui-filter-page-number');

  if ((currentFilter == previousFilter) && (currentPage == previousPage)) {
    return;
  }

  ticketTable.setAttribute('data-lesa-ui-filter-container-id', currentFilter);
  ticketTable.setAttribute('data-lesa-ui-filter-page-number', currentPage);

  var requestURL = '/api/v2/views/' + currentFilter + '/tickets.json?per_page=30&page=' + currentPage;

  GM.xmlHttpRequest({
    'method': 'GET',
    'url': requestURL,
    'headers': {
     'Cache-Control': 'no-cache, no-store, max-age=0',
     'Pragma': 'no-cache'
    },
    'responseType': 'json',
    'onload': function (xhr: XMLHttpRequest) {
      populateViewsExtraColumns(xhr.response['tickets']);
    }
  });
}