/**
 * Updates all help.liferay.com/attachments links to point to the current domain.
 */

function fixAttachmentLinks() {
  fixAttachmentLinksHelper('a', 'href');
  fixAttachmentLinksHelper('img', 'src');
}

function fixAttachmentLinksHelper(
  tagName: string,
  attributeName: string
) : void {

  Array.from(document.querySelectorAll(tagName + '[' + attributeName + '^="https://help.liferay.com/attachments/')).forEach(it => {
    var value = <string> it.getAttribute(attributeName);
    it.setAttribute(attributeName, value.substring('https://help.liferay.com'.length));
  });
}

/**
 * Apply updates to the page based on the retrieved ticket information. Since the
 * ticket corresponds to a "conversation", find that conversation.
 */

function checkTicketConversation(
  ticketId: string,
  ticketInfo: TicketMetadata
) : void {

  updateSidebarBoxContainer(ticketId, ticketInfo);

  var conversation = <HTMLDivElement> document.querySelector('div[data-side-conversations-anchor-id="' + ticketId + '"]');

  if (!conversation) {
    clearHighlightedComments();

    return;
  }

  var hasHeader = conversation.querySelectorAll('div[data-test-id="ticket-call-controls-action-bar"], .pane_header').length > 0;

  if (!hasHeader) {
    return;
  }

  var hasAgentWorkspaceComments = conversation.querySelectorAll('article').length > 0;

  if (!hasAgentWorkspaceComments) {
    return;
  }

  addReplyFormattingButtons(ticketId, ticketInfo, conversation);
  addPlaybookReminder(ticketId, ticketInfo, conversation);
  addTicketDescription(ticketId, ticketInfo, conversation);
  fixPermaLinkAnchors(ticketId, ticketInfo, conversation);
  addPermaLinks(ticketId, ticketInfo, conversation);
  updateWindowTitle(ticketId, ticketInfo);
  switchToInternalNotes(ticketId, ticketInfo, conversation);

  highlightComment(conversation, ticketId, '', false);
}

/**
 * Set the window title based on which URL you are currently visiting, so that if you
 * use browser history, you have useful information.
 */

function updateWindowTitle(
  ticketId?: string,
  ticketInfo?: TicketMetadata
) : void {

  var accountName = (document.location.hostname == 'liferay-support.zendesk.com') ? 'Liferay Help Center' : 'Liferay Sandbox';

  if (document.location.pathname.indexOf('/agent/dashboard') == 0) {
    document.title = accountName + ' - Agent Dashboard';
    return;
  }

  if (document.location.pathname.indexOf('/agent/admin/') == 0) {
    document.title = accountName + ' - Agent Admin';
    return;
  }

  if (ticketId && ticketInfo) {
    var emojis = '';

    if (ticketInfo.ticket && ticketInfo.ticket.tags) {
      emojis = getEmojiText(ticketInfo.ticket.tags);

      if (emojis.length > 0) {
        emojis += ' - ';
      }
    }

    var accountCode = getAccountCode(ticketId, ticketInfo);

    if (accountCode) {
      document.title = accountName + ' - ' + emojis + 'Agent Ticket #' + ticketInfo.ticket.id + ' - ' + accountCode + ' - ' + ticketInfo.ticket.raw_subject;
    }
    else {
      document.title = accountName + ' - ' + emojis + 'Agent Ticket #' + ticketInfo.ticket.id + ' - ' + ticketInfo.ticket.raw_subject;
    }

    return;
  }

  if (document.location.pathname.indexOf('/agent/filters/') == 0) {
    var filterElement = document.querySelector('.filter-title');

    if (filterElement && filterElement.textContent) {
      document.title = accountName + ' - Agent Filter - ' + filterElement.textContent;
    }

    return;
  }
}

/**
 * Since there's an SPA framework in place that I don't fully understand, attempt to
 * apply updates once per second, once we have the ticket information.
 */

function checkForConversations() : void {
  var ticketPath = '/agent/tickets/';

  if (document.location.pathname.indexOf(ticketPath) == 0) {
    var ticketId = document.location.pathname.substring(ticketPath.length);

    var pos = ticketId.indexOf('/');

    if (pos != -1) {
      revokeObjectURLs();
    }
    else {
      checkTicket(ticketId, checkTicketConversation);
    }
  }
  else {
    updateWindowTitle();
    revokeObjectURLs();
  }
}

/**
 * Update the selected tab with the account code.
 */

function updateSubtitle(
  title: HTMLElement,
  subtitle: HTMLElement,
  ticketId: string,
  ticketInfo: TicketMetadata
) : void {

  title.textContent = ticketInfo.ticket.raw_subject;
  title.setAttribute('title', ticketInfo.ticket.raw_subject);

  var accountCode = getAccountCode(ticketId, ticketInfo);

  if (!accountCode) {
    return;
  }

  var oldSpan = subtitle.querySelector('.lesa-ui-account-code');

  if (oldSpan && (oldSpan.textContent == accountCode)) {
    return;
  }

  if (!subtitle.classList.contains('lesa-ui-subtitle')) {
    subtitle.classList.add('lesa-ui-subtitle');
  }

  var newSpan = document.createElement('span');

  var emojis = getEmojiText(ticketInfo.ticket.tags || []);

  if (emojis.length > 0) {
    newSpan.appendChild(document.createTextNode(emojis + ' '));
  }

  newSpan.classList.add('lesa-ui-account-code');
  newSpan.textContent = accountCode;

  if (oldSpan) {
    oldSpan.replaceWith(newSpan);
  }
  else {
    subtitle.appendChild(newSpan);
  }
}

/**
 * Attempt to update the tab subtitles.
 */

function checkForSubtitles() : void {
  var tabs = <Array<HTMLElement>> Array.from(document.querySelectorAll('div[data-test-id="header-tab"]'));
  var subtitles = <Array<HTMLElement>> Array.from(document.querySelectorAll('div[data-test-id="header-tab-subtitle"]'));

  for (var i = 0; i < tabs.length; i++) {
    var tab = tabs[i];

    var subtitle = <HTMLElement> tab.querySelector('div[data-test-id="header-tab-subtitle"]');

    var textContent = ((subtitle.children.length > 0 && subtitle.children[0].textContent) || '').trim();

    if (textContent[0] != '#') {
      continue;
    }

    var title = <HTMLElement> tab.querySelector('div[data-test-id="header-tab-title"]');

    var ticketId = textContent.substring(1);

    checkTicket(ticketId, updateSubtitle.bind(null, title, subtitle));
  }
}

function abbreviateBadgeText(badge: HTMLElement) : boolean {
  var madeResizeChanges = false;
  if (!badge.textContent || (badge.textContent.length <= 2) || (badge.textContent[0] == '\u00A0')) {
    return madeResizeChanges;
  }

  if (badge.textContent === 'On-hold') {
    badge.textContent = '\u00A0H\u00A0';
    madeResizeChanges = true;
  }
  else if (badge.textContent === 'Open-Pending') {
    badge.textContent = 'OP';
    madeResizeChanges = true;
  }
  else {
    badge.textContent = '\u00A0' + badge.textContent[0] + '\u00A0';
    madeResizeChanges = true;
  }
  return madeResizeChanges;
}

/**
 * Set the old compact ticket status column style and change "Open-Pending" color to differenciate it from the "Open" one
 * For more information, see https://liferay.slack.com/archives/CL8DNJYB0/p1675440794494529
 */
function fixOldTicketStatusColumnStyle() : void {
  var pathname = unsafeWindow.location.pathname;
  var viewPage = (pathname.indexOf('/agent/dashboard') == 0) ||
    ((pathname.indexOf('/agent/filters/') == 0) && (pathname.indexOf('/suspended') == -1)) ||
    ((pathname.indexOf('/agent/search/') == 0) && (document.querySelector('div[data-test-id="search_tables_tab-tickets"][aria-selected="true"]') != null));

  /* update status column */
  var badges = <Array<HTMLElement>> Array.from(document.querySelectorAll('div[data-cy-test-id="status-badge-state"]'));
  var needsResize = false;

  for (var badge of badges) {
    if (updateBadge(badge)) {
      needsResize = true;
    }
    /* Change the status text to the abbreviate form only if we are in a view page and we are not in a popup */
    if (viewPage && !isBadgeInPopup(badge)) {
      if (abbreviateBadgeText(badge)) {
        needsResize = true;
      }
    }
  }

  /* Update Open-Pending badge color inside the ticket */
  var ticketBadges = <Array<HTMLElement>> Array.from(document.querySelectorAll('span.ticket_status_label'));
  for (var badge of ticketBadges) {
    if (updateBadge(badge)) {
      needsResize = true;
    }
  }

  if (viewPage) {
    if (removeTicketStatusColumn()) {
      needsResize = true;
    }
    if (adjustColumnTextWidth()) {
      needsResize = true;
    }

    if (needsResize) {
      unsafeWindow.dispatchEvent(new Event('resize'));
    }
  }
}

function adjustColumnTextWidth() : boolean {
  var madeResizeChanges = false;
  var tables = Array.from(document.querySelectorAll<HTMLTableElement>('table[data-onboarding-id="table_main"], table[data-test-id="table_header"]'));

  for (var table of tables) {
    var headers = Array.from((<HTMLTableSectionElement>table.tHead).rows[0].cells);
    for (var header of headers) {
      if (header.getAttribute('heatscore_processed') === 'true') {
        continue;
      }
      var textHeader = getTextHeader(header);
      if (textHeader && (textHeader.nodeValue === 'Heat Score')) {
        var button = header.querySelector('button');
        if (button) {button.title = 'Heat Score';}

        textHeader.nodeValue = 'Heat';
        madeResizeChanges = true;
      }
      header.setAttribute('heatscore_processed', 'true');
    }

    var product_column;
    var i = 0;
    for (var header of headers) {
      var textHeader = getTextHeader(header);
      if (textHeader && (textHeader.nodeValue === 'Offering')) {
        product_column = i;
        break;
      }
      i++;
    }
    if (!product_column) {
      continue;
    }

    var rows = Array.from((<HTMLCollectionOf<HTMLTableSectionElement>>table.tBodies)[0].rows);
    for (var row of rows) {
      var cell = row.cells[product_column];
      if (!cell || !cell.textContent || cell.getAttribute('product_processed')) {
        continue;
      }
      cell.title = cell.textContent;
      if (cell.textContent === 'Liferay Self-Hosted::Quarterly Release') {
        cell.textContent = 'Self-Hosted::Quarterly';
        madeResizeChanges = true;
      }
      else if (cell.textContent === 'Provisioning Request') {
        cell.textContent = 'Provisioning';
        madeResizeChanges = true;
      }
      else if (cell.textContent.startsWith('Liferay ')) {
        cell.textContent = cell.textContent.replace('Liferay ', '');
        madeResizeChanges = true;
      }
      cell.setAttribute('product_processed', 'true');
    }
  }

  return madeResizeChanges;
}

function getTextHeader(header: HTMLTableCellElement): ChildNode | null {
  var button = header.querySelector('button');
  if (!button) {
    return null;
  }

  if (!button.firstChild) {
    return null;
  }

  if (button.firstChild.nodeType === Node.TEXT_NODE) {
    return button.firstChild;
  }

  return null;
}

function removeTicketStatusColumn() : boolean {
  var madeResizeChanges = false;
  var tables = <Array<HTMLTableElement>> Array.from(document.querySelectorAll('table[data-onboarding-id="table_main"], table[data-test-id="table_header"]'));

  for (var i = 0; i < tables.length; i++) {
    var table = tables[i];

    var statusIndex = -1;

    var badge = table.querySelector('div[data-cy-test-id="status-badge-state"]');

    if (!badge) {
      if (table.getAttribute('data-test-id') == 'table_header') {
        var container = <HTMLDivElement> table.closest('div[data-test-id="table_container"]');
        var sibling = container.querySelector('table[data-test-id="table_main"]');

        if (sibling) {
          badge = sibling.querySelector('div[data-cy-test-id="status-badge-state"]');
        }
      }
    }

    if (badge) {
      var cell = <HTMLTableCellElement> badge.closest('td');
      var row = <HTMLTableRowElement> cell.closest('tr');

      for (var j = 0; j < row.cells.length; j++) {
        if (row.cells[j] == cell) {
          statusIndex = j;
          break;
        }
      }
    }

    if (statusIndex == -1) {
      continue;
    }

    var statusHeaderCell = (<HTMLTableSectionElement> table.tHead).rows[0].cells[statusIndex];

    if (statusHeaderCell.getAttribute('processed') == 'true') {
      continue
    }

    madeResizeChanges = true;

    /* remove "Ticket status" text from headers */
    statusHeaderCell.setAttribute('processed', 'true');
    statusHeaderCell.textContent = ' ';

    /* remove the padding of the column 2 before the status column */
    var cells = <Array<HTMLTableCellElement>> Array.from(table.querySelectorAll('tr > td:nth-child(' + (statusIndex - 1) + '), tr > th:nth-child(' + (statusIndex - 1) + ')'));
    for (var cell of cells) {
      cell.style.paddingLeft = '0';
    }

    /* remove the column 1 before the status column */
    cells = <Array<HTMLTableCellElement>> Array.from(table.querySelectorAll('tr > td:nth-child(' + (statusIndex) + '), tr > th:nth-child(' + (statusIndex) + ')'));
    for (var cell of cells) {
      cell.style.width = '0';
      cell.style.minWidth = '0';
      cell.style.maxWidth = '0';
      cell.style.padding = '0';
    }
  }

  return madeResizeChanges;
}

function updateBadge(badge: HTMLElement) : boolean {
  var madeResizeChanges = false;
  /* Change badge colors for Open-Pending to purple */
  if ((badge.textContent === 'Open-Pending' || badge.textContent === 'OP')) {
    if (!badge.getAttribute('updated-open-color')) {
      badge.style.setProperty("background-color", "#c782fc", "important");
      badge.setAttribute('updated-open-color', "true");
    }
  }
 /* Restore badge color if changing from Open-Pending to any other status */
  else if (badge.getAttribute('updated-open-color')) {
    badge.style.removeProperty("background-color");
    badge.removeAttribute('updated-open-color')
  }
  /* Closed status was lost now is shown as Resolved, we can get it again from badge attributes */
  else if (!badge.getAttribute('updated-closed-color') && ((badge.getAttribute('data-test-id') === 'status-badge-closed') || badge.classList.contains('closed'))) {
    badge.style.setProperty("background-color", "#dcdee0", "important");
    badge.style.setProperty("color", "#04363d", "important");
    badge.textContent = 'Closed';
    badge.setAttribute('updated-closed-color', "true");
    madeResizeChanges = true;
  }
  return madeResizeChanges;
}

function isBadgeInPopup(badge: HTMLElement) : boolean {
  if (!badge.parentElement) {
    return false;
  }
  var grandParent = badge.parentElement.parentElement;
  if (!grandParent) {
    return false;
  }
  if (grandParent.getAttribute('data-test-id') === "ticket_table_tooltip-header-ticket-info") {
    return true;
  }
  if (!grandParent.parentElement) {
    return false;
  }
  if (grandParent.parentElement.getAttribute('data-test-id') === "header-tab-tooltip") {
    return true;
  }
  if (grandParent.parentElement.getAttribute('data-cy-test-id') === "submit_button-menu") {
    return true;
  }
  return false;
}

function updateZendeskUI() : void {
  var pathname = unsafeWindow.location.pathname;

  if (pathname.indexOf('/agent/') == 0) {
    checkForConversations();
    checkForSubtitles();
    checkSidebarTags();

    fixAttachmentLinks();
    makeDraggableModals();
    fixOldTicketStatusColumnStyle();

    if (pathname.indexOf('/agent/filters/') == 0) {
      addViewsGoToPageButton();
      addViewsExtraColumns();
    }

    if (pathname.indexOf('/agent/search/') == 0) {
      addSearchExtraColumns();
    }
  }
  else if (pathname.indexOf('/knowledge/') == 0) {
    updateKnowledgeCenterEditor();
  }
}

GM_config.init({
  id: 'zendesk_for_tse_config',
  title: GM_info.script.name + ' Settings',
  fields: {
      DISPLAY_SWARMING_CATEGORIES_ON_LIST: {
          label: 'Display Swarming Skills on ticket rows',
          type: 'checkbox',
          default: true,
          title: 'Check if you want to display the Swarming Skils on ticket rows below the ticket title in filter viewsCheck if you want to display the Swarming Skils on ticket rows below the ticket title in filter views. This will make rows larger vertically.'
      },
      DISPLAY_SUB_ORGANIZATION_ON_LIST: {
          label: 'Display suborganization information on tickets rows (Spain office only)',
          type: 'checkbox',
          default: false,
          title: 'Check if you want to display the suborganization information on ticket rows below the ticket title'
      },
      EXECUTION_INTERVAL: {
          label: 'Execution interval (ms)',
          type: 'number',
          min: 1,
          default: 1000,
          title: 'The number of milliseconds to wait between each execution of the script'
      }
  },
  events: {
      init: onInit
  }
})

GM_registerMenuCommand('Settings', () => {
  GM_config.open()
})

function onInit() {
  // Since there's an SPA framework in place that I don't fully understand,
  // attempt to do everything once per second.
  setInterval(updateZendeskUI, GM_config.get('EXECUTION_INTERVAL'));
}
