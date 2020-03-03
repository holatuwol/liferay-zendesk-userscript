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

  var xhr = new XMLHttpRequest();
  xhr.responseType = 'blob';

  xhr.onload = function() {
    if (callback) {
      callback(this.response);
    }
    else {
      downloadBlob(filename, this.response);
    }
  };

  xhr.onerror = function() {
    if (callback) {
      callback(this.response);
    }
  }

  xhr.open('GET', href);
  xhr.send(null);
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