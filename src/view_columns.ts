const CUSTOM_FIELD_SWARM_CATEGORIES = 14748442953229;

function populateTicketTableExtraColumns(
  tableContainer: HTMLElement,
  tickets?: TicketAPIResult[]
) : void {

  if (tickets) {
    tableContainer.setAttribute('data-tickets', JSON.stringify(tickets));
  }
  else {
    tickets = <TicketAPIResult[]> JSON.parse(tableContainer.getAttribute('data-tickets') || '[]');
  }

  if (GM_config.get('DISPLAY_SWARMING_CATEGORIES_ON_LIST')) {
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
        continue;
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

  if (GM_config.get('DISPLAY_SUB_ORGANIZATION_ON_LIST')) {
    for (var i = 0; i < tickets.length; i++) {
        var selector = 'td[data-test-id="generic-table-cells-id"]';

        var cellIds = <Array<HTMLElement>> Array.from(tableContainer.querySelectorAll(selector));

        var cellId = null;

        for (var j = 0; j < cellIds.length; j++) {
            const cellIdText = cellIds[j].textContent;
            if (cellIdText == null) {
              continue;
            }

            if (cellIdText.trim() === "#" + tickets[i].id) {
              cellId = cellIds[j];
            }
        }

        if (cellId == null) {
            continue;
        }

        var subOrgContainer = cellId.querySelector('.lesa-ui-tags');
        if (subOrgContainer) {
            continue;
        }
        var ticketTags = tickets[i].tags;
        if (ticketTags == null) {
          continue;
        }

        for (var j = 0; j < ticketTags.length; j++) {
          var tag = ticketTags[j];

          // Check for specific tag patterns
          if (tag.indexOf("_pod_") !== -1 || tag.indexOf("_porygon") !== -1 || tag.indexOf("_mewtwo") !== -1 || tag.indexOf("_slowpoke") !== -1) {
              // Create or select the container
              var container;
              if (GM_config.get('DISPLAY_SWARMING_CATEGORIES_ON_LIST')) {
                  container = document.createElement('div');
                  cellId.appendChild(container);
               } else {
                    container = cellId;
                    cellId.textContent += " "; // Append space
               }

              // Create and append the tag element
              var tagElement = document.createElement('span');
              tagElement.classList.add('lesa-ui-tags');
              tagElement.textContent = tag;
              container.appendChild(tagElement);
           }
        }
    }
  }

  if (GM_config.get('DISPLAY_QUICKWIN_ON_LIST')) {
    var selector = 'table[data-test-id="generic-table"] tbody tr[data-test-id="generic-table-row"]';
    var rows = document.querySelectorAll(selector);
    for (let i = 0; i < tickets.length; i++) {
      var row = <HTMLTableRowElement> rows[i];
      if (!row) {
        continue;
      }

      if (row.classList.contains('quickwin') || row.classList.contains('not-quickwin')) {
        continue;
      }

      var ticketTags = tickets[i].tags;
      var quickWin = ticketTags && ticketTags.filter(it => it.includes('quick_win')).length > 0;

      if (quickWin) {
        row.classList.add('quickwin');
      }
      else {
        row.classList.add('not-quickwin');
      }

      if (GM_config.get('DISPLAY_GREENCIRCLE_ON_LIST')) {
        row.cells[1].textContent = quickWin ? '🟢' : '';
        row.cells[1].style.width = '';
        row.cells[1].style.maxWidth = '';
        row.cells[1].style.padding = '';
      }
    }
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

  var currentURL = requestURL;
  var previousURL = ticketTable.getAttribute('data-lesa-ui-filter-url');

  if (currentURL == previousURL) {
    populateTicketTableExtraColumns(tableContainer);
    return;
  }

  ticketTable.setAttribute('data-lesa-ui-filter-url', currentURL);

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
  var tableContainer = document.querySelector('div[data-garden-id="pane"][role="tabpanel"]');

  if (tableContainer == null) {
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

  var requestURL = '/api/v2/views/' + currentFilter + '/tickets.json?per_page=30&page=' + currentPage;
  addTicketTableExtraColumns(<HTMLElement> tableContainer, requestURL);
}

function addSearchExtraColumns() : void {
  var activeWorkspaceElement = <HTMLDivElement> document.querySelector('div.workspace:not([style^="display"]');

  if (!activeWorkspaceElement) {
    return;
  }

  var page = '1';
  var pageElement = <HTMLLIElement | null> activeWorkspaceElement.querySelector('li[data-garden-id="pagination.page"][aria-current="true"]');

  if (pageElement) {
    page = pageElement.title;
  }

  var searchElement = <HTMLInputElement> activeWorkspaceElement.querySelector('input[data-test-id="search_advanced-search-box_input-field_media-input"]');
  var search = searchElement.value;

  if (!search) {
    return;
  }

  var requestURL = '/api/v2/search.json?include=tickets&per_page=30&page=' + page + '&query=' + encodeURIComponent(search);
  addTicketTableExtraColumns(activeWorkspaceElement, requestURL);
};
