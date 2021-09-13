import {
  Recording,
  setupRecording,
  SetupRecordingInput,
  mutations,
} from '@jupiterone/integration-sdk-testing';

export { Recording };

export function setupBambooHRRecording(
  input: Omit<SetupRecordingInput, 'mutateEntry'>,
): Recording {
  return setupRecording({
    ...input,
    mutateEntry: (entry) => {
      redact(entry);
    },
  });
}

function redact(entry): void {
  if (!entry.response.content.text) {
    return;
  }

  //let's unzip the entry so we can modify it
  mutations.unzipGzippedRecordingEntry(entry);
  entry.request.headers.forEach((header) => {
    if (header.name === 'authorization') {
      header.value = 'Bearer [REDACTED]';
    }
  });

  if (entry.response.content.text === '') {
    return;
  }

  const DEFAULT_REDACT = '[REDACTED]';
  const keysToRedactMap = new Map();
  keysToRedactMap.set('workEmail', 'redacted@email.com');
  keysToRedactMap.set('email', 'redacted@email.com');
  keysToRedactMap.set('mobilePhone', DEFAULT_REDACT);
  keysToRedactMap.set('workPhone', DEFAULT_REDACT);
  keysToRedactMap.set('photoUrl', DEFAULT_REDACT);

  const responseJson = JSON.parse(entry.response.content.text);
  if (responseJson?.employees?.forEach) {
    responseJson.employees.forEach((responseValue, index) => {
      keysToRedactMap.forEach((redactionValue, keyToRedact) => {
        if (responseValue[keyToRedact]) {
          responseJson.employees[index][keyToRedact] = redactionValue;
        }
      });
    });
    entry.response.content.text = JSON.stringify(responseJson);
  }

  if (typeof responseJson === 'object' && responseJson !== null) {
    for (const key of Object.keys(responseJson)) {
      keysToRedactMap.forEach((redactionValue, keyToRedact) => {
        if (responseJson[key][keyToRedact]) {
          responseJson[key][keyToRedact] = redactionValue;
        }
      });
    }
    entry.response.content.text = JSON.stringify(responseJson);
  }
}
