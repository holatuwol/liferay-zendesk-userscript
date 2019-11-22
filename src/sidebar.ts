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
 * Generate a URL to Customer Portal's account details view.
 */

function getCustomerPortalAccountsHREF(
  params: {[s: string] : string}
) : string {

  var portletId = 'com_liferay_osb_customer_account_entry_details_web_AccountEntryDetailsPortlet';
  var ns = '_' + portletId + '_';

  var queryString = Object.keys(params).map(function(key) { return (key.indexOf('p_p_') == 0 ? key : (ns + key)) + '=' + encodeURIComponent(params[key]) }).join('&');
  return 'https://customer.liferay.com/project-details?p_p_id=' + portletId + '&' + queryString;
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

  var helpCenterLinkHREF = null;
  var serviceLevel = null;

  var organizationInfo = null;

  if (accountCode) {
    organizationInfo = organizationCache[accountCode];
  }

  if (organizationInfo) {
    var organizationFields = organizationInfo.organization_fields;
    serviceLevel = organizationFields.sla.toUpperCase();

    helpCenterLinkHREF = getCustomerPortalAccountsHREF({
      mvcRenderCommandName: '/view_account_entry',
      accountEntryId: organizationInfo.external_id
    });
  }
  else if (accountCode) {
    helpCenterLinkHREF = getCustomerPortalAccountsHREF({
      keywords: accountCode
    });
  }

  var helpCenterItems = [];

  if (accountCode && helpCenterLinkHREF) {
    var helpCenterLinkContainer = document.createElement('div');

    var helpCenterLink = createAnchorTag(accountCode, helpCenterLinkHREF);
    helpCenterLinkContainer.appendChild(helpCenterLink);

    if (serviceLevel) {
      helpCenterLinkContainer.appendChild(document.createTextNode(' (' + serviceLevel + ')'));
    }

    helpCenterItems.push(helpCenterLinkContainer);
  }

  var permalinkHREF = 'https://help.liferay.com/hc/requests/' + ticketInfo.ticket.id;
  helpCenterItems.push(createPermaLinkInputField(permalinkHREF))

  generateFormField(propertyBox, 'lesa-ui-helpcenter', 'Help Center', helpCenterItems);
}

/**
 * Generate a URL to Patcher Portal's accounts view.
 */

function getPatcherPortalAccountsHREF(
  params: {[s: string] : string}
) : string {

  var portletId = '1_WAR_osbpatcherportlet';
  var ns = '_' + portletId + '_';

  var queryString = Object.keys(params).map(function(key) { return (key.indexOf('p_p_') == 0 ? key : (ns + key)) + '=' + encodeURIComponent(params[key]) }).join('&');
  return 'https://patcher.liferay.com/group/guest/patching/-/osb_patcher/accounts/view?p_p_id=' + portletId + '&' + queryString;
}

/**
 * Retrieve the Liferay version from the sidebar.
 */

function getProductVersion(
  propertyBox: HTMLElement
) : string {

  var parentElement = <HTMLElement> propertyBox.parentElement;
  var productVersionField = parentElement.querySelector('.custom_field_360006076471 .zd-selectmenu-base-content');

  if (!productVersionField) {
    return '';
  }

  var version = (productVersionField.textContent || '').trim();

  if (version.indexOf('7.') == 0) {
    return version;
  }

  if (version.indexOf('6.') == 0) {
    return '6.x';
  }

  return '';
}

/**
 * Convert the Liferay version into the Patcher Portal product version.
 */

function getProductVersionId(
  version: string
) : string {

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
    var allBuildsLinkHREF = getPatcherPortalAccountsHREF({
      'patcherBuildAccountEntryCode': accountCode
    });

    patcherPortalItems.push(createAnchorTag('All Builds', allBuildsLinkHREF));

    var version = getProductVersion(propertyBox);

    if (version) {
      var versionBuildsLinkHREF = getPatcherPortalAccountsHREF({
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

  var query = `
"Customer Ticket Permalink" = "https://${document.location.host}${document.location.pathname}" OR
"Zendesk Ticket IDs" ~ ${ticketId}
  `.trim();

  var encodedQuery = encodeURIComponent(query);

  var jiraSearchItems = [];

  var jiraSearchLinkHREF = 'https://issues.liferay.com/issues/?jql=' + encodedQuery;

  var jiraSearchLinkContainer = document.createElement('div');

  var jiraSearchLink = createAnchorTag("Linked Issues", jiraSearchLinkHREF);
  jiraSearchLinkContainer.appendChild(jiraSearchLink);

  jiraSearchItems.push(jiraSearchLinkContainer);

  generateFormField(propertyBox, 'lesa-ui-jirasearch', 'JIRA Search', jiraSearchItems);
}

/**
 * Make tags in the sidebar clickable, so we can easily find tickets
 * with similar tags.
 */

function checkSidebarTags() {
  var tags = <Array<HTMLAnchorElement>> Array.from(document.querySelectorAll('.zd-tag-item a'));

  for (var i = 0; i < tags.length; i++) {
    var anchor = tags[i];

    if (anchor.href || !anchor.textContent) {
      continue;
    }

    anchor.title = 'tags:' + anchor.textContent;
    anchor.href = 'https://' + document.location.host + '/agent/search/1?q=' + encodeURIComponent('tags:' + anchor.textContent);
    anchor.target = '_blank';
  }
}

/**
 * Update the sidebar with any ticket details we can pull from the ZenDesk API.
 */

function updateSidebarBoxContainer(
  ticketId: string,
  ticketInfo: TicketMetadata
) : void {

  var sidebars = document.querySelectorAll('.sidebar_box_container');

  if (sidebars.length == 0) {
    return;
  }

  var propertyBoxes = <Array<HTMLElement>> [];

  for (var i = 0; i < sidebars.length; i++) {
    var propertyBox = <HTMLElement> sidebars[i].querySelector('.property_box');

    if (!propertyBox) {
      continue;
    }

    var workspace = <HTMLElement> propertyBox.closest('.workspace');

    if (workspace.style.display == 'none') {
      continue;
    }

    if (propertyBox.getAttribute('data-ticket-id') != ticketId) {
      propertyBox.setAttribute('data-ticket-id', ticketId);
      propertyBoxes.push(propertyBox);
    }
  }

  if (propertyBoxes.length == 0) {
    return;
  }

  for (var i = 0; i < propertyBoxes.length; i++) {
    addOrganizationField(propertyBoxes[i], ticketId, ticketInfo);
    addJIRASearchField(propertyBoxes[i], ticketId);
    addPatcherPortalField(propertyBoxes[i], ticketId, ticketInfo);
  }
}