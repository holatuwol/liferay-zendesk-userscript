function addServiceLifeMarker(
  priorityElement: HTMLElement,
  ticketId: string,
  ticketTags: string[],
  organizationTags: string[]
) : void {

  var limitedSupport = false;
  var endOfSoftwareLife = false;
  var extendedPremiumSupport = null;

  var version = getProductVersion(ticketTags);

  for (var i = 0; i < organizationTags.length; i++) {
    var tag = organizationTags[i];

    if ((tag == 'neg_7_0_eps') && (version == '7.0')) {
      extendedPremiumSupport = 'Declined 7.0 EPS';
    }
    else if ((tag == 'neg_7_1_eps') && (version == '7.1')) {
      extendedPremiumSupport = 'Declined 7.1 EPS';
    }
    else if ((tag == 'neg_7_2_eps') && (version == '7.2')) {
      extendedPremiumSupport = 'Declined 7.2 EPS';
    }
  }

  if (extendedPremiumSupport == null) {
    for (var i = 0; i < ticketTags.length; i++) {
      if ((ticketTags[i].indexOf('eps') != -1)) {
        extendedPremiumSupport = 'Extended Premium Support';
        break;
      }
    }
  }


  if ((version == '6.x') || (version == '7.0') || (version == '7.1')) {
    limitedSupport = true;
    endOfSoftwareLife = true;
  }

  var serviceLifeLink = null;
  var href = 'https://liferay.atlassian.net/wiki/spaces/SUPPORT/pages/1998783040/EOSL+Guide+For+Support';

  if (extendedPremiumSupport != null) {
    serviceLifeLink = createAnchorTag(extendedPremiumSupport, href);
  }
  else if (endOfSoftwareLife) {
    serviceLifeLink = createAnchorTag('End of Software Life', href);
  }
  else if (limitedSupport) {
    serviceLifeLink = createAnchorTag('Limited Support', href);
  }

  if (serviceLifeLink) {
    var serviceLifeElement = document.createElement('span');
    serviceLifeElement.classList.add('lesa-ui-priority-minor');

    serviceLifeElement.appendChild(serviceLifeLink);
    priorityElement.appendChild(serviceLifeElement);
  }
}

function getCriticalMarkerText(
  ticketInfo: TicketMetadata,
  tagSet: Set<string>
) : string | null {

  var subpriority = ticketInfo.ticket.priority || 'none';

  if ((subpriority != 'high') && (subpriority != 'urgent')) {
    return null;
  }

  if (tagSet.has('premium')) {
    return 'premium critical';
  }

  var criticalMarkers = ['production', 'production_completely_shutdown', 'production_severely_impacted_inoperable'].filter(Set.prototype.has.bind(tagSet));

  if (criticalMarkers.length >= 2) {
    if (tagSet.has('platinum')) {
      return 'platinum critical'
    }

    return 'critical';
  }

  return null;
}

function addCriticalMarker(
  priorityElement: HTMLElement,
  ticketInfo: TicketMetadata,
  tagSet: Set<string>
) : void {

  var markerText = getCriticalMarkerText(ticketInfo, tagSet);

  if (markerText == null) {
    return;
  }

  var criticalElement = document.createElement('span');
  criticalElement.classList.add('lesa-ui-priority-critical');
  criticalElement.textContent = markerText;
  priorityElement.appendChild(criticalElement);
}

function addCustomerTypeMarkerHelper(
  priorityElement: HTMLElement,
  tagSet: Set<string>,
  tag: string,
  text: string
) : void {

  if (!tagSet.has(tag)) {
    return;
  }

  var element = document.createElement('span');
  element.classList.add('lesa-ui-priority-minor');

  var query = 'tags:' + tag;

  var link = document.createElement('a');
  link.textContent = text;
  link.href = 'https://' + document.location.host + '/agent/search/1?type=organization&q=' + encodeURIComponent(query);

  element.appendChild(link);
  priorityElement.appendChild(element);
}

function addCustomerTypeMarker(
  priorityElement: HTMLElement,
  tagSet: Set<string>
) : void {

  addCustomerTypeMarkerHelper(priorityElement, tagSet, 'gs_opportunity', 'GS Opportunity');
  addCustomerTypeMarkerHelper(priorityElement, tagSet, 'service_solution', 'Service Portal Customer');
  addCustomerTypeMarkerHelper(priorityElement, tagSet, 'commerce_solution', 'Commerce Portal Customer');
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

  if ((assigneeText.indexOf('Spain Pod') == 0) || (isSupportRegion(assigneeText, 'ES') && !isSupportRegion(assigneeText, 'BR'))) {
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

  var assigneeElement = <HTMLElement> ticketContainer.querySelector('.js-zero-state-ticket-tutorial-assignee-field > div > div');

  if (ticketInfo.ticket.status == 'closed') {
    return;
  }

  var customerRegion = organizationFields.support_region;
  var assigneeText = ((assigneeElement && assigneeElement.textContent) || '').trim();
  var assigneeRegions = getSupportRegions(assigneeText);

  var subpriority = ticketInfo.ticket.priority || 'none';

  if ((subpriority == 'high') || (subpriority == 'urgent') || !assigneeRegions.has(customerRegion)) {
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

  var ticketTags = (ticketInfo && ticketInfo.ticket && ticketInfo.ticket.tags) || [];
  var ticketTagSet = new Set(ticketTags);

  var organizationTags = (ticketInfo && ticketInfo.organizations) ? ticketInfo.organizations.map(it => it.tags || []).reduce((acc, it) => acc.concat(it)) : [];
  organizationTags = Array.from(new Set(organizationTags));

  addRegionMarker(priorityElement, ticketInfo, ticketContainer);
  addServiceLifeMarker(priorityElement, ticketId, ticketTags, organizationTags);
  addCriticalMarker(priorityElement, ticketInfo, ticketTagSet);
  addCustomerTypeMarker(priorityElement, ticketTagSet);

  var emojiContainer = getEmojiAnchorTags(ticketTags);

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