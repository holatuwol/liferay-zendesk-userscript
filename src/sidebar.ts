/**
 * Generate a single dummy field to add to the sidebar.
 */

function generateFormField(
  propertyBox: HTMLElement,
  className: string,
  labelText: string,
  formElements: Array<Node>
) : void {

  var oldFormFields = propertyBox.querySelectorAll('.' + className);

  for (var i = 0; i < oldFormFields.length; i++) {
    propertyBox.removeChild(oldFormFields[i]);
  }

  if (formElements.length == 0) {
    return;
  }

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

  propertyBox.appendChild(formField);
}

/**
 * Utility method to replace ticket URLs on any nested HTML. The first matching
 * group is the text we use for the link. The function will attempt to decode
 * the text, as if it were a URI component, and fall back to the text itself.
 */

function replaceHelpCenterTicketURLs(
  element : Node,
  urlPattern : RegExp,
  replacePrefix : string,
  target?: string
) : void {

  if (element.nodeType == Node.TEXT_NODE) {
    var matchResult = null;
    var parentNode = <Node> element.parentNode;
    var elementText = element.textContent || '';

    while ((matchResult = urlPattern.exec(elementText)) != null) {
      var newText1 = document.createTextNode(elementText.substring(0, matchResult.index));
      var newText2 = document.createTextNode(elementText.substring(matchResult.index + matchResult[0].length));

      var newLink = document.createElement('a');
      newLink.href = matchResult[0];

      var newLinkText = (matchResult.length > 1) ? matchResult[1] : matchResult[0].substring(matchResult[0].lastIndexOf('/') + 1);

      try {
        newLinkText = replacePrefix + decodeURIComponent(newLinkText).replace(/\+/g, ' ');
      }
      catch (e) {
        newLinkText = replacePrefix + newLinkText;
      }

      newLink.textContent = newLinkText;

      if (target) {
        newLink.setAttribute('target', target);
      }

      parentNode.insertBefore(newText1, element);
      parentNode.insertBefore(newLink, element);
      parentNode.insertBefore(newText2, element);

      parentNode.removeChild(element);

      element = newText2;
      elementText = element.textContent || '';
    }
  }
  else {
    for (var i = 0; i < element.childNodes.length; i++) {
      replaceHelpCenterTicketURLs(element.childNodes[i], urlPattern, replacePrefix, target);
    }
  }
}

/**
 * Add the Organization field to the sidebar, which will contain a link to Help Center
 * for the account details and the customer's SLA level.
 */

function addOrganizationField(
  propertyBox: HTMLElement,
  ticketId: string | null,
  ticketInfo: TicketMetadata
) : void {

  var accountCode = getAccountCode(ticketId, ticketInfo, propertyBox);

  var tags = (ticketInfo && ticketInfo.ticket && ticketInfo.ticket.tags) || [];
  var tagSet = new Set(tags);

  var helpCenterLinkHREF = null;
  var serviceLevel = <string[]> [];
  var subOrganizationTag = null;

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

  var notesItems = [];

  if (organizationInfo && organizationInfo.organization_fields.account_key) {
    var provisioningSupportInstructionsLink = createAnchorTag(
    "edit", "https://provisioning.liferay.com/group/guest/~/control_panel/manage?p_p_id=com_liferay_osb_provisioning_web_portlet_AccountsPortlet&p_p_lifecycle=0&p_p_state=maximized&p_p_mode=view&_com_liferay_osb_provisioning_web_portlet_AccountsPortlet_mvcRenderCommandName=%2Faccounts%2Fview_account&_com_liferay_osb_provisioning_web_portlet_AccountsPortlet_tabs1=support&_com_liferay_osb_provisioning_web_portlet_AccountsPortlet_accountKey=" + organizationInfo.organization_fields.account_key);
    notesItems.push(provisioningSupportInstructionsLink);
  }

  if (organizationInfo && organizationInfo.notes) {
    var notesContainer = document.createElement('div');
    notesContainer.textContent = organizationInfo.notes;
    notesContainer.innerHTML = notesContainer.textContent.replace(/\n/g, '<br/>');

    replaceHelpCenterTicketURLs(notesContainer, /https:\/\/liferay-support.zendesk.com\/agent\/tickets\/([0-9]+)\?comment=[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z/, '#', '_blank');
    replaceHelpCenterTicketURLs(notesContainer, /https:\/\/liferay-support.zendesk.com\/agent\/tickets\/([0-9]+)/, '#');
    replaceHelpCenterTicketURLs(notesContainer, /https:\/\/liferay.atlassian.net\/[^\s\.]*/, '', '_blank');
    replaceHelpCenterTicketURLs(notesContainer, /https:\/\/provisioning.liferay.com\/.*_com_liferay_osb_provisioning_web_portlet_AccountsPortlet_accountSearchKeywords=([^&]+)[^\s\.]*/, '', '_blank');

    notesItems.push(notesContainer);
  }

  generateFormField(propertyBox, 'lesa-ui-orgnotes', 'Notes', notesItems);

  if (organizationInfo) {
    var organizationFields = organizationInfo.organization_fields;
    var sla = organizationFields.sla;
    if (sla) {
      serviceLevel.push(sla.toUpperCase());
    }

    if (organizationInfo.organization_fields.account_key) {
      helpCenterLinkHREF = "https://support.liferay.com/project/#/" +
        organizationInfo.organization_fields.account_key;
    }

    subOrganizationTag = organizationFields.sub_organization;
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

  if (subOrganizationTag) {
    var subOrganizationContainer = document.createElement('div');
    var subOrganizationName = subOrganizationTag.split("_").map(function (word) { return word.charAt(0).toUpperCase() + word.slice(1); }).join(" "); /* replace underscores with spaces and capitalize: spain_pod_a => Spain Pod A */
    subOrganizationContainer.appendChild(document.createTextNode(subOrganizationName));

    generateFormField(propertyBox, 'lesa-ui-suborganization', 'Sub Organization', [subOrganizationContainer]);
  }
  else {
    generateFormField(propertyBox, 'lesa-ui-suborganization', '', []);
  }
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

function getProductVersions(tags: string[] | null) : string[] {
  if (tags == null) {
    return [];
  }

  var candidates = [];

  for (var i = 0; i < tags.length; i++) {
    var tag = tags[i];

    if (tag == 'prd_quarterly_release') {
      candidates.push('Quarterly Release');
    }
    else if (tag.indexOf('prd_liferay_dxp_7_') == 0) {
      candidates.push('7.' + tag.charAt(18));
    }
    else if (tag.indexOf('prd_liferay_portal_') == 0) {
      candidates.push('6.x');
    }
    else if ((tag.indexOf('event_') == 0) || (tag.indexOf('go_live_') == 0) ||
      (tag.indexOf('_days') != -1) || (tag.indexOf('_eps') != -1)) {

      continue;
    }
    else {
      var x = tag.indexOf('7_');

      if (x == 0) {
        candidates.push('7.' + tag.charAt(2));
        continue;
      }

      x = tag.indexOf('_7_');

      if (x != -1) {
        candidates.push('7.' + tag.charAt(x + 3));
        continue;
      }

      if ((tag.indexOf('6_') == 0) || (tag.indexOf('_6_') != -1)) {
        candidates.push('6.x');
        continue;
      }
    }
  }

  if ((candidates.indexOf('7.4') != -1) && (candidates.indexOf('Quarterly Release') == -1)) {
    candidates.push('Quarterly Release');
  }

  candidates.sort().reverse();

  if (candidates.length == 0) {
    candidates.push('Quarterly Release');
  }

  return candidates;
}

/**
 * Convert the Liferay version into the Patcher Portal product version.
 */

function getProductVersionId(
  version: string
) : string {

  if (version == 'Quarterly Release') {
    return '249803555';
  }

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
  ticketId: string | null,
  ticketInfo: TicketMetadata
) : void {

  var accountCode = getAccountCode(ticketId, ticketInfo, propertyBox);

  var patcherPortalItems = <Array<Node>> [];

  if (accountCode) {
    var allBuildsLinkHREF = getPatcherPortalAccountsHREF('', {
      'accountEntryCode': accountCode
    });

    patcherPortalItems.push(createAnchorTag('All Builds', allBuildsLinkHREF));

    var versions = getProductVersions(ticketInfo.ticket && ticketInfo.ticket.tags ? ticketInfo.ticket.tags : []);

    for (var i = 0; i < versions.length; i++) {
      var version = versions[i];

      var versionBuildsLinkHREF = getPatcherPortalAccountsHREF('/view', {
        'patcherBuildAccountEntryCode': accountCode,
        'patcherProductVersionId': getProductVersionId(version)
      });

      patcherPortalItems.push(createAnchorTag(version + ' Builds', versionBuildsLinkHREF));
    }
  }
  else if (ticketId) {
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
  ticketId: string | null
) : void {

  var jiraSearchLinkContainer = document.createElement('div');
  var jiraSearchItems = [];

  if (ticketId) {
    jiraSearchLinkContainer.appendChild(getJiraSearchLink('Linked Issues', ticketId));
    jiraSearchItems.push(jiraSearchLinkContainer);
  }

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
  ticketId: string | null,
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
  ticketId?: string | null
) : HTMLElement[] {

  var propertyBoxes = <HTMLDivElement[]> Array.from(document.querySelectorAll('#ticket_sidebar div[data-garden-id="grid.row"]'));
  var visiblePropertyBoxes;

  if (propertyBoxes.length == 0) {
    propertyBoxes = <HTMLDivElement[]> Array.from(document.querySelectorAll('.property_box:not(.ticket_properties)'));

    visiblePropertyBoxes = propertyBoxes.filter(it => {
      var workspaceElement = <HTMLElement | null> it.closest('.workspace');

      return workspaceElement && workspaceElement.style.display != 'none';
    });
  }
  else {
    visiblePropertyBoxes = propertyBoxes.filter(it => {
      var workspaceElement = <HTMLElement | null> it.closest('.workspace');

      return workspaceElement && workspaceElement.style.display != 'none';
    }).filter(it => it.querySelector('div[data-test-id="ticket-fields-tags"]') == null);
  }

  if (ticketId) {
    return visiblePropertyBoxes.filter(it => it.getAttribute('data-ticket-id') != ticketId);
  }

  return visiblePropertyBoxes;
}

/**
 * Update the sidebar with any ticket details we can pull from the ZenDesk API.
 */

function updateSidebarBoxContainer(
  ticketId: string | null,
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
    propertyBoxes[i].setAttribute('data-ticket-id', ticketId || '');
  }
}