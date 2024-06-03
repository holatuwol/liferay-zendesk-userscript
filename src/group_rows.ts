var rowCounts = {};

function createViewGroupRowsSummary(
  rowCounts: Record<string, number>
) : HTMLTableElement {

  var table = document.createElement('table');
  table.classList.add('table', 'lesa-ui-group-rows-summary');

  var ticketTable = document.querySelector('div#views_views-ticket-table > div');

  if (ticketTable) {
    table.setAttribute('data-views-ticket-table-id', ticketTable.getAttribute('id') || '');
  }

  var body = Array.from(Object.keys(rowCounts)).sort().reduce((acc: HTMLTableSectionElement, next: string) => {
    var row = document.createElement('tr');

    var valueCell = document.createElement('td');
    valueCell.textContent = '' + rowCounts[next];
    row.appendChild(valueCell);

    var nameCell = document.createElement('td');
    nameCell.textContent = next;
    row.appendChild(nameCell);

    acc.appendChild(row);

    return acc;
  }, document.createElement('tbody'));

  table.appendChild(body);

  return table;
}

function checkViewGroupRows(
  counterElement: HTMLElement,
  rowCounts: Record<string, number>
) : void {

  var pageIndicator = document.querySelector('span[data-test-id="views_views-header-page-amount"]');

  if (pageIndicator) {
    var pageMatcher = (pageIndicator.textContent || '').match(/\d+/g);

    if (pageMatcher) {
      var [current, total] = pageMatcher.map(it => parseInt(it)).sort((a, b) => a - b);

      if (current != 1) {
        var firstElement = <HTMLButtonElement> document.querySelector('button[data-test-id="generic-table-pagination-first"]');
        firstElement.click();
      }
    }

    checkViewGroupRowsNextPageView(counterElement, rowCounts, 1);
  }
  else {
    checkViewGroupRowsPaginationView(counterElement, rowCounts, 1);
  }
}

function updateViewGroupRowCounts(rowCounts: Record<string, number>) : void {
  var tableBody = <HTMLTableSectionElement | null> document.querySelector('table[data-garden-id="tables.table"] tbody');

  if (!tableBody) {
    return;
  }

  var groupName = undefined;
  var rowCount = 0;

  for (var i = 0; i < tableBody.rows.length; i++) {
    var gardenId = tableBody.rows[i].getAttribute('data-garden-id');
    if (gardenId == 'tables.group_row') {
      var groupNameElement = tableBody.rows[i].querySelector('td span');
      groupName = groupNameElement ? groupNameElement.textContent : undefined;
      rowCount = 0;
    }
    else if (groupName && (gardenId = 'tables.row')) {
      if (!(groupName in rowCounts)) {
        rowCounts[groupName] = 0;
      }
      ++rowCounts[groupName];
    }
  }
}

function checkViewGroupRowsNextPageView(
  counterElement: HTMLElement,
  rowCounts: Record<string, number>,
  page: number
) : void {

  var paginator = document.querySelector('nav[data-test-id="generic-table-pagination"]');
  console.log(paginator, rowCounts, page);

  if (!paginator) {
    setTimeout(checkViewGroupRowsNextPageView.bind(null, counterElement, rowCounts, page), 100);
    return;
  }

  var pageIndicator = document.querySelector('[data-test-id="views_views-header-page-amount"]');

  if (pageIndicator == null) {
    setTimeout(checkViewGroupRowsNextPageView.bind(null, counterElement, rowCounts, page), 100);
    return;
  }

  var pageMatcher = (pageIndicator.textContent || '').match(/\d+/g);

  if (pageMatcher == null) {
    setTimeout(checkViewGroupRowsNextPageView.bind(null, counterElement, rowCounts, page), 100);
    return;
  }

  var [current, total] = pageMatcher.map(it => parseInt(it)).sort((a, b) => a - b);

  if (current != page) {
    setTimeout(checkViewGroupRowsNextPageView.bind(null, counterElement, rowCounts, page), 100);
    return;
  }

  updateViewGroupRowCounts(rowCounts);

  if (current == total) {
    counterElement.appendChild(createViewGroupRowsSummary(rowCounts));
    return;
  }

  var nextElement = <HTMLButtonElement> document.querySelector('button[data-test-id="generic-table-pagination-next"]');
  nextElement.click();

  setTimeout(checkViewGroupRowsNextPageView.bind(null, counterElement, rowCounts, page + 1), 100);
}

function checkViewGroupRowsPaginationView(
  counterElement: HTMLElement,
  rowCounts: Record<string, number>,
  page: number
) : void {

  var paginator = document.querySelector('ul[data-garden-id="pagination.pagination_view"]');

  if (!paginator) {
    setTimeout(checkViewGroupRowsPaginationView.bind(null, counterElement, rowCounts, page), 500);
    return;
  }

  var pageElement = <HTMLLIElement | null> paginator.querySelector('li[title="' + page + '"]');

  if (!pageElement) {
    counterElement.appendChild(createViewGroupRowsSummary(rowCounts));
    return;
  }

  if (pageElement.getAttribute('aria-current') != 'true') {
    pageElement.click();
    setTimeout(checkViewGroupRowsPaginationView.bind(null, counterElement, rowCounts, page), 500);
    return;
  }

  updateViewGroupRowCounts(rowCounts);

  checkViewGroupRowsPaginationView(counterElement, rowCounts, page + 1);
}

function addViewsBreakdownLink() : void {
  var counterElement = document.querySelector('div[data-test-id="views_views-header-counter"]');

  if (!counterElement) {
    return;
  }

  var breakdownLink = counterElement.querySelector('a.lesa-ui-count-breakdown');

  if (breakdownLink) {
    return;
  }

  var groupRowsSummaryTable = <HTMLTableElement | null> counterElement.querySelector('table.lesa-ui-group-rows-summary');

  if (groupRowsSummaryTable) {
    var ticketTable = document.querySelector('div#views_views-ticket-table > div');

    if (ticketTable && groupRowsSummaryTable.getAttribute('data-views-ticket-table-id') == ticketTable.getAttribute('id')) {
      return;
    }

    groupRowsSummaryTable.remove();
  }

  var groupRow = document.querySelector('table[data-garden-id="tables.table"] tbody tr[data-garden-id="tables.group_row"]');

  if (!groupRow) {
    return;
  }

  breakdownLink = document.createElement('a');
  breakdownLink.classList.add('lesa-ui-count-breakdown');
  breakdownLink.textContent = '(count groups)';
  breakdownLink.addEventListener('click', () => {
    (<HTMLAnchorElement> breakdownLink).remove();
    checkViewGroupRows(<HTMLElement> counterElement, {});
  });
  counterElement.appendChild(breakdownLink);
}