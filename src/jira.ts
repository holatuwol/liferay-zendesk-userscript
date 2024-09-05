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
    var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    var userLocale = navigator.language;

    value = new Intl.DateTimeFormat(userLocale, options).format(value);
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
  callback?: Function
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

  var nestedFunction = callOrder.reverse().reduce(function(accumulator, x) { return x.bind(null, accumulator); }, callback);
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
    supportOffices.push('Japan');
  }

  if ((assigneeGroup.indexOf('Spain Pod') == 0) || ((assigneeGroup.indexOf(' - ES') != -1) && (assigneeGroup.indexOf('- BR') == -1) )) {
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

function initPatchTicketValues(
  data: {[s: string]: Object}
) : void {

  var ticket = <JiraTicket> data['ticket'];
  var productVersion = <string> data['ticket.customField:custom_field_360006076471'];

  function setSummary(callback: Function) : void {
    setReactInputValue('input[data-test-id=summary]', ticket.subject, callback);
  }

  function setCustomerTicketCreationDate(callback: Function) : void {
    setReactInputValue('span[data-test-id=customfield_10134] input', new Date(ticket.createdAt), callback);
  }

  function setSupportOffice(callback: Function) : void {
    var assigneeGroup = ticket.assignee.group.name;
    var supportOffices = Array.from(getSupportOffices(assigneeGroup));

    addReactLabelValues('customfield_10133', supportOffices, callback);
  }

  function setAffectsVersion(callback: Function) : void {
    var value = (productVersion.indexOf('7_0') != -1) ? '7.0.10' :
      (productVersion.indexOf('7_1') != -1) ? '7.1.10' :
      (productVersion.indexOf('7_2') != -1) ? '7.2.10' :
      (productVersion.indexOf('7_3') != -1) ? '7.3.10' :
      (productVersion.indexOf('7_4') != -1) ? '7.4.13' :
      (productVersion.indexOf('lxc') != -1) ? '7.4.13' :
      null;

    if (value) {
      addReactLabelValue('versions', value, callback);
    }
    else if (callback) {
      callback();
    }
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

  var callOrder = <Array<Function>> [setSummary, setCustomerTicketCreationDate, setSupportOffice, setAffectsVersion, focusSummary];

  var nestedFunction = callOrder.reverse().reduce(function(accumulator, x) { return x.bind(null, accumulator); });
  nestedFunction();
}

/**
 * Attempt to initialize the ZAF client instance, then initialize the
 * ZAF parent client instance so we can retrieve ticket metadata.
 */

function initZafClient() : void {
  if (!unsafeWindow.ZAFClient) {
    setTimeout(initZafClient, 1000);

    return;
  }

  function initJiraTicketValues() : void {
    var issueTypeMenu = document.querySelector('div[data-test-id="issuetype-menu"]');
    if (!issueTypeMenu) {
      setTimeout(initJiraTicketValues, 1000);
      return;
    }

    if (issueTypeMenu.textContent != 'Patch') {
      setTimeout(initJiraTicketValues, 1000);
      return;
    }

    var client = unsafeWindow.ZAFClient.init();
    client.context().then(function(context: ZendeskClientContext) : void {
      var parentGuid = document.location.hash.substring('#parentGuid='.length);
      client.instance(parentGuid).get(['ticket', 'ticket.customField:custom_field_360006076471']).then(initPatchTicketValues);
    });
  }

  setReactSearchSelectValue('projectId', 'LPP', initJiraTicketValues);
}

function detachModalWindowHandler() : void {
  var backdrop = document.querySelector('.modal-backdrop.in');

  if (!backdrop) {
    return;
  }

  jQuery(backdrop).unbind('click');
}

if (unsafeWindow.location.hostname == '24475.apps.zdusercontent.com') {
  setTimeout(initZafClient, 1000);
}
else {
  setInterval(detachModalWindowHandler, 1000);
}