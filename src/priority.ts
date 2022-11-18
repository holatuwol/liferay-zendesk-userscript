function addExtendedPremiumSupportMarker(
  priorityElement: HTMLElement,
  ticketId: string,
  tags: string[]
) : void {

  var href = 'https://liferay.atlassian.net/wiki/spaces/SUPPORT/pages/1998783040/EOSL+Guide+For+Support';

  for (var i = 0; i < tags.length; i++) {
    if (tags[i].indexOf('eps') == -1) {
      continue;
    }

    var premiumElement = document.createElement('span');
    premiumElement.classList.add('lesa-ui-priority-minor');

    var premiumLink = document.createElement('a');
    premiumLink.textContent = 'Extended Premium Support';
    premiumLink.href = href;
    premiumLink.target = '_blank';

    premiumElement.appendChild(premiumLink);
    priorityElement.appendChild(premiumElement);

    return;
  }

  var propertyBoxes = getPropertyBoxes();

  for (var i = 0; i < propertyBoxes.length; i++) {
    var version = getProductVersion(propertyBoxes[i]);

    if ((version == '6.x') || (version == '7.0') || (version == '7.1')) {
      var eoslElement = document.createElement('span');
      eoslElement.classList.add('lesa-ui-priority-major');

      var eoslLink = document.createElement('a');
      eoslLink.textContent = 'End of Software Life';
      eoslLink.href = href;
      eoslLink.target = '_blank';

      eoslElement.appendChild(eoslLink);
      priorityElement.appendChild(eoslElement);
      return;
    }
  }
}

function addCriticalMarker(
  priorityElement: HTMLElement,
  ticketInfo: TicketMetadata,
  tagSet: Set<string>
) : void {
  var subpriority = ticketInfo.ticket.priority || 'none';

  if ((subpriority != 'high') && (subpriority != 'urgent')) {
    return;
  }

  var criticalMarkers = ['production', 'production_completely_shutdown', 'production_severely_impacted_inoperable'].filter(Set.prototype.has.bind(tagSet));

  if (criticalMarkers.length >= 2) {
    var criticalElement = document.createElement('span');
    criticalElement.classList.add('lesa-ui-priority-critical');
    criticalElement.textContent = tagSet.has('platinum') ? 'platinum critical' : 'critical';
    priorityElement.appendChild(criticalElement);
  }
}

function addCustomerTypeMarker(
  priorityElement: HTMLElement,
  tagSet: Set<string>
) : void {

  if (tagSet.has('service_solution')) {
    var solutionElement = document.createElement('span');
    solutionElement.classList.add('lesa-ui-priority-minor');

    var solutionLink = document.createElement('a');
    solutionLink.textContent = 'Service Portal Customer';

    var query = 'tags:service_solution';
    solutionLink.href = 'https://' + document.location.host + '/agent/search/1?type=organization&q=' + encodeURIComponent(query);

    solutionElement.appendChild(solutionLink);
    priorityElement.appendChild(solutionElement);
  }

  if (tagSet.has('commerce_solution')) {
    var solutionElement = document.createElement('span');
    solutionElement.classList.add('lesa-ui-priority-minor');

    var solutionLink = document.createElement('a');
    solutionLink.textContent = 'Commerce Portal Customer';

    var query = 'tags:commerce_solution';
    solutionLink.href = 'https://' + document.location.host + '/agent/search/1?type=organization&q=' + encodeURIComponent(query);

    solutionElement.appendChild(solutionLink);
    priorityElement.appendChild(solutionElement);
  }
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

function addRegionMarker(
  priorityElement: HTMLElement,
  ticketInfo: TicketMetadata,
  ticketContainer: HTMLElement
) : void {

  if (ticketInfo.organizations.length == 0) {
    return;
  }

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

  var assigneeElement = <HTMLElement> ticketContainer.querySelector(isAgentWorkspace ? 'div[data-test-id="assignee-field-selected-agent-tag"] > span, div[data-test-id="assignee-field-selected-group-tag"]' : '.js-zero-state-ticket-tutorial-assignee-field > div > div');

  if (assigneeElement && (ticketInfo.ticket.status != 'closed')) {
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
 * Add a marker to show the LESA priority on the ticket.
 */

function addPriorityMarker(
  header: HTMLElement,
  conversation: HTMLDivElement,
  ticketId: string,
  ticketInfo: TicketMetadata
) : void {

  var ticketContainer = <HTMLElement> header.closest('.main_panes');

  var priorityElement = <HTMLElement | null> header.querySelector('.lesa-ui-priority');

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

  var tags = (ticketInfo && ticketInfo.ticket && ticketInfo.ticket.tags) || [];
  var tagSet = new Set(tags);

  addExtendedPremiumSupportMarker(priorityElement, ticketId, tags);
  addCriticalMarker(priorityElement, ticketInfo, tagSet);
  addCustomerTypeMarker(priorityElement, tagSet);
  addRegionMarker(priorityElement, ticketInfo, ticketContainer);

  var emojiContainer = getEmojiAnchorTags(tags);

  if (emojiContainer != null) {
    priorityElement.appendChild(emojiContainer);
  }

  if (isAgentWorkspace) {
    var viaLabel = <HTMLDivElement> conversation.querySelector('div[data-test-id="omni-header-via-label"]');

    var divider = document.createElement('div');
    divider.classList.add('Divider-sc-2k6bz0-9');

    if (priorityElement.childNodes.length > 0) {
      divider.classList.add('fNgWaW');
    }

    viaLabel.before(divider);
    divider.before(priorityElement);
  }
  else {
    header.insertBefore(priorityElement, header.querySelector('.round-avatar'));
  }
}