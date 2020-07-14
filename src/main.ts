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

  if (conversation) {
    var editor = conversation.querySelector('.editor');

    if (!editor) {
      return;
    }

    enablePublicConversation(ticketId, ticketInfo, conversation);
    addReplyFormattingButtons(ticketId, ticketInfo, conversation);
    addJiraLinks(ticketId, ticketInfo, conversation);
    addPlaybookReminder(ticketId, ticketInfo, conversation);
    addTicketDescription(ticketId, ticketInfo, conversation);
    fixPermaLinkAnchors(ticketId, ticketInfo, conversation);
    addPermaLinks(ticketId, ticketInfo, conversation);
    updateWindowTitle(ticketId, ticketInfo);
  }

  highlightComment();
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
      document.title = accountName + ' - ' + emojis + 'Agent Ticket - ' + accountCode + ' - ' + ticketInfo.ticket.raw_subject;
    }
    else {
      document.title = accountName + ' - ' + emojis + 'Agent Ticket - ' + ticketInfo.ticket.raw_subject;
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
  subtitle: HTMLElement,
  ticketId: string,
  ticketInfo: TicketMetadata
) : void {

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
  var subtitles = <Array<HTMLElement>> Array.from(document.querySelectorAll('div[data-test-id="header-tab-subtitle"]'));

  for (var i = 0; i < subtitles.length; i++) {
    var subtitle = subtitles[i];

    var textContent = (subtitle.children[0].textContent || '').trim();

    if (textContent[0] != '#') {
      continue;
    }

    var ticketId = textContent.substring(1);

    checkTicket(ticketId, updateSubtitle.bind(null, subtitle));
  }
}

// Since there's an SPA framework in place that I don't fully understand,
// attempt to do everything once per second.

if (unsafeWindow.location.hostname.indexOf('zendesk.com') != -1) {
  if (unsafeWindow.location.pathname.indexOf('/agent/') == 0) {
    setInterval(checkForConversations, 1000);
    setInterval(checkForSubtitles, 1000);
    setInterval(checkSidebarTags, 1000);
    setInterval(makeDraggableModals, 1000);
  }
}