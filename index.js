/*
    Keep in mind that you can't use browser specific calls. Use following calls

    --Loading httpContents--
    loadURL(method,url,headers);

    --Logging to the Console--
    log(value);

    --Base64--
    base64Encode(string);

    Expected result is a JSON string representation of an array.
    [
        {"startDate":"2015-05-24T17:49:27+02:00","client":"Client A","project":"My Project","minutes":120,"notes":"HTML Coding","user":"me","cost":200,"uid":"com.toggle.233283908"},
        {"startDate":"2015-05-24T16:58:00+02:00","client":"Client B","project":"Other Project","minutes":10,"notes":"Fixing bugs","user":"me","cost":16.666666666666664,"uid":"com.toggle.233275239"}
    ]

    Make *sure* the uid you provide is not just a plain integer.

    Dates must be returned as strings in ISO 8601 format (e.g., 2004-02-12T15:19:21+00:00)

    Returning a string will present it as warning.

    To see how to add global variables (Settings) look at the Info.plist of this sample.

    Keep in mind that for security reasons passwords are stored in the keychain and
    you will have to enter them again after modifying your code.
*/

// check for credentials first and show a proper message if missing
if (url === undefined || url === null || url === '' || username === undefined || username === null || username === '' || token === undefined || token === null || token === '') {
    localize("Enter your Kimai URL, username and API token to allow access to your data.");
} else {
    // make sure the api base path is properly prefixed
    let apiUrl = url.replace(new RegExp('\/$'), '') + '/api';
    let version = kimaiValidateVersion(apiUrl, username, token);

    if (version !== true) {
        // looks weird ;-) but this is how the embedded javascript engine works
        version;
    } else {
        kimaiGetTimesheets(apiUrl, username, token);
    }
}

function kimaiGetApiJson(url, username, token)
{
    let header = {'X-AUTH-USER': username, 'X-AUTH-TOKEN': token};
    let result = loadURL("GET", url, header);

    // this should be improved
    if (result.length === 0) {
        return null;
    }

    return JSON.parse(result);
}

function kimaiValidateVersion(url, username, token)
{
    let version = kimaiGetApiJson(url + '/version', username, token);

    if (version["grandtotal_error"] !== undefined) {
        return localize(version["grandtotal_error"]);
    }

    if (version === null || version === false) {
        return localize("Please check your settings: Kimai version could not be detected.");
    }

    // invalid credentials
    if (version['message'] !== undefined && version['message'].includes('Invalid credentials')) {
        return localize("Please check your settings: missing or invalid credentials.");
    }

    // missing credentials
    if (version['message'] !== undefined && version['message'].includes('Authentication required')) {
        return localize("Please check your settings: missing or invalid credentials.");
    }

    // unsupported version
    if (version['version'] !== undefined) {
        let intVersion = parseInt(version['version'].replace('.', '').substr(0, 2));
        if (intVersion < 16) {
            return localize("This plugin works only with Kimai 1.6 and later.");
        }
    }

    return true;
}

function kimaiGetTimesheets(url, username, token)
{
    // load all entities for mapping
    let customers = {};
    let projects = {};
    let activities = {};
    let users = {};

    let apiCustomers = kimaiGetApiJson(url + '/customers?visible=3', username, token);
    if (apiCustomers["grandtotal_error"]) {
        return apiCustomers["grandtotal_error"];
    }
    for (let customer of apiCustomers) {
        customers[customer['id']] = customer;
    }

    let apiProjects = kimaiGetApiJson(url + '/projects?visible=3', username, token);
    if (apiProjects["grandtotal_error"]) {
        return apiProjects["grandtotal_error"];
    }
    for (let project of apiProjects) {
        projects[project['id']] = project;
    }

    let apiActivities = kimaiGetApiJson(url + '/activities?visible=3', username, token);
    if (apiActivities["grandtotal_error"]) {
        return apiActivities["grandtotal_error"];
    }
    for (let activity of apiActivities) {
        activities[activity['id']] = activity;
    }

    let apiUsers = kimaiGetApiJson(url + '/users?visible=3', username, token);
    if (apiUsers["grandtotal_error"]) {
        return apiUsers["grandtotal_error"];
    }
    for (let user of apiUsers) {
        users[user['id']] = user;
    }

    // now query the timesheets and prepare the result
    let result = [];

    // loop over pages instead of 9999 hardcoded entries?
    let aItems = kimaiGetApiJson(url + '/timesheets?active=0&size=9999&user=all', username, token);

    for (let aEntry of aItems)
    {
        let aItemResult = {
            'startDate': aEntry['begin'],
            'client': '',
            'project': '',
            'minutes': Math.round(aEntry['duration'] / 60),
            'notes': aEntry['description'] !== null ? aEntry['description'] : '',
            'label': aEntry['tags'].join(", "),
            'user': aEntry['user'],
            'cost': aEntry['rate'],
            'uid': 'com.kimai2.' + aEntry['id'],
        };

        if (aEntry['project'] !== undefined && aEntry['project'] !== null) {
            // how to handle unknown projects?
            if (projects[aEntry['project']] === undefined || projects[aEntry['project']] === null) {
                log('Unknown project with ID: ' + aEntry['project']);
            } else {
                let curProject = projects[aEntry['project']];
                aItemResult['project'] = curProject['name'];

                // how to handle unknown customer?
                if (customers[curProject['customer']] === undefined || customers[curProject['customer']] === null) {
                    log('Unknown customer with ID: ' + curProject['customer']);
                } else {
                    aItemResult['client'] = customers[curProject['customer']]['name'];
                }
            }
        }

        if (aEntry['activity'] !== undefined && aEntry['activity'] !== null) {
            if (activities[aEntry['activity']] === undefined || activities[aEntry['activity']] === null) {
                log('Unknown activity with ID: ' + aEntry['activity']);
            } else {
                aItemResult['category'] = activities[aEntry['activity']]['name'];
            }
        }

        if (users[aEntry['user']] === undefined || users[aEntry['user']] === null) {
            log('Unknown user with ID: ' + aEntry['user']);
        } else {
            let curUser = users[aEntry['user']];
            if (curUser['alias'] !== undefined && curUser['alias'] !== null && curUser['alias'] !== '') {
                aItemResult['user'] = curUser['alias'];
            } else {
                aItemResult['user'] = curUser['username'];
            }
        }

        result.push(aItemResult);
    }

    return JSON.stringify(result);
}
