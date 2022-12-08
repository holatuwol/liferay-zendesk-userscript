const accountCodeCache: {[s: string]: string} = {};
const organizationCache: {[s: string]: OrganizationMetadata} = {};
const ticketInfoCache: {[s: string]: string | TicketMetadata} = {};

var accountInfo: AccountMetadata | null = null;

/**
 * Retrieve the account code from the sidebar.
 */

function getAccountCode(
  ticketId: string,
  ticketInfo: TicketMetadata,
  propertyBox?: HTMLElement
) : string | null {

  if (accountCodeCache.hasOwnProperty(ticketId)) {
    return accountCodeCache[ticketId];
  }

  var accountCode = null;

  if (ticketInfo.organizations && (ticketInfo.organizations.length == 1)) {
    var organizationInfo = ticketInfo.organizations[0];
    var organizationFields = organizationInfo.organization_fields;

    accountCode = organizationFields.account_code;
  }
  else if (propertyBox) {
    var parentElement = <HTMLElement> propertyBox.parentElement;
    var accountCodeField = <HTMLInputElement | null> parentElement.querySelector('.custom_field_360013377592 .ember-text-field');

    if (accountCodeField) {
      accountCode = accountCodeField.value;
    }
  }

  if (accountCode) {
    accountCodeCache[ticketId] = accountCode;
  }

  return accountCode;
}

/**
 * Retrieve information about a ticket, and then call a function
 * once that information is retrieved.
 */

function cacheOrganizations(organizations: Array<OrganizationMetadata>) : void {
  for (var i = 0; i < organizations.length; i++) {
    organizationCache[organizations[i].organization_fields.account_code] = organizations[i];
  }
}

/**
 * Retrieve information about a ticket, and then call a function
 * once that information is retrieved.
 */

function checkTicket(
  ticketId: string,
  callback: (s: string, t: TicketMetadata | null) => void
) : void {

  if (ticketInfoCache.hasOwnProperty(ticketId)) {
    if (ticketInfoCache[ticketId] == 'PENDING') {
      return;
    }

    callback(ticketId, <TicketMetadata> ticketInfoCache[ticketId]);

    return;
  }

  var ticketInfo: TicketMetadata;

  ticketInfoCache[ticketId] = 'PENDING';

  var forkFunctions = [checkTicketMetadata, checkEvents];
  var returnedFunctions = 0;

  var joinCallback = function(ticketId: string, newTicketInfo: Object) {
    if (ticketInfo == null) {
      ticketInfo = <TicketMetadata> newTicketInfo;
    }
    else {
      Object.assign(ticketInfo, newTicketInfo);
    }

    if (++returnedFunctions != forkFunctions.length) {
      return;
    }

    if (Object.keys(ticketInfo).length == 0) {
      delete ticketInfoCache[ticketId];
    }
    else {
      ticketInfoCache[ticketId] = ticketInfo;
    }
  }

  for (var i = 0; i < forkFunctions.length; i++) {
    forkFunctions[i](ticketId, joinCallback);
  }
}

/**
 * Retrieve information about a ticket, and then call a function
 * once that information is retrieved.
 */

function checkTicketMetadata(
  ticketId: string,
  callback: (s: string, t: Object | null) => void
) : void {

  var xhr = new XMLHttpRequest();

  xhr.onload = function() {
    if (xhr.status != 200) {
      console.error("URL: " + xhr.responseURL);
      console.error("Error: " + xhr.status + " - " + xhr.statusText);

      callback(ticketId, null);

      return;
    }

    var ticketInfo = null;

    try {
      ticketInfo = JSON.parse(xhr.responseText);
    }
    catch (e) {
    }

    checkUser(ticketId, ticketInfo, callback);
  };

  xhr.onerror = function() {
    callback(ticketId, null);
  };

  var ticketDetailsURL = [
    document.location.protocol,
    '//',
    document.location.host,
    '/api/v2/tickets/',
    ticketId,
    '?include=organizations'
  ].join('');

  xhr.open('GET', ticketDetailsURL);

  xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, max-age=0');
  xhr.setRequestHeader('Pragma', 'no-cache');

  xhr.send();
}

/**
 * When the ticket doesn't contain enough information on the organization,
 * fetch the user and the user's organization and invoke the callback.
 */

function checkUser(
  ticketId: string,
  ticketInfo: TicketMetadata,
  callback: (s: string, t: Object | null) => void
) : void {

  if (ticketInfo.organizations.length != 0) {
    cacheOrganizations(ticketInfo.organizations);

    callback(ticketId, ticketInfo);

    return;
  }

  var userId = ticketInfo.ticket.requester_id;

  var xhr = new XMLHttpRequest();

  xhr.onload = function() {
    var userInfo = null;

    try {
      userInfo = JSON.parse(xhr.responseText);
    }
    catch (e) {
    }

    cacheOrganizations(userInfo.organizations);

    ticketInfo.organizations = userInfo.organizations;

    callback(ticketId, ticketInfo);
  };

  xhr.onerror = function() {
    callback(ticketId, null);
  };

  var userDetailsURL = [
    document.location.protocol,
    '//',
    document.location.host,
    '/api/v2/users/',
    userId,
    '?include=organizations'
  ].join('');

  xhr.open('GET', userDetailsURL);

  xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, max-age=0');
  xhr.setRequestHeader('Pragma', 'no-cache');

  xhr.send();
}

/**
 * Audit event information is incomplete unless we specifically
 * request it, so do that here.
 */

function checkEvents(
  ticketId: string,
  callback: (s: string, t: Object | null) => void,
  audits: Array<TicketAuditEvent> = [],
  pageId: number = 1
) : void {

  var xhr = new XMLHttpRequest();

  xhr.onload = function() {
    var auditInfo = null;

    try {
      auditInfo = JSON.parse(xhr.responseText);
    }
    catch (e) {
    }

    Array.prototype.push.apply(audits, auditInfo.audits);

    if (auditInfo.next_page) {
      checkEvents(ticketId, callback, audits, pageId + 1);
    }
    else {
      callback(ticketId, {'audits': audits});
    }
  };

  xhr.onerror = function() {
    callback(ticketId, null);
  };

  var auditEventsURL = [
    document.location.protocol,
    '//',
    document.location.host,
    '/api/v2/tickets/',
    ticketId,
    '/audits.json?page=',
    pageId
  ].join('');

  xhr.open('GET', auditEventsURL);

  xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, max-age=0');
  xhr.setRequestHeader('Pragma', 'no-cache');

  xhr.send();
}

/**
 * Cache the account information for the current ZenDesk site.
 */

function setAccountInfo(
  callback: () => void
) : void {

  if (accountInfo) {
    return;
  }

  var xhr = new XMLHttpRequest();

  xhr.onload = function() {
    if (xhr.status != 200) {
      console.log("URL: " + xhr.responseURL);
      console.log("Error: " + xhr.status + " - " + xhr.statusText);
    }

    try {
      accountInfo = JSON.parse(xhr.responseText);
    }
    catch (e) {
    }

    callback();
  };

  var accountDetailsURL = [
    document.location.protocol,
    '//',
    document.location.host,
    '/api/v2/account.json'
  ].join('');

  xhr.open('GET', accountDetailsURL);

  xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, max-age=0');
  xhr.setRequestHeader('Pragma', 'no-cache');

  xhr.send();
}
