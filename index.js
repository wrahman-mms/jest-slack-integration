const readPkg = require("read-pkg");
const request = require("request");
const bugsnag = require("bugsnag");

/**
 * function to send slack your test notifications
 * @param {*} testResults this is the parameter passed through by Jest containing the test results
 */
module.exports = (testResults) => {
  try {
    const packageJson = readPkg.sync(process.cwd());

    bugsnag.register(packageJson.jestSlackIntegration.bugsnagAPI);

    const failedMessage = `<!here> Bad News! *${testResults.numFailedTestSuites}* test suites have failed and *${testResults.numFailedTests}* tests have failed :( *${testResults.numPassedTests}* tests have passed. Please have a look at your tests.`;
    const passedMessage = `<!here> Great News! All *${testResults.numPassedTests}* tests have passed! Code coverage is coming soon..`;
    const failedTests =
      testResults.numFailedTestSuites > 0 || testResults.numFailedTests > 0;
    const text = failedTests ? failedMessage : passedMessage;
    const borderColor = failedTests ? "#a30200" : "#36a64f";

    const slackMessage = {
      text: text,
      attachments: [
        {
          fallback: "Required plain-text summary of the attachment.",
          color: borderColor,
          title: "",
          author_name: packageJson.jestSlackIntegration.appName
            ? packageJson.jestSlackIntegration.appName
            : "App",
          mrkdwn_in: ["text"],
          text: "",
          fields: [
            {
              title: "Total Tests Suites",
              value: testResults.numTotalTestSuites,
              short: false,
            },
            {
              title: "Total Tests",
              value: testResults.numTotalTests,
              short: false,
            },
            {
              title: "Test Suites Passing",
              value: testResults.numPassedTestSuites,
              short: false,
            },
            {
              title: "Test Suites Failing",
              value: testResults.numFailedTestSuites,
              short: false,
            },
            {
              title: "Total Tests Passing",
              value: testResults.numPassedTests,
              short: false,
            },
            {
              title: "Total Tests Failing",
              value: testResults.numFailedTests,
              short: false,
            },
          ],
        },
      ],
    };

    const options = {
      uri: packageJson.jestSlackIntegration.webhookUrl,
      method: "POST",
      json: slackMessage,
      mrkdwn: true,
    };

    try {
      request(options);
    } catch (err) {
      bugsnag.notify(err);
    }
  } catch (err) {
    bugsnag.notify(err);
  }
  return testResults;
};
