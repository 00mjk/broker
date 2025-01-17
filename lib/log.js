const bunyan = require('bunyan');
const escapeRegExp = require('lodash.escaperegexp');
const mapValues = require('lodash.mapvalues');
const config = require('./config');

const sanitiseConfigVariable = (raw, variable) =>
  raw.replace(
    new RegExp(escapeRegExp(config[variable]), 'igm'),
    '${' + variable + '}',
  );

// sanitises sensitive values, replacing all occurences with label
function sanitise(raw) {
  if (!raw || typeof raw !== 'string') {
    return raw;
  }

  // Copies original `raw`, doesn't mutate it.
  // Regexp is case-insensitive, global and multiline matching,
  // this way all occurences are replaced.
  if (config.BROKER_TOKEN) {
    raw = sanitiseConfigVariable(raw, 'BROKER_TOKEN');
  }

  if (config.GITHUB_TOKEN) {
    raw = sanitiseConfigVariable(raw, 'GITHUB_TOKEN');
  }

  if (config.BITBUCKET_USERNAME) {
    raw = sanitiseConfigVariable(raw, 'BITBUCKET_USERNAME');
  }

  if (config.BITBUCKET_PASSWORD) {
    raw = sanitiseConfigVariable(raw, 'BITBUCKET_PASSWORD');
  }

  if (config.GITLAB_TOKEN) {
    raw = sanitiseConfigVariable(raw, 'GITLAB_TOKEN');
  }

  if (config.JIRA_USERNAME) {
    raw = sanitiseConfigVariable(raw, 'JIRA_USERNAME');
  }

  if (config.JIRA_USERNAME) {
    raw = sanitiseConfigVariable(raw, 'JIRA_PASSWORD');
  }

  if (config.AZURE_REPOS_TOKEN) {
    raw = sanitiseConfigVariable(raw, 'AZURE_REPOS_TOKEN');
  }

  if (config.ARTIFACTORY_URL) {
    raw = sanitiseConfigVariable(raw, 'ARTIFACTORY_URL');
  }

  return raw;
}

function sanitiseObject(obj) {
  return mapValues(obj, (v) => sanitise(v));
}

function sanitiseHeaders(headers) {
  const hdrs = JSON.parse(JSON.stringify(headers));
  if (hdrs.authorization) {
    hdrs.authorization = '${AUTHORIZATION}';
  }
  return sanitiseObject(hdrs);
}

const log = bunyan.createLogger({
  name: 'snyk-broker',
  serializers: {
    token: sanitise,
    result: sanitise,
    origin: sanitise,
    url: sanitise,
    httpUrl: sanitise,
    ioUrl: sanitise,
    headers: sanitiseHeaders,
  },
});

log.level(process.env.LOG_LEVEL || 'info');

// pin sanitation function on the log so it can be used publicly
log.sanitise = sanitise;

module.exports = log;
