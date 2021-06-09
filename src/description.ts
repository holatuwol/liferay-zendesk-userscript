/**
 * Generates a text string representing the emojis corresponding to the provided list of tags.
 */

const emojiMap: {[s: string]: string} = {
  'cas_fire': '⚠️',
  'cas_hot': '⚠️',
  'cas_priority': '⚠️'
};

const isEmoji = Set.prototype.has.bind(new Set(Object.keys(emojiMap)));

function getEmojiText(tags: Array<string>) : string {
  return tags.filter(isEmoji).map(function(x) { return emojiMap[x] }).join('');
}

/**
 * Generates an emoji for the given tag.
 */

function getEmojiAnchorTag(tag: string) : HTMLAnchorElement {
  var anchor = document.createElement('a');
  anchor.title = 'tags:' + tag;
  anchor.textContent = emojiMap[tag];
  anchor.href = 'https://' + document.location.host + '/agent/search/1?q=' + encodeURIComponent('tags:' + tag);
  return anchor;
}

/**
 * Converts a list of tags into a span holding a bunch of
 * emojis with 'title' attributes.
 */

function getEmojiAnchorTags(tags: Array<string>) : HTMLSpanElement | null {
  var matchingTags = tags.filter(isEmoji);

  if (matchingTags.length == 0) {
    return null;
  }

  var emojiContainer = document.createElement('span');
  emojiContainer.classList.add('lesa-ui-subject-emojis');

  var emojis = matchingTags.map(getEmojiAnchorTag);

  for (var i = 0; i < emojis.length; i++) {
    emojiContainer.appendChild(emojis[i]);
  }

  return emojiContainer;
}

/**
 * Checks whether the assignee text corresponds to the specified support region.
 */

function isSupportRegion(
	assigneeText: string,
	regionText: string
) : boolean {

	if (assigneeText.indexOf('- ' + regionText) != -1) {
		return true;
	}

	if (assigneeText.indexOf('/' + regionText + '/') != -1) {
		return true;
	}

	return false;
}

/**
 * Retrieves the support region
 */

function getSupportRegions(
  assigneeText: string
) : Set<string> {

  var supportRegions = [];

  if (isSupportRegion(assigneeText, 'AU')) {
    supportRegions.push('Australia');
  }

  if (isSupportRegion(assigneeText, 'BR')) {
    supportRegions.push('Brazil');
  }

  if (isSupportRegion(assigneeText, 'CN')) {
    supportRegions.push('China');
  }

  if (isSupportRegion(assigneeText, 'HU')) {
    supportRegions.push("Hungary");
  }

  if (isSupportRegion(assigneeText, 'IN')) {
    supportRegions.push('India');
  }

  if (isSupportRegion(assigneeText, 'JP')) {
    supportRegions.push('Japan');
  }

  if ((assigneeText.indexOf('Spain Pod') == 0) || (isSupportRegion(assigneeText, 'ES'))) {
    supportRegions.push('Spain');
  }

  if (isSupportRegion(assigneeText, 'US')) {
    supportRegions.push('US');
  }

  return new Set(supportRegions.map(x => x.toLowerCase()));
}

const middleEastCountries = new Set([
  'Saudi Arabia', 'United Arab Emirates', 'Qatar', 'Kuwait', 'Bahrein', 'Oman', 'Jordan', 'Iraq', 'Lebanon'
]);

/**
 * Add a marker to show the LESA priority on the ticket.
 */

function addPriorityMarker(
  header: HTMLElement,
  conversation: HTMLDivElement,
  ticketId: string,
  ticketInfo: TicketMetadata
) : void {

  var ticketContainer = <HTMLElement> header.closest('.main_panes');
  var assigneeElement = <HTMLElement> ticketContainer.querySelector('.js-zero-state-ticket-tutorial-assignee-field > div');

  if (!assigneeElement) {
    return;
  }

  var priorityElement = header.querySelector('.lesa-ui-priority');

  if (priorityElement) {
    if (priorityElement.getAttribute('data-ticket-id') == ticketId) {
      return;
    }

    var parentElement = <HTMLElement> priorityElement.parentElement;
    parentElement.removeChild(priorityElement);
  }

  priorityElement = document.createElement('div');
  priorityElement.classList.add('lesa-ui-priority');
  priorityElement.setAttribute('data-ticket-id', ticketId);

  // Check to see if the ticket matches the rules for a regular
  // high priority ticket (production, severely impacted or worse)

  var subpriority = ticketInfo.ticket.priority || 'none';

  var tags = (ticketInfo && ticketInfo.ticket && ticketInfo.ticket.tags) || [];
  var tagSet = new Set(tags);

  if ((subpriority == 'high') || (subpriority == 'urgent')) {
    var criticalMarkers = ['production', 'production_completely_shutdown', 'production_severely_impacted_inoperable'].filter(Set.prototype.has.bind(tagSet));

    if (criticalMarkers.length >= 2) {
      var criticalElement = document.createElement('span');
      criticalElement.classList.add('lesa-ui-priority-critical');
      criticalElement.textContent = tagSet.has('platinum') ? 'platinum critical' : 'critical';
      priorityElement.appendChild(criticalElement);
    }
  }

  if (ticketInfo.organizations.length > 0) {
    var organizationFields = ticketInfo.organizations[0].organization_fields;

    if (middleEastCountries.has(organizationFields.country)) {
      var customerCountryElement = document.createElement('span');
      customerCountryElement.classList.add('lesa-ui-priority-minor');

      var customerCountryLink = document.createElement('a');
      customerCountryLink.textContent = 'country: middle east';

      var query = Array.from(middleEastCountries).map((x) => 'country:"' + x + '"').join(' ');
      customerCountryLink.href = 'https://' + document.location.host + '/agent/search/1?type=organization&q=' + encodeURIComponent(query);

      customerCountryElement.appendChild(customerCountryLink);
      priorityElement.appendChild(customerCountryElement);
    }

    if (ticketInfo.ticket.status != 'closed') {
      var customerRegion = organizationFields.support_region;
      var assigneeText = (assigneeElement.textContent || '').trim();
      var assigneeRegions = getSupportRegions(assigneeText);

      if (!assigneeRegions.has(customerRegion)) {
        var customerRegionElement = document.createElement('span');
        customerRegionElement.classList.add('lesa-ui-priority-major');

        var customerRegionLink = document.createElement('a');
        customerRegionLink.textContent = 'customer region: ' + customerRegion;

        var query = 'support_region:' + customerRegion;
        customerRegionLink.href = 'https://' + document.location.host + '/agent/search/1?type=organization&q=' + encodeURIComponent(query);

        customerRegionElement.appendChild(customerRegionLink);
        priorityElement.appendChild(customerRegionElement);
     }
   }
  }

  var emojiContainer = getEmojiAnchorTags(tags);

  if (emojiContainer != null) {
    priorityElement.appendChild(emojiContainer);
  }

  header.insertBefore(priorityElement, header.querySelector('.round-avatar'));
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

  if (!ticketInfo.audits) {
    return null;
  }

  var knowledgeCaptureEvents = ticketInfo.audits.map(function(x) {
    return x.events.filter(function(x) {
      return x.type == 'KnowledgeCaptured';
    });
  }).reduce(function(array, x) {
    return array.concat(x);
  }, []);

  if (knowledgeCaptureEvents.length == 0) {
    return null;
  }

  var knowledgeCaptureList = knowledgeCaptureEvents.reduce(function(list, x) {
    var item = document.createElement('li');
    item.appendChild(createAnchorTag(x.body.article.title, x.body.article.html_url));
    list.appendChild(item);
    return list;
  }, document.createElement('ul'));

  var knowledgeCaptureContainer = document.createElement('div');
  knowledgeCaptureContainer.classList.add('lesa-ui-knowledge-capture');

  var knowledgeCaptureLabel = document.createElement('div');
  knowledgeCaptureLabel.classList.add('lesa-ui-knowledge-capture-label');
  knowledgeCaptureLabel.innerHTML = (knowledgeCaptureEvents.length == 1) ? 'Fast Track Article:' : 'Fast Track Articles:';

  knowledgeCaptureContainer.appendChild(knowledgeCaptureLabel);
  knowledgeCaptureContainer.appendChild(knowledgeCaptureList);

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

  var isChildTicket = false;
  var customFields = ticketInfo.ticket.custom_fields;

  for (var i = 0; i < customFields.length; i++) {
    var customField = customFields[i];

    if (customField.id != 360013377052) {
      continue;
    }

    if (customField.value && (customField.value.indexOf('child_of:') != -1)) {
      isChildTicket = true;
    }
  }

  if (!isChildTicket) {
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
 * Add a ticket description and a complete list of attachments to the top of the page.
 */

function addTicketDescription(
  ticketId: string,
  ticketInfo: TicketMetadata,
  conversation: HTMLDivElement
) : void {

  var header = <HTMLElement | null> conversation.querySelector('.pane_header');

  if (!header) {
    return;
  }

  // Add a marker indicating the LESA priority based on critical workflow rules

  addPriorityMarker(header, conversation, ticketId, ticketInfo);
  addSubjectTextWrap(header, ticketId, ticketInfo);

  // Check to see if we have any descriptions that we need to remove.

  var oldDescriptions = conversation.querySelectorAll('.lesa-ui-description');

  var hasNewDescription = false;

  for (var i = 0; i < oldDescriptions.length; i++) {
    if (oldDescriptions[i].getAttribute('data-ticket-id') == ticketId) {
      hasNewDescription = true;
    }
    else {
      revokeObjectURLs();
      header.removeChild(oldDescriptions[i]);
    }
  }

  if (hasNewDescription) {
    return;
  }

  // Since comments are listed in reverse order, the last comment is the first
  // comment (from a time perspective), and can be used as a description.

  var comments = conversation.querySelectorAll('.event .zd-comment');

  if (comments.length == 0) {
    return;
  }

  var lastComment = comments[comments.length - 1];

  if (isDummyComment(ticketInfo, lastComment)) {
    lastComment = comments[comments.length - 2];
  }

  var description = document.createElement('div');

  description.classList.add('comment');
  description.classList.add('zd-comment');
  description.innerHTML = lastComment.innerHTML;

  // Create the element class hierarchy so that the text in the comment renders correctly.

  var descriptionAncestor0 = document.createElement('div');
  descriptionAncestor0.classList.add('event');
  descriptionAncestor0.classList.add('is-public');

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

    descriptionAncestor0.appendChild(flsContainer);
  }

  descriptionAncestor0.appendChild(description);

  var descriptionAncestor1 = document.createElement('div');
  descriptionAncestor1.classList.add('lesa-ui-description');
  descriptionAncestor1.classList.add('rich_text');
  descriptionAncestor1.setAttribute('data-ticket-id', ticketId);

  descriptionAncestor1.appendChild(descriptionAncestor0);

  // Generate something to hold all of our attachments.

  var knowledgeCaptureContainer = createKnowledgeCaptureContainer(ticketId, ticketInfo, conversation);

  if (knowledgeCaptureContainer) {
    descriptionAncestor1.appendChild(knowledgeCaptureContainer);
  }

  var attachmentsContainer = createAttachmentsContainer(ticketId, ticketInfo, conversation);

  if (attachmentsContainer) {
    descriptionAncestor1.appendChild(attachmentsContainer);
  }

  header.appendChild(descriptionAncestor1);
}