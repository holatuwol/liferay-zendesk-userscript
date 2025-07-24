const googleSheetsCache: {[s: string]: Record<string, string>[]} = {};

function loadGoogleSheet(
	sheetId: string,
	gid: string,
	headerRowIndex: number,
	successCallback: Function,
	errorCallback: Function
) : void {

    var timeInHours = Math.floor(Date.now() / (60 * 60));
    var requestURL = 'https://docs.google.com/spreadsheets/d/' + sheetId + '/export?format=csv&gid=' + gid + '&t=' + timeInHours;

    if (requestURL in googleSheetsCache) {
      successCallback(googleSheetsCache[requestURL]);

      return;
    }

	GM.xmlHttpRequest({
		'method': 'GET',
		'url': requestURL,
		'headers': {
			'Cache-Control': 'no-cache, no-store, max-age=0',
			'Pragma': 'no-cache'
		},
		'onload': function(xhr: XMLHttpRequest) {
			if (xhr.status == 403) {
				errorCallback();
				return;
			}

			var rows = csv2arr(xhr.responseText);

			var header = rows[headerRowIndex];
			var data = rows.slice(headerRowIndex + 1).filter(it => it[0]).map(row => {
				var result = <Record<string, string>> {};

				for (var i = 0; i < header.length; i++) {
					if (header[i]) {
						result[header[i]] = row[i];
					}
				}

				return result;
			});

            googleSheetsCache[requestURL] = data;
			successCallback(data);
		}
	});
};

// https://stackoverflow.com/a/58181757

function csv2arr(str : string) : string[][] {
    let line = ["",];
    const ret = [line,];
    let quote = false;

    for (let i = 0; i < str.length; i++) {
        const cur = str[i];
        const next = str[i + 1];

        if (!quote) {
            const cellIsEmpty = line[line.length - 1].length === 0;
            if (cur === '"' && cellIsEmpty) quote = true;
            else if (cur === ",") line.push("");
            else if (cur === "\r" && next === "\n") { line = ["",]; ret.push(line); i++; }
            else if (cur === "\n" || cur === "\r") { line = ["",]; ret.push(line); }
            else line[line.length - 1] += cur;
        } else {
            if (cur === '"' && next === '"') { line[line.length - 1] += cur; i++; }
            else if (cur === '"') quote = false;
            else line[line.length - 1] += cur;
        }
    }
    return ret;
};