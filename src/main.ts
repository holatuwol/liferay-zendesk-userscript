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
 * Shows the public conversation tab so that you can get help.liferay.com links to
 * share with customers.
 */

function enablePublicConversation(
  ticketId: string,
  ticketInfo: TicketMetadata,
  conversation: HTMLDivElement
) : void {

  var fullTab = <HTMLElement> conversation.querySelector('.event-nav.conversation .fullConversation');
  var publicTab = conversation.querySelector('.event-nav.conversation .publicConversation');

  if (publicTab && parseInt(publicTab.getAttribute('data-count') || '0') == 0) {
    publicTab.setAttribute('data-count', fullTab.getAttribute('data-count') || '0');
  }
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
  var hasLegacyWorkspaceComments = conversation.querySelectorAll('.event .zd-comment').length > 0;

  if (!hasAgentWorkspaceComments && !hasLegacyWorkspaceComments) {
    return;
  }

  isAgentWorkspace = hasAgentWorkspaceComments;

  if (!isAgentWorkspace && document.querySelectorAll('.editor').length == 0) {
    return;
  }

  if (!isAgentWorkspace) {
    enablePublicConversation(ticketId, ticketInfo, conversation);
  }

  addReplyFormattingButtons(ticketId, ticketInfo, conversation);
  addJiraLinks(ticketId, ticketInfo, conversation);
  addPlaybookReminder(ticketId, ticketInfo, conversation);
  addTicketDescription(ticketId, ticketInfo, conversation);
  fixPermaLinkAnchors(ticketId, ticketInfo, conversation);
  addPermaLinks(ticketId, ticketInfo, conversation);
  updateWindowTitle(ticketId, ticketInfo);

  highlightComment(conversation, ticketId, '');
}

/**
 * Set the window title based on which URL you are currently visiting, so that if you
 * use browser history, you have useful information.
 */

function updateWindowTitle(
  ticketId?: string,
  ticketInfo?: TicketMetadata
) : void {

  if (!accountInfo) {
    setAccountInfo(updateWindowTitle.bind(null, ticketId, ticketInfo));
    return;
  }

  var accountName = accountInfo.account.name;

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

/**
 * Set the old compact ticket status column style and change "Open-Pending" color to differenciate it from the "Open" one
 * For more information, see https://liferay.slack.com/archives/CL8DNJYB0/p1675440794494529
 */
function fixOldTicketStatusColumnStyle() : void {
  var viewPage = ((unsafeWindow.location.pathname.indexOf('/agent/filters') == 0) || (unsafeWindow.location.pathname.indexOf('/agent/dashboard') == 0));
  /* update status column */
  var badges = <Array<HTMLElement>> Array.from(document.querySelectorAll('div[data-cy-test-id="status-badge-state"]'));
  for (var badge of badges) {
    updateBadge(badge);
    /* Change the status text to the abreviate form only if we are in a view page and we are not in a popup */
    if (viewPage && badge.textContent && (badge.textContent.length > 2) && (badge.textContent[0] != ' ') && !isBadgeInPopup(badge)) {
        if (badge.textContent === 'On-hold') {
           badge.textContent = '\u00A0H\u00A0';
        }
        else if (badge.textContent === 'Open-Pending') {
           badge.textContent = 'OP';
        }
        else {
           badge.textContent = '\u00A0' + badge.textContent[0] + '\u00A0';
        }
    }
  }

  /* Update Open-Pending badge color inside the ticket */
  var ticketBadges = <Array<HTMLElement>> Array.from(document.querySelectorAll('span.ticket_status_label'));
  for (var badge of ticketBadges) {
    updateBadge(badge);
  }

  if(!viewPage) {
     return;
  }

  /* remove "Ticket status" text from headers */
  var headers = <Array<HTMLElement>> Array.from(document.querySelectorAll('th[data-garden-id="tables.header_cell"]:not([processed="true"]'));
  for (var header of headers) {
    header.setAttribute('processed', 'true');
  }
  if (headers[3] !== undefined) {
    headers[3].textContent = '';
  }
  /* remove the padding of second column */
  var secondColumn = <Array<HTMLElement>> Array.from(document.querySelectorAll('td.sc-15v8wy4-1:not([processed="true"]'));
  for (var cell of secondColumn) {
    cell.style.paddingLeft = '0px';
    cell.style.paddingRight = '2px';
    cell.setAttribute('processed', 'true');
  }
  if (headers[1] !== undefined) {
    headers[1].style.paddingLeft = '0px';
    headers[1].style.paddingRight = '2px';
  }
  /* remove empty third column */
  var thirdColumn = <Array<HTMLElement>> Array.from(document.querySelectorAll('td.oeot8n-0'));
  for (var cell of thirdColumn) {
    cell.remove()
  }
  if (headers[2] !== undefined) {
    headers[2].remove();
  }
}

function updateBadge(badge: HTMLElement) : void {
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
  }
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

// Since there's an SPA framework in place that I don't fully understand,
// attempt to do everything once per second.

if (unsafeWindow.location.hostname.indexOf('zendesk.com') != -1) {
  if (unsafeWindow.location.pathname.indexOf('/agent/') == 0) {
    setInterval(checkForConversations, 1000);
    setInterval(checkForSubtitles, 1000);
    setInterval(checkSidebarTags, 1000);
    setInterval(fixAttachmentLinks, 1000);
    setInterval(makeDraggableModals, 1000);
    setInterval(fixOldTicketStatusColumnStyle, 1000);
    setInterval(addViewsGoToPageButton, 1000);
  }
}