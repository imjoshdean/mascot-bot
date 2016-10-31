import fs from 'fs';
import readline from 'readline';
import GoogleAuth from 'google-auth-library';

const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets.readonly'
  ],
  TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/',
  TOKEN_PATH = TOKEN_DIR + 'calendar-birthdays.json';

function authorize(credentials) {
  const clientSecret = credentials.installed.client_secret,
    clientId = credentials.installed.client_id,
    redirectUrl = credentials.installed.redirect_uris[0],
    auth = new GoogleAuth(),
    oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  return new Promise((resolve) => {
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (error, token) => {
      if (error) {
        getNewToken(oauth2Client).then(() => {
          resolve(oauth2Client);
        });
      }
      else {
        oauth2Client.credentials = JSON.parse(token);
        resolve(oauth2Client);
      }
    });
  });
}

function getNewToken(oauth2Client) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });

  console.log(`Authorize this app by visiting this url: ${authUrl}`);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve, reject) => {
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();

      oauth2Client.getToken(code, (err, token) => {
        if (err) {
          console.log('Error while trying to retrieve access token', err);
          reject(err);
          return;
        }

        oauth2Client.credentials = token;
        storeToken(token);
        resolve(oauth2Client);
      });
    });
  });
}

function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  }
  catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log(`Token stored to ${TOKEN_PATH}`);
}


export default authorize;
