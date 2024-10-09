/**
 * Waits until elements appear and then click on them.
 */

function clickReactElement(
  selector: string,
  callback?: Function
) : void {

  var element = <HTMLElement> document.querySelector(selector);

  if (!element) {
    setTimeout(clickReactElement.bind(null, selector, callback), 100);

    return;
  }

  element.click();

  if (callback) {
    callback();
  }
}

/**
 * Generate an anchor tag with the specified text, href, and download attributes.
 * If the download attribute has an extension that looks like it will probably be
 * served inline, use the downloadBlob function instead.
 */

function createAnchorTag(
  text: string,
  href: string | null,
  download?: string
) : HTMLAnchorElement {

  var link = <HTMLAnchorElement> document.createElement('a');

  link.textContent = text;

  if (href) {
    link.href = href;
  }

  if (download) {
    link.download = download;

    var lowerCaseName = download.toLowerCase();

    var isLikelyInline = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.pdf'].some(function(substr) {
      return lowerCaseName.length > substr.length &&
        lowerCaseName.indexOf(substr) == lowerCaseName.length - substr.length;
    });

    if (isLikelyInline) {
      link.onclick = downloadFile.bind(null, href, download);
    }

  }
  else if (href && href.charAt(0) != '#') {
    link.target = '_blank';
  }

  return link;
}

/**
 * Download the specified HREF using the specified file name.
 */

function downloadFile(
  href: string,
  filename: string,
  callback?: (blob: Blob) => void,
) : void {

  var requestURL = href;

  if (href.indexOf('https://help.liferay.com') == 0) {
    requestURL = href.substring('https://help.liferay.com'.length);
  }

  GM.xmlHttpRequest({
    'method': 'GET',
    'url': requestURL,
    'headers': {
      'Cache-Control': 'no-cache, no-store, max-age=0',
      'Pragma': 'no-cache'
    },
    'responseType': 'blob',
    'onload': function(xhr: XMLHttpRequest) {
      if (callback) {
        callback(xhr.response);
      }
      else {
        downloadBlob(filename, xhr.response);
      }
    },
    'onerror': function(xhr: XMLHttpRequest) {
      if (callback) {
        callback(xhr.response);
      }
    }
  });
}

/**
 * Download a generated Blob object by generating a dummy link and simulating a click.
 * Avoid doing this too much, because browsers may have security to block this.
 */

function downloadBlob(
  fileName: string,
  blob: Blob
) : void {

  var blobURL = createObjectURL(blob);

  var downloadLink = createAnchorTag(fileName, blobURL);
  downloadLink.download = fileName;

  downloadLink.style.display = 'none';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

/**
 * Retrieve the value for a cookie.
 */

function getCookieValue(name: string) : string {
  var nameEquals = name + '=';

  var matchingCookies = document.cookie.split('; ').filter(it => it.indexOf(nameEquals) == 0);

  return (matchingCookies.length == 0) ? '' : matchingCookies[0].substring(nameEquals.length);
}

/**
 * Create a link to the JIRA linked issues.
 */

function getJiraSearchLink(
  text: string,
  ticketId : string
) : HTMLAnchorElement {
    var query = `
"Customer Ticket Permalink" = "https://${document.location.host}${document.location.pathname}" OR
"Zendesk Ticket IDs" ~ "${ticketId}" OR
"Zendesk Ticket IDs" ~ "https://${document.location.host}${document.location.pathname}" OR
"Customer Ticket" = "https://${document.location.host}${document.location.pathname}"
  `.trim();

  var encodedQuery = encodeURIComponent(query);

  var jiraSearchLinkHREF = 'https://liferay.atlassian.net/issues/?jql=' + encodedQuery;

  return createAnchorTag(text, jiraSearchLinkHREF);
}