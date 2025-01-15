const today = new Date();

const limitedSupportDates = <Record<string, Date>> {
  '6.x': new Date('2017-12-01'),
  '7.0': new Date('2020-06-14'),
  '7.1': new Date('2022-11-13'),
  '7.2': new Date('2023-06-03'),
  '7.3': new Date('2024-10-12')
};

const endOfSoftwareLifeDates = <Record<string, Date>> {
  '6.x': new Date('2020-12-01'),
  '7.0': new Date('2023-06-14'),
  '7.1': new Date('2025-11-13'),
  '7.2': new Date('2026-06-03'),
  '7.3': new Date('2027-10-12')
};

function addServiceLifeMarker(
  priorityElement: HTMLElement,
  ticketId: string,
  ticketTags: string[],
  organizationTagSet: Set<string>
) : void {

  var versions = getProductVersions(ticketTags);

  if (versions.length == 0) {
    return;
  }

  var version = versions[0];

  if (!endOfSoftwareLifeDates[version] || !limitedSupportDates[version]) {
    return;
  }

  var limitedSupport = (today > limitedSupportDates[version]);
  var endOfSoftwareLife = (today > endOfSoftwareLifeDates[version]);

  var declinedVersions = [];

  if ((versions.indexOf('7.3') != -1) &&
    (organizationTagSet.has('neg_7_3_eps'))) {

    declinedVersions.push('7.3');
  }

  if ((versions.indexOf('7.2') != -1) &&
    (organizationTagSet.has('neg_7_2_eps'))) {

    declinedVersions.push('7.2');
  }

  if ((versions.indexOf('7.1') != -1) &&
    (organizationTagSet.has('neg_7_1_eps'))) {

    declinedVersions.push('7.1');
  }

  if ((versions.indexOf('7.0') != -1) &&
    (organizationTagSet.has('neg_7_0_eps'))) {

    declinedVersions.push('7.0');
  }

  var extendedPremiumSupport = null;

  if (declinedVersions.length == 0) {
    for (var i = 0; i < ticketTags.length; i++) {
      if ((ticketTags[i].indexOf('eps') != -1)) {
        extendedPremiumSupport = 'Extended Premium Support';
        break;
      }
    }
  }
  else {
    extendedPremiumSupport = 'Declined ' + declinedVersions[0] + ' EPS';
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
  ticketTagSet: Set<string>
) : string | null {

  var subpriority = ticketInfo.ticket.priority || 'none';

  if ((subpriority != 'high') && (subpriority != 'urgent')) {
    return null;
  }

  if (ticketTagSet.has('premium')) {
    return 'premium critical';
  }

  var criticalMarkers = ['production', 'production_completely_shutdown', 'production_severely_impacted_inoperable'].filter(Set.prototype.has.bind(ticketTagSet));

  if (criticalMarkers.length >= 2) {
    if (ticketTagSet.has('platinum')) {
      return 'platinum critical'
    }

    return 'critical';
  }

  return subpriority;
}

function addCriticalMarker(
  priorityElement: HTMLElement,
  ticketInfo: TicketMetadata,
  ticketTagSet: Set<string>
) : void {

  var markerText = getCriticalMarkerText(ticketInfo, ticketTagSet);

  if (markerText == null) {
    return;
  }

  var criticalElement = document.createElement('span');
  criticalElement.classList.add('lesa-ui-priority-critical');
  criticalElement.textContent = markerText;
  priorityElement.appendChild(criticalElement);
}

function addOrganizationTagSearchHeader(
  priorityElement: HTMLElement,
  organizationTagSet: Set<string>,
  tag: string | null,
  text: string,
  cssClass: string
) : void {

  if ((tag != null) && !organizationTagSet.has(tag)) {
    return;
  }

  var element = document.createElement('span');
  element.classList.add('lesa-ui-' + cssClass);

  if (tag == null) {
    element.appendChild(document.createTextNode(text));
  }
  else {
    var query = 'tags:' + tag;

    var link = document.createElement('a');
    link.textContent = text;
    link.href = 'https://' + document.location.host + '/agent/search/1?type=organization&q=' + encodeURIComponent(query);
    link.setAttribute('title', query);

    element.appendChild(link);
  }

  priorityElement.appendChild(element);
}

function addCustomerTypeMarker(
  priorityElement: HTMLElement,
  organizationTagSet: Set<string>
) : void {

  addOrganizationTagSearchHeader(priorityElement, organizationTagSet, 'tam_services', 'TAM Services', 'priority-critical');
  if (!organizationTagSet.has('tam_services')) {
    addOrganizationTagSearchHeader(priorityElement, organizationTagSet, 'premium_service', 'Trial TAM Services', 'priority-critical');
  }

  addOrganizationTagSearchHeader(priorityElement, organizationTagSet, 'gs_opportunity', 'GS Opportunity', 'priority-minor');
  addOrganizationTagSearchHeader(priorityElement, organizationTagSet, 'service_solution', 'Service Portal Customer', 'priority-minor');
  addOrganizationTagSearchHeader(priorityElement, organizationTagSet, 'commerce_solution', 'Commerce Portal Customer', 'priority-minor');
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

function addOfferingMarker(
  priorityElement: HTMLElement,
  ticketInfo: TicketMetadata,
  ticketTags: string[],
  organizationTagSet: Set<string>
) : void {

  var offeringText = 'Self-Hosted';
  var offeringTag = null;

  for (var i = 0; i < ticketTags.length; i++) {
    if (ticketTags[i].indexOf('lxc') != -1) {
      offeringText = 'SaaS';
      offeringTag = ticketTags[i];
      break;
    }
  }

  if (offeringText == 'SaaS') {
    for (var i = 0; i < ticketTags.length; i++) {
      if (ticketTags[i].indexOf('lxc_sm') != -1) {
        offeringText = 'PaaS';
        offeringTag = ticketTags[i];
        break;
      }
    }
  }

  addOrganizationTagSearchHeader(priorityElement, organizationTagSet, offeringTag, offeringText, 'offering');
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

  var subpriority = ticketInfo.ticket.priority || 'none';

  var customerRegionElement = document.createElement('span');
  customerRegionElement.classList.add('lesa-ui-priority-major');

  var customerRegionLink = document.createElement('a');
  customerRegionLink.textContent = 'customer region: ' + customerRegion;

  var query = 'support_region:' + customerRegion;
  customerRegionLink.setAttribute('title', query);
  customerRegionLink.href = 'https://' + document.location.host + '/agent/search/1?type=organization&q=' + encodeURIComponent(query);

  customerRegionElement.appendChild(customerRegionLink);
  priorityElement.appendChild(customerRegionElement);
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

  var organizationTagSet = new Set((ticketInfo && ticketInfo.organizations) ? ticketInfo.organizations.map(it => it.tags || []).reduce((acc, it) => acc.concat(it), []) : []);

  addOfferingMarker(priorityElement, ticketInfo, ticketTags, organizationTagSet);
  addRegionMarker(priorityElement, ticketInfo, ticketContainer);
  addServiceLifeMarker(priorityElement, ticketId, ticketTags, organizationTagSet);
  addCriticalMarker(priorityElement, ticketInfo, ticketTagSet);
  addCustomerTypeMarker(priorityElement, organizationTagSet);

  var emojiContainer = getEmojiAnchorTags(ticketTags);

  if (emojiContainer != null) {
    priorityElement.appendChild(emojiContainer);
  }

  var viaLabel = <HTMLDivElement> conversation.querySelector('div[data-test-id="omni-header-via-label"]');

  var divider = document.createElement('div');
  divider.classList.add('Divider-sc-2k6bz0-9');

  if (priorityElement.childNodes.length > 0) {
    divider.classList.add('fNgWaW');
  }

  viaLabel.before(divider);
  divider.before(priorityElement);
}