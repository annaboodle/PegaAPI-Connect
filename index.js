//process.env.NODE_CONFIG_DIR = process.env['LAMBDA_TASK_ROOT'];
var AWS = require('aws-sdk');
var request = require('request-json');

exports.handler = (event, context, callback) => {

    //Initialize client
    var client = request.createClient(SYS_URL);

    //Gets pinEntered variable and caller phone number from Amazon Connect 
    let pin = parseInt(event.Details.Parameters.pinEntered, 10);
    let phoneNumber = event.Details.ContactData.CustomerEndpoint.Address.substr(1);

    //Case class and properties (note that you'll need to create the custom 'PIN' and 'PhoneNumber' properties in your case type in Pega)
    var data = {
              'caseTypeID' : process.env.PEGA_API_ENDPOINT,
              'processID' : 'pyStartCase',
              'content' : { 'pyNote': process.env.CASE_PROP_PYNOTE ? process.env.CASE_PROP_PYNOTE : 'Service Case',
                            'pyLabel': process.env.CASE_PROP_PYLABEL ? process.env.CASE_PROP_PYLABEL : 'pyLabel',
                            'PIN': pin,
                            'PhoneNumber': phoneNumber }
               };

    //Set up basic Pega API auth
    client.setBasicAuth( process.env.OPERATOR_ID, process.env.OPERATOR_PWD);

    //POST to create case
    client.post('/prweb/api/v1/cases', data, function(err, res, body) {
          context.succeed();
          console.log(res);
          context.done();            

    //Builds the response to return to Amazon Connect
    //Add and customize these values depending on what you need to return
      function buildResponse() {
          return {
              userName: 'Test User'
          };
      }

      //Even if you don't need to pass variables back to Connect, using the callback parameter is necessary to trigger the success path in your flow
      //More info at https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html#nodejs-prog-model-handler-callback
      callback(null, buildResponse());

};