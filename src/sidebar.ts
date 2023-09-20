/**
 * Generate a single dummy field to add to the sidebar.
 */

function generateFormField(
  propertyBox: HTMLElement,
  className: string,
  labelText: string,
  formElements: Array<Node>
) : void {

  var formField = document.createElement('div');
  formField.classList.add('ember-view');
  formField.classList.add('form_field');
  formField.classList.add('lesa-ui-form-field');
  formField.classList.add(className);

  var label = document.createElement('label');
  label.innerHTML = labelText;

  formField.appendChild(label);

  for (var i = 0; i < formElements.length; i++) {
    formField.appendChild(formElements[i]);
  }

  var oldFormFields = propertyBox.querySelectorAll('.' + className);

  for (var i = 0; i < oldFormFields.length; i++) {
    propertyBox.removeChild(oldFormFields[i]);
  }

  propertyBox.appendChild(formField);
}
/**
 * Add the Organization field to the sidebar, which will contain a link to Help Center
 * for the account details and the customer's SLA level.
 */

function addOrganizationField(
  propertyBox: HTMLElement,
  ticketId: string,
  ticketInfo: TicketMetadata
) : void {

  var accountCode = getAccountCode(ticketId, ticketInfo, propertyBox);

  var tags = (ticketInfo && ticketInfo.ticket && ticketInfo.ticket.tags) || [];
  var tagSet = new Set(tags);

  var helpCenterLinkHREF = null;
  var serviceLevel = <string[]> [];

  if (tagSet.has('t1')) {
    serviceLevel.push('Account Tier 1');
  }
  else if (tagSet.has('t2')) {
    serviceLevel.push('Account Tier 2');
  }
  else if (tagSet.has('t3')) {
    serviceLevel.push('Account Tier 3');
  }
  else if (tagSet.has('t4')) {
    serviceLevel.push('Account Tier 4');
  }

  var organizationInfo = null;

  if (accountCode) {
    organizationInfo = organizationCache[accountCode];
  }

  if (organizationInfo && organizationInfo.notes) {
    var notesContainer = document.createElement('div');
    notesContainer.textContent = organizationInfo.notes;
    notesContainer.innerHTML = notesContainer.innerHTML.replace(/(https:\/\/liferay-support.zendesk.com\/agent\/tickets\/([0-9]+))/g, '<a href="$1">#$2</a>')
    generateFormField(propertyBox, 'lesa-ui-orgnotes', 'Notes', [notesContainer]);
  }

  if (organizationInfo) {
    var organizationFields = organizationInfo.organization_fields;
    serviceLevel.push(organizationFields.sla.toUpperCase());

    helpCenterLinkHREF = "https://support.liferay.com/project/#/" +
       organizationInfo.organization_fields.account_key;
  }

  var helpCenterItems = [];

  if (accountCode && helpCenterLinkHREF) {
    var helpCenterLinkContainer = document.createElement('div');

    var helpCenterLink = createAnchorTag(accountCode, helpCenterLinkHREF);
    helpCenterLinkContainer.appendChild(helpCenterLink);

    helpCenterItems.push(helpCenterLinkContainer);
  }

  if (serviceLevel.length > 0) {
    var serviceLevelContainer = document.createElement('div');

    serviceLevelContainer.appendChild(document.createTextNode(serviceLevel.join(', ')));

    helpCenterItems.push(serviceLevelContainer);
  }

  var permalinkHREF = 'https://help.liferay.com/hc/requests/' + ticketInfo.ticket.id;
  helpCenterItems.push(createPermaLinkInputField(permalinkHREF))

  generateFormField(propertyBox, 'lesa-ui-helpcenter', 'Help Center', helpCenterItems);
}

/**
 * Generate a URL to Patcher Portal's accounts view.
 */

function getPatcherPortalAccountsHREF(
  path: string,
  params: {[s: string] : string}
) : string {

  var portletId = '1_WAR_osbpatcherportlet';
  var ns = '_' + portletId + '_';

  var queryString = Object.keys(params).map(function(key) { return (key.indexOf('p_p_') == 0 ? key : (ns + key)) + '=' + encodeURIComponent(params[key]) }).join('&');
  return 'https://patcher.liferay.com/group/guest/patching/-/osb_patcher/accounts' + path + '?p_p_id=' + portletId + '&' + queryString;
}

/**
 * Retrieve the Liferay version from the tags.
 */

function getProductVersion(tags: string[]) : string {
  for (var i = 0; i < tags.length; i++) {
    var tag = tags[i];

    var x = tag.indexOf('7_');

    if (x == 0) {
      return '7.' + tag.charAt(2);
    }

    x = tag.indexOf('_7_');

    if (x != -1) {
      return '7.' + tag.charAt(x + 3);
    }

    x = tag.indexOf('6_');
    if (x == 0) {
      return '6.x';
    }

    x = tag.indexOf('_6_');
    if (x != -1) {
      return '6.x';
    }
  }

  return '';
}

/**
 * Convert the Liferay version into the Patcher Portal product version.
 */

function getProductVersionId(
  version: string
) : string {

  if (version == '7.4') {
    return '206111201';
  }

  if (version == '7.3') {
    return '175004848';
  }

  if (version == '7.2') {
    return '130051253';
  }

  if (version == '7.1') {
    return '102311424';
  }

  if (version == '7.0') {
    return '101625504';
  }

  if (version == '6.x') {
    return '101625503';
  }

  return '';
}

/**
 * Add the Patcher Portal field to the sidebar, which will contain two links to
 * the customer's builds in Patcher Portal.
 */

function addPatcherPortalField(
  propertyBox: HTMLElement,
  ticketId: string,
  ticketInfo: TicketMetadata
) : void {

  var accountCode = getAccountCode(ticketId, ticketInfo, propertyBox);

  var patcherPortalItems = <Array<Node>> [];

  if (accountCode) {
    var allBuildsLinkHREF = getPatcherPortalAccountsHREF('', {
      'accountEntryCode': accountCode
    });

    patcherPortalItems.push(createAnchorTag('All Builds', allBuildsLinkHREF));

    var version = getProductVersion(ticketInfo.ticket && ticketInfo.ticket.tags ? ticketInfo.ticket.tags : []);

    if (version) {
      var versionBuildsLinkHREF = getPatcherPortalAccountsHREF('/view', {
        'patcherBuildAccountEntryCode': accountCode,
        'patcherProductVersionId': getProductVersionId(version)
      });

      patcherPortalItems.push(createAnchorTag(version + ' Builds', versionBuildsLinkHREF));
    }
  }
  else {
    patcherPortalItems.push(document.createTextNode('N/A'));
  }

  generateFormField(propertyBox, 'lesa-ui-patcher', 'Patcher Portal', patcherPortalItems);
}

/**
 * Add the Linked JIRA Issues field to the sidebar, which will contain a link to
 * the relevant JIRA tickets.
 */

function addJIRASearchField(
  propertyBox: HTMLElement,
  ticketId: string
) : void {

  var jiraSearchLinkContainer = document.createElement('div');

  jiraSearchLinkContainer.appendChild(getJiraSearchLink('Linked Issues', ticketId));

  var jiraSearchItems = [jiraSearchLinkContainer];

  generateFormField(propertyBox, 'lesa-ui-jirasearch', 'JIRA Search', jiraSearchItems);
}

function hideSidebarSelectOption(
  parentElement: HTMLElement,
  hiddenMenuItemTexts: Set<string>
) : void {

  var menu = <HTMLUListElement> parentElement.querySelector('ul[data-garden-id="dropdowns.menu"]');

  if (menu == null) {
    setTimeout(hideSidebarSelectOption.bind(null, parentElement, hiddenMenuItemTexts), 500);
    return;
  }

  var menuItems = <HTMLLIElement[]> Array.from(menu.querySelectorAll('li'));
  var menuItemCount = menuItems.length;

  for (var i = 0; i < menuItems.length; i++) {
    var menuItemText = (menuItems[i].textContent || '').trim();

    if (hiddenMenuItemTexts.has(menuItemText)) {
      menuItems[i].style.display = 'none';
      --menuItemCount;
    }
  }

  var menuParentElement = <HTMLDivElement>menu.parentElement;
  var spacerElement = <HTMLDivElement>menuParentElement.querySelector('div');

  spacerElement.style.height = (menuItemCount * 36) + 'px';
}

/**
 * Hide certain select options that we don't want users to select.
 */
function hideSidebarSelectOptions(
  propertyBox: HTMLElement,
  ticketId: string,
  ticketInfo: TicketMetadata
) : void {

  var workspaceElement = <HTMLElement> propertyBox.closest('.workspace');
  var longTermResolutionButton = <HTMLElement | null> workspaceElement.querySelector('.custom_field_360013378112');

  if (longTermResolutionButton) {
    longTermResolutionButton.onclick = hideSidebarSelectOption.bind(
      null, longTermResolutionButton, new Set(['Partner Audit'])
    );
  }
}

/**
 * Make tags in the sidebar clickable, so we can easily find tickets
 * with similar tags. Also, highlight certain important tags.
 */

var importantTags = new Set([
  'fcr_eligible'
]);

function checkSidebarTags() {
  var spans = <Array<HTMLAnchorElement>> Array.from(document.querySelectorAll('.tags span'));

  for (var i = 0; i < spans.length; i++) {
    var span = spans[i];

    if (span.querySelector('a') || !span.textContent) {
      continue;
    }

    if (importantTags.has(span.textContent)) {
      span.classList.add('important-tag');
    }

    var href = 'https://' + document.location.host + '/agent/search/1?q=' + encodeURIComponent('tags:' + span.textContent);

    span.innerHTML = '<a href="' + href + '" title="tags:' + span.textContent.replace(/"/, '&quot;') + '" target="_blank">' + span.textContent + '</a>';
  }
}

function getPropertyBoxes(
  ticketId?: string
) : HTMLElement[] {

  var propertyBoxes = <HTMLElement[]> Array.from(document.querySelectorAll('.property_box'));

  var visiblePropertyBoxes = propertyBoxes.filter(it => {
    var workspaceElement = <HTMLElement | null> it.closest('.workspace');

    return workspaceElement && workspaceElement.style.display != 'none';
  });

  if (ticketId) {
    return visiblePropertyBoxes.filter(it => it.getAttribute('data-ticket-id') != ticketId);
  }

  return visiblePropertyBoxes;
}

/**
 * Update the sidebar with any ticket details we can pull from the ZenDesk API.
 */

function updateSidebarBoxContainer(
  ticketId: string,
  ticketInfo: TicketMetadata
) : void {

  var propertyBoxes = getPropertyBoxes(ticketId);

  if (propertyBoxes.length == 0) {
    return;
  }

  for (var i = 0; i < propertyBoxes.length; i++) {
    addOrganizationField(propertyBoxes[i], ticketId, ticketInfo);
    addJIRASearchField(propertyBoxes[i], ticketId);
    addPatcherPortalField(propertyBoxes[i], ticketId, ticketInfo);
    hideSidebarSelectOptions(propertyBoxes[i], ticketId, ticketInfo);
    propertyBoxes[i].setAttribute('data-ticket-id', ticketId);
  }
}