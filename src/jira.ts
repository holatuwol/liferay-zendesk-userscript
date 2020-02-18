/**
 * Workaround for interacting with input fields built by react.js
 * https://github.com/facebook/react/issues/10135#issuecomment-314441175
 */

function setReactInputValue(
  selector: string,
  value: any,
  callback: Function
) : void {

  var element = document.querySelector(selector);

  if (!element) {
    setTimeout(setReactInputValue.bind(null, selector, value, callback), 100);

    return;
  }

  // Format dates like React datepickers expect.

  if (value instanceof Date) {
    var mm = value.getMonth() + 1;
    var mmString = (mm < 10) ? '0' + mm : mm;
    var dd = value.getDate();
    var ddString = (dd < 10) ? '0' + dd : dd;
    var yyyy = value.getFullYear();

    value = mmString + '/' + ddString + '/' + yyyy;
  }

  // Make sure to call the right setter function so the underlying state is updated.

  var elementDescriptor = Object.getOwnPropertyDescriptor(element, 'value');
  var valueSetter = elementDescriptor && elementDescriptor.set;

  var prototype = Object.getPrototypeOf(element);
  var prototypeDescriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
  var prototypeValueSetter = null;

  if (prototypeDescriptor) {
    var valueDescriptor = <PropertyDescriptor> Object.getOwnPropertyDescriptor(prototype, 'value');
    prototypeValueSetter = valueDescriptor.set;
  }

  if (prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
  }
  else if (valueSetter) {
    valueSetter.call(element, value);
  }

  element.dispatchEvent(new Event('input', { bubbles: true }));

  if (callback) {
    callback();
  }
}

/**
 * Utility method to simulate clicking on a drop-down select, entering
 * text into a search field, waiting for the results to populate, and
 * then selecting everything that matches.
 */

function setReactSearchSelectValue(
  testId: string,
  value: any,
  callback: Function
) : void {

  function requestPopup(callback: Function) : void {
    var buttonField = <HTMLDivElement> document.querySelector('div[data-test-id=' + testId + ']');

    if (!buttonField) {
      setTimeout(requestPopup.bind(null, callback), 100);
      return;
    }

    if (!buttonField.querySelector('div[aria-haspopup=true]')) {
      var button = <HTMLDivElement> buttonField.querySelector('div[role=button]');
      button.click();
    }

    if (callback) {
      callback();
    }
  }

  function waitForPopup(callback: Function) : void {
    var searchMenu = <HTMLDivElement> document.querySelector('div[data-test-id=' + testId + '-list]');

    if (!searchMenu) {
      setTimeout(waitForPopup.bind(null, callback), 100);
      return;
    }

    var options = <Array<HTMLDivElement>> Array.from(searchMenu.querySelectorAll('div[class*="optionText"]'));

    if (options.length == 0) {
      setTimeout(waitForPopup.bind(null, callback), 100);
      return;
    }

    if (callback) {
      callback();
    }
  }

  function setPopupValue(callback: Function) : void {
    function clickSearchMenuOptions() : void {
      var searchMenu = <HTMLDivElement> document.querySelector('div[data-test-id=' + testId + '-list]');

      if (!searchMenu) {
        setTimeout(clickSearchMenuOptions, 100);
        return;
      }

      var options = <Array<HTMLDivElement>> Array.from(searchMenu.querySelectorAll('div[class*="optionText"]'));

      if (options.length != 1) {
        setTimeout(clickSearchMenuOptions, 100);
        return;
      }

      for (var i = 0; i < options.length; i++) {
        options[i].click();
      }

      if (callback) {
        callback();
      }
    };

    setReactInputValue('input[data-test-id=' + testId + '-search]', value, clickSearchMenuOptions);
  }

  var callOrder = <Array<Function>> [requestPopup, waitForPopup, setPopupValue];

  var nestedFunction = callOrder.reverse().reduce(function(accumulator, x) { return x.bind(null, accumulator); });
  nestedFunction();
}

/**
 * Utility method to add a new value to a list of tag-like values. Similar to the
 * search select value, except the search fields are less elaborate.
 */

function addReactLabelValue(
  testId: string,
  value: any,
  callback: Function
) : void {

  var buttonField = <HTMLDivElement> document.querySelector('div[data-test-id=' + testId + ']');
  var button = <HTMLInputElement> buttonField.querySelector('input');

  button.focus();

  function clickSearchMenuOptions() {
    var searchMenu = document.querySelector('div[class*="ssc-scrollable"]');

    if (!searchMenu) {
      setTimeout(clickSearchMenuOptions, 100);
      return;
    }

    var options = <Array<HTMLDivElement>> Array.from(searchMenu.querySelectorAll('div[role=menuitem]'));

    if (options.length == 0) {
      setTimeout(clickSearchMenuOptions, 100);
      return;
    }

    for (var i = 0; i < options.length; i++) {
      options[i].click();
    }

    if (callback) {
      callback();
    }
  }

  setReactInputValue('div[data-test-id=' + testId + '] input', value, clickSearchMenuOptions);
}

/**
 * Utility function which adds all the listed labels, and then invokes
 * the listed callback.
 */

function addReactLabelValues(
  testId: string,
  values: Array<any>,
  callback: Function
) : void {

  var nestedFunction = values.reverse().reduce(function(accumulator, x) { return addReactLabelValue.bind(null, testId, x, accumulator); }, callback);
  nestedFunction();
}

/**
 * Retrieve the support offices based on the JIRA ticket.
 */

function getSupportOffices(
  assigneeGroup: string
) : Set<string> {

  var supportOffices = [];

  if (assigneeGroup.indexOf('- AU') != -1) {
    supportOffices.push('APAC');
    supportOffices.push('AU/NZ');
  }

  if (assigneeGroup.indexOf('- BR') != -1) {
    supportOffices.push('Brazil');
  }

  if (assigneeGroup.indexOf('- CN') != -1) {
    supportOffices.push('APAC');
  }

  if (assigneeGroup.indexOf('- HU') != -1) {
    supportOffices.push('EU');
  }

  if (assigneeGroup.indexOf('- IN') != -1) {
    supportOffices.push('India');
  }

  if (assigneeGroup.indexOf('- JP') != -1) {
    supportOffices.push('APAC');
  }

  if ((assigneeGroup.indexOf('Spain Pod') == 0) || (assigneeGroup.indexOf(' - ES') != -1)) {
    supportOffices.push('Spain');
  }

  if (assigneeGroup.indexOf(' - US') != -1) {
    supportOffices.push('US');
  }

  return new Set(supportOffices);
}

/**
 * Set the initial values for the "Create Issue" modal dialog window
 * after the fields have initialized.
 */

function initJiraTicketValues(
  data: {[s: string]: Object}
) : void {

  var ticket = <JiraTicket> data['ticket'];
  var productVersion = <string> data['ticket.customField:custom_field_360006076471'];

  function setProjectId(callback: Function) : void {
    setReactSearchSelectValue('projectId', 'LPP', callback);
  }

  function setSummary(callback: Function) : void {
    setReactInputValue('input[data-test-id=summary]', ticket.subject, callback);
  }

  function setCustomerTicketCreationDate(callback: Function) : void {
    setReactInputValue('span[data-test-id=customfield_11126] input', new Date(ticket.createdAt), callback);
  }

  function setSupportOffice(callback: Function) : void {
    var assigneeGroup = ticket.assignee.group.name;
    var supportOffices = Array.from(getSupportOffices(assigneeGroup));

    addReactLabelValues('customfield_11523', supportOffices, callback);
  }

  function setAffectsVersion(callback: Function) : void {
    var value = (productVersion.indexOf('7_0') != -1) ? '7.0.10' :
      (productVersion.indexOf('7_1') != -1) ? '7.1.10' :
      (productVersion.indexOf('7_2') != -1) ? '7.2.10' : null;

    if (value) {
      addReactLabelValue('versions', value, callback);
    }
    else if (callback) {
      callback();
    }
  }

  function setDeliveryBaseFixPack(callback: Function) {
    var conversations = ticket.conversations;
    var baselines = new Set();

    for (var i = 0; i < conversations.length; i++) {
      var conversationText = conversations[i].value;
      var baselineRegExp = /(de|dxp)-[0-9][0-9]*/gi;

      var matcher = null;

      while (matcher = baselineRegExp.exec(conversationText)) {
        baselines.add(matcher[0].toUpperCase());
      }
    }

    var versionNumber = (productVersion.indexOf('7_0') != -1) ? '7010' :
      (productVersion.indexOf('7_1') != -1) ? '7110' :
      (productVersion.indexOf('7_2') != -1) ? '7210' : null;

    setReactInputValue('input[data-test-id=customfield_22551]', Array.from(baselines).join(' '), callback)
  }

  function focusSummary(callback: Function) {
    var summary = <HTMLInputElement> document.querySelector('input[data-test-id=summary]');
    summary.focus();

    var app = <HTMLElement> document.getElementById('app');
    app.scrollIntoView();

    if (callback) {
      callback();
    }
  }

  var callOrder = <Array<Function>> [setProjectId, setSummary, setCustomerTicketCreationDate, setSupportOffice, setAffectsVersion, setDeliveryBaseFixPack, focusSummary];

  var nestedFunction = callOrder.reverse().reduce(function(accumulator, x) { return x.bind(null, accumulator); });
  nestedFunction();
}

/**
 * Attach a click listener to the copyFieldsLink element to populate
 * the JIRA ticket fields.
 */

function attachCopyFieldsLinkListener(
  client: ZendeskClientInstance,
  parentClient: ZendeskClientInstance
) : void {

  var copyFieldsLink = document.querySelector('div[class*="copyFieldsLink"]');

  if (copyFieldsLink) {
    parentClient.get(['currentUser', 'ticket', 'ticket.customField:custom_field_360006076471']).then(initJiraTicketValues);
  }
  else {
    setTimeout(attachCopyFieldsLinkListener.bind(null, client, parentClient), 1000);
  }
}

/**
 * Attempt to initialize the ZAF parent client instance using a
 * registered ZAF client instance.
 */

function initZafParentClient(
  client: ZendeskClientInstance,
  callback: (c: ZendeskClientInstance, p: ZendeskClientInstance) => void
) : void {

  var parentGuid = document.location.hash.substring('#parentGuid='.length);
  var parentClient = client.instance(parentGuid);

  callback(client, parentClient);
}

/**
 * Attempt to initialize the ZAF client instance, then initialize the
 * ZAF parent client instance so we can retrieve ticket metadata.
 */

function initZafClient(
  callback: (c: ZendeskClientInstance, p: ZendeskClientInstance) => void
) : void {
  if (!window.ZAFClient) {
    setTimeout(initZafClient.bind(null, callback), 1000);

    return;
  }

  var client = window.ZAFClient.init();
  client.on('app.registered', initZafParentClient.bind(null, client, callback));
}

function detachModalWindowHandler() : void {
  var backdrop = document.querySelector('.modal-backdrop.in');

  if (!backdrop) {
    return;
  }

  jQuery(backdrop).unbind('click');
}

if (window.location.hostname == '24475.apps.zdusercontent.com') {
  setTimeout(initZafClient.bind(null, attachCopyFieldsLinkListener), 1000);
}
else {
  setInterval(detachModalWindowHandler, 1000);
}