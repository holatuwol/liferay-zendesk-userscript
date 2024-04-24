const CUSTOM_FIELD_CHILD_OF = 360013377052;
const CUSTOM_FIELD_HEAT_SCORE = 360049454932;

/**
 * Add a heat score.
 */

function addHeatScoreMarker(
  header: HTMLElement,
  conversation: HTMLElement,
  ticketInfo: TicketMetadata
) : void {

  var heatScore = getCustomFieldValue(ticketInfo, CUSTOM_FIELD_HEAT_SCORE);

  if (heatScore == null) {
    return;
  }

  var slaPolicy = conversation.querySelector('div[data-test-id^="sla-policy-"]');

  var slaPolicyContainer = <HTMLSpanElement | null> null;

  if (slaPolicy == null) {
    slaPolicy = document.createElement('div');
    slaPolicy.classList.add('sc-hljan3-0', 'iQJOlz', 'StyledTag-sc-1jvbe03-0', 'fSIpth');
    slaPolicy.setAttribute('data-test-id', 'sla-policy-metric');

    slaPolicyContainer = document.createElement('span');
    slaPolicyContainer.setAttribute('data-garden-container-id', 'containers.tooltip');

    var viaLabel = <HTMLDivElement> conversation.querySelector('div[data-test-id="omni-header-via-label"]');

    var divider = document.createElement('div');
    divider.classList.add('Divider-sc-2k6bz0-9', 'fNgWaW');

    viaLabel.before(divider);
    divider.before(slaPolicyContainer);
  }
  else {
    slaPolicyContainer = <HTMLSpanElement> slaPolicy.parentElement;
  }

  var heatScoreElement = document.createElement('span');
  heatScoreElement.classList.add('lesa-ui-heat-score', 'lesa-ui-priority-major');
  heatScoreElement.setAttribute('title', 'Heat Score');
  heatScoreElement.textContent = heatScore;

  slaPolicyContainer.insertBefore(heatScoreElement, slaPolicy.nextSibling);
}

/**
 * Add a sort button.
 */

function addSortButton(
  conversation: HTMLDivElement,
  header: HTMLElement,
) : void {

  var button = document.createElement('button');
  button.setAttribute('data-test-id', 'comment-sort');

  var sort = getCookieValue('_lesa-ui-comment-sort') || 'asc';

  button.textContent = sort;

  var conversationLog = <HTMLDivElement> conversation.querySelector('div[data-test-id="omni-log-container"]');

  var buttons = <HTMLElement> header.children[1];

  button.onclick = function() {
    if (conversationLog.style.flexDirection == 'column') {
      conversationLog.style.flexDirection = 'column-reverse';
      button.textContent = 'desc';
      document.cookie = '_lesa-ui-comment-sort=desc';
    }
    else {
      conversationLog.style.flexDirection = 'column';
      button.textContent = 'asc';
      document.cookie = '_lesa-ui-comment-sort=asc';
    }
  };

  buttons.prepend(button);
}

/**
 * Replaces the input field for the 'subject' with something with line wrapping
 * so that we can see the entire subject (untruncated).
 */

function addSubjectTextWrap(
  header: HTMLElement,
  ticketId: string,
  ticketInfo: TicketMetadata
) : void {

  var oldSubjectField = <HTMLInputElement> header.querySelector('input[data-test-id=ticket-pane-subject]');

  if (!oldSubjectField) {
    return;
  }

  oldSubjectField.setAttribute('type', 'hidden');

  var newSubjectField = header.querySelector('.lesa-ui-subject');

  if (newSubjectField) {
    if (newSubjectField.getAttribute('data-ticket-id') == ticketId) {
      return;
    }

    var parentElement = <HTMLElement> newSubjectField.parentElement;
    parentElement.removeChild(newSubjectField);
  }

  newSubjectField = document.createElement('div');

  var oldClassList = Array.from(oldSubjectField.classList);

  for (var i = 0; i < oldClassList.length; i++) {
    newSubjectField.classList.add(oldClassList[i]);
  }

  newSubjectField.textContent = oldSubjectField.value;

  if (!oldSubjectField.readOnly) {
    newSubjectField.setAttribute('contenteditable', 'true');

    newSubjectField.addEventListener('blur', function() {
      oldSubjectField.value = this.textContent || '';

      var event = document.createEvent('HTMLEvents');
      event.initEvent('blur', false, true);
      oldSubjectField.dispatchEvent(event);
    });
  }

  newSubjectField.classList.add('lesa-ui-subject');
  newSubjectField.setAttribute('data-ticket-id', ticketId);

  var parentElement = <HTMLElement> oldSubjectField.parentElement;
  parentElement.insertBefore(newSubjectField, oldSubjectField);
}

/**
 * Generate a knowledge capture container.
 */

function createKnowledgeCaptureContainer(
  ticketId: string,
  ticketInfo: TicketMetadata,
  conversation: HTMLDivElement
) : HTMLDivElement | null {

  var fastTrackList = document.createElement('ul');

  if (ticketInfo.audits) {
    var knowledgeCaptureEvents = ticketInfo.audits.map(function(x) {
      return x.events.filter(function(x) {
        return x.type == 'KnowledgeCaptured';
      });
    }).reduce(function(array, x) {
      return array.concat(x);
    }, []);

    fastTrackList = knowledgeCaptureEvents.reduce(function(list, x) {
      var item = document.createElement('li');
      item.appendChild(createAnchorTag(x.body.article.title, x.body.article.html_url));
      list.appendChild(item);
      return list;
    }, fastTrackList);
  }

  var otherArticleList = document.createElement('ul');

  Array.from(conversation.querySelectorAll('a[href*="/hc/"]')).reduce(function(list, x) {
    var item = document.createElement('li');

    if (x.textContent != x.getAttribute('href')) {
      item.appendChild(document.createTextNode(x.textContent + ' - '));
    }

    var link = <HTMLAnchorElement> x.cloneNode(true);
    link.textContent = link.href;

    item.appendChild(link);

    list.appendChild(item);
    return list;
  }, otherArticleList);

  if ((otherArticleList.childNodes.length == 0) && (fastTrackList.childNodes.length == 0)) {
    return null;
  }

  var knowledgeCaptureContainer = document.createElement('div');
  knowledgeCaptureContainer.classList.add('lesa-ui-knowledge-capture');

  var fastTrackLabel = document.createElement('div');
  fastTrackLabel.classList.add('lesa-ui-knowledge-capture-label');
  fastTrackLabel.innerHTML = (fastTrackList.childNodes.length == 1) ? 'Fast Track Article:' : 'Fast Track Articles:';

  knowledgeCaptureContainer.appendChild(fastTrackLabel);

  if (fastTrackList.childNodes.length == 0) {
    var item = document.createElement('li');
    item.textContent = 'No matching articles.';
    fastTrackList.appendChild(item);
  }

  knowledgeCaptureContainer.appendChild(fastTrackList);

  if (otherArticleList.childNodes.length > 0) {
    var otherArticleLabel = document.createElement('div');
    otherArticleLabel.classList.add('lesa-ui-knowledge-capture-label');
    otherArticleLabel.innerHTML = (otherArticleList.childNodes.length == 1) ? 'Other Linked Article:' : 'Other Linked Articles:';

    knowledgeCaptureContainer.appendChild(otherArticleLabel);
    knowledgeCaptureContainer.appendChild(otherArticleList);
  }

  return knowledgeCaptureContainer;
}

/**
 * Sometimes CSEs post a dummy comment, which basically says "see comment above this one"
 * in order to preserve formatting when creating child tickets.
 */

function isDummyComment(
  ticketInfo: TicketMetadata,
  comment: Element
) : boolean {
  var childOf = getCustomFieldValue(ticketInfo, CUSTOM_FIELD_CHILD_OF);

  if (childOf == null || childOf.indexOf('child_of:') == -1) {
    return false;
  }

  var innerHTML = comment.innerHTML;

  if (innerHTML != comment.textContent) {
    return false;
  }

  if ((innerHTML.indexOf('(to maintain formatting)') != -1) ||
    (innerHTML.indexOf('(to retain formatting)') != -1) ||
    (innerHTML.indexOf('formatted comment'))) {

    return true;
  }

  return false;
}

/**
 * Returns the custom field value
 */
function getCustomFieldValue(ticketInfo: TicketMetadata, fieldId: number) {
  var matchingFields = ticketInfo.ticket.custom_fields.filter(function (it) { return it.id == fieldId; });
  return matchingFields.length == 0 ? null : matchingFields[0].value;
}

/**
 * Add a ticket description and a complete list of attachments to the top of the page.
 */

function addTicketDescription(
  ticketId: string,
  ticketInfo: TicketMetadata,
  conversation: HTMLDivElement
) : void {

  var header = <HTMLElement> conversation.childNodes[0];

  if (!header) {
    return;
  }

  // Check to see if we have any descriptions that we need to remove.

  var oldLinks = conversation.querySelectorAll('.lesa-ui-modal-header-link');

  if (oldLinks.length > 0) {
    return;
  }

  // Add a marker indicating the LESA priority based on critical workflow rules

  addHeatScoreMarker(header, conversation, ticketInfo);
  addPriorityMarker(header, conversation, ticketId, ticketInfo);
  addSubjectTextWrap(header, ticketId, ticketInfo);

  // Generate something to hold all of our attachments.

  addHeaderLinkModal('description-modal', 'Description', header, conversation, createDescriptionContainer.bind(null, ticketId, ticketInfo, conversation));
  addHeaderLinkModal('description-modal', 'Fast Track', header, conversation, checkEvents.bind(null, ticketId, createKnowledgeCaptureContainer.bind(null, ticketId, ticketInfo, conversation)));
  addHeaderLinkModal('attachments-modal', 'Attachments', header, conversation, createAttachmentsContainer.bind(null, ticketId, ticketInfo, conversation));
  addSortButton(conversation, header);
}

function createDescriptionContainer(
  ticketId: string,
  ticketInfo: TicketMetadata,
  conversation: HTMLDivElement
) : HTMLDivElement | null {

  var comments = conversation.querySelectorAll('article');

  if (comments.length == 0) {
    return null;
  }

  var descriptionContainer = document.createElement('div');

  descriptionContainer.classList.add('is-public');

  var tags = (ticketInfo && ticketInfo.ticket && ticketInfo.ticket.tags) || [];
  var tagSet = new Set(tags);

  if (tagSet.has('partner_first_line_support')) {
    var flsContainer = document.createElement('div');

    flsContainer.classList.add('event');

    var flsReminder = document.createElement('div');
    flsReminder.classList.add('comment');

    flsReminder.appendChild(document.createTextNode('REMINDER: '));
    flsReminder.appendChild(document.createTextNode('Additional description, error logs, etc. collected by the partner are available in '));
    flsReminder.appendChild(getJiraSearchLink('the linked FLS ticket', ticketId));
    flsReminder.appendChild(document.createTextNode('.'));

    flsContainer.appendChild(flsReminder);

    descriptionContainer.appendChild(flsContainer);
  }

  var firstComment = comments[0];

  if (isDummyComment(ticketInfo, firstComment)) {
    firstComment = comments[1];
  }

  var description = document.createElement('div');

  description.classList.add('comment');
  description.classList.add('zd-comment');
  description.innerHTML = firstComment.innerHTML;

  descriptionContainer.appendChild(description);

  return descriptionContainer;
}