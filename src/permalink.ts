/**
 * Removes the highlight class from all comments.
 */

function clearHighlightedComments() : void {
  var highlightedComments = document.querySelectorAll('.lesa-ui-event-highlighted');

  for (var i = 0; i < highlightedComments.length; i++) {
    highlightedComments[i].classList.remove('lesa-ui-event-highlighted');
  }
}

/**
 * Scroll to a specific comment if its comment ID is included in a
 * query string parameter.
 */

function highlightComment(
  conversation: HTMLElement,
  ticketId: string,
  commentId: string
) : void {

  if (!commentId && !document.location.search) {
    var logContainer = <HTMLElement | null> conversation.querySelector('div[data-test-id="omni-log-container"]');

    if (logContainer && logContainer.getAttribute('data-sort-ticket-id') != ticketId) {

      var sortedComments = document.querySelectorAll('div[data-sort-ticket-id]');

      for (var i = 0; i < sortedComments.length; i++) {
        sortedComments[i].removeAttribute('data-sort-ticket-id');
      }

      var sort = getCookieValue('_lesa-ui-comment-sort') || 'asc';

      logContainer.style.flexDirection = (sort == 'asc') ? 'column' : 'column-reverse';

      var event = <HTMLElement> conversation.querySelector('div[id^="convo_log_sentinel_"]');

      event.scrollIntoView();

      logContainer.setAttribute('data-sort-ticket-id', ticketId);
    }

    clearHighlightedComments();

    return;
  }

  if (!commentId && document.location.search && document.location.search.indexOf('?comment=') == 0) {
    commentId = document.location.search.substring('?comment='.length);

    var pos = commentId.indexOf('&');

    if (pos != -1) {
      commentId = commentId.substring(0, pos);
    }
  }

  if (!commentId || (commentId.indexOf('"') != -1)) {
    return;
  }

  var comment = document.querySelector('time[datetime="' + commentId + '"], div[data-comment-id="' + commentId + '"]');

  if (!comment) {
    return;
  }

  var event = <HTMLElement> comment.closest(isAgentWorkspace ? 'article' : '.event');

  if (event.classList.contains('lesa-ui-event-highlighted')) {
    return;
  }

  var commentURL = 'https://' + document.location.host + document.location.pathname + '?comment=' + commentId;

  history.pushState({path: commentURL}, '', commentURL);

  clearHighlightedComments();

  event.classList.add('lesa-ui-event-highlighted');

  setTimeout(function() {
    event.scrollIntoView();
  }, 1000);
}

/**
 * Creates a self-highlighting input field.
 */

function createPermaLinkInputField(permalinkHREF: string) : HTMLInputElement {
  var permalink = document.createElement('input');

  permalink.value = permalinkHREF;

  permalink.onclick = function() {
    permalink.setSelectionRange(0, permalink.value.length);
  };

  return permalink;
}

/**
 * Add the comment ID as a query string parameter to function as a
 * pseudo permalink (since this script scrolls to it).
 */

function addPermaLinks(
  ticketId: string,
  ticketInfo: TicketMetadata,
  conversation: HTMLDivElement
) : void {

  var permalinks = conversation.querySelectorAll(isAgentWorkspace ? 'article div.lesa-ui-permalink' : 'div[data-comment-id] div.lesa-ui-permalink');

  if (permalinks.length > 0) {
    return;
  }

  var comments = conversation.querySelectorAll(isAgentWorkspace ? 'article' : 'div[data-comment-id]');
  var isPublicTab = !isAgentWorkspace && document.querySelector('.publicConversation.is-selected');

  for (var i = 0; i < comments.length; i++) {
    var timeElement = comments[i].querySelector('time');

    if (!timeElement) {
      continue;
    }

    var commentId = timeElement.getAttribute('datetime');

    var permalinkContainer = document.createElement('div');
    permalinkContainer.classList.add('lesa-ui-permalink');

    var permalinkHREF = 'https://' + document.location.host + document.location.pathname + '?comment=' + commentId;

    if (isPublicTab) {
      var pageId = Math.ceil((comments.length - i) / 30);
      permalinkHREF = 'https://help.liferay.com/hc/requests/' + ticketId + '?page=' + pageId + '#request_comment_' + commentId;
    }

    var permalink = createPermaLinkInputField(permalinkHREF);
    permalinkContainer.appendChild(permalink);

    if (isAgentWorkspace) {
      var actionHeader = <HTMLElement> comments[i].querySelector('.omnilog-header-actions');
      var commentHeader = <HTMLElement> actionHeader.parentElement;
      commentHeader.after(permalinkContainer);
    }
    else {
      var commentHeader = <HTMLElement> comments[i].querySelector('.content .header');
      commentHeader.appendChild(permalinkContainer);
    }
  }
}

/**
 * Attempt to bypass the single page application framework used by
 * ZenDesk and force a page reload.
 */

function skipSinglePageApplication(href: string) : boolean {
  document.location.href = href;

  return false;
}

/**
 * If it's a regular ZenDesk link, fix it by making the anchor's onclick
 * event scroll to the comment (if applicable).
 */

function fixZenDeskLink(
  conversation: HTMLElement,
  anchor: HTMLAnchorElement,
  ticketId: string
) : void {

  var href = anchor.href;

  var x = href.indexOf('/tickets/');

  if (x == -1) {
    return;
  }

  var y = href.indexOf('?comment=');

  if (y == -1) {
    return;
  }

  anchor.removeAttribute('href');

  if (href.substring(x + '?comment='.length, y) == ticketId) {
    var commentId = href.substring(y + '?comment='.length);

    anchor.onclick = highlightComment.bind(null, conversation, ticketId, commentId);
  }
  else {
    var commentURL = 'https://' + document.location.host + '/agent' + href.substring(x);

    anchor.onclick = skipSinglePageApplication.bind(null, commentURL);
  }
}

/**
 * If it's a Liferay HelpCenter link, fix it by massaging it so that it
 * behaves like we want a ZenDesk link to behave.
 */

function fixHelpCenterLink(
  conversation: HTMLElement,
  anchor: HTMLAnchorElement,
  ticketId: string
) : void {

  var href = anchor.href;

  var x = href.indexOf('https://help.liferay.com/hc/');

  if (x != 0) {
    return;
  }

  var y = href.indexOf('/requests/');

  if (y == -1) {
    return;
  }

  var z = href.indexOf('?comment=');
  var commentId = null;

  if (z != -1) {
    commentId = href.substring(z + '?comment='.length);
  }
  else {
    z = href.indexOf('#request_comment_');

    if (z != -1) {
      commentId = href.substring(z + '#request_comment_'.length);
    }
  }

  if (!commentId) {
    return;
  }

  var commentURL = 'https://' + document.location.host + '/agent/tickets/' + ticketId + '?commentId=' + commentId;

  anchor.removeAttribute('href');

  var linkTicketId = href.substring(y + '/requests/'.length, Math.min(href.indexOf('?'), z));

  if (linkTicketId == ticketId) {
    anchor.onclick = highlightComment.bind(null, conversation, ticketId, commentId);
  }
  else {
    anchor.onclick = skipSinglePageApplication.bind(null, commentURL);
  }
}

/**
 * Detect any existing permalinks on the page, and make them open in
 * a new tab (if they are an existing ticket) or auto-scroll.
 */

function fixPermaLinkAnchors(
  ticketId: string,
  ticketInfo: TicketMetadata,
  conversation: HTMLDivElement
) : void {

  var permalinks = conversation.querySelectorAll(isAgentWorkspace ? 'article div.lesa-ui-permalink' : 'div[data-comment-id] div.lesa-ui-permalink');

  if (permalinks.length > 0) {
    return;
  }

  var anchors = conversation.querySelectorAll('a');

  for (var i = 0; i < anchors.length; i++) {
    var anchor = anchors[i];

    fixZenDeskLink(conversation, anchor, ticketId);
    fixHelpCenterLink(conversation, anchor, ticketId);
  }
}