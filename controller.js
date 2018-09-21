const surveyQs = require('./survey_questions')
const surveyLogic = require('./callableFunction')
const MessagingResponse = require('twilio').twiml.MessagingResponse;

module.exports = {
    emergency: (request, res) => {

        // Respond function to convert text to TwiML content to reply to user

        function respond(message) {
            var twiml = new MessagingResponse();
            twiml.message(message);
            res.type('text/xml');
            res.send(twiml.toString());
        }

        let { Body, From } = request.body
        let db = request.app.get('db')

        // This is the emergency response functionality
        if (Body.toLowerCase().match(/^.*(emergency).*$/)) {
            db.alertStatus(From).then(emergencyResponse => {
                return respond('We have received your request for assistance. We contacted your health worker to coordinate a response.')
                res.status(200).send(emergencyResponse)
            })

        // This is the registration functionality
        } else if (Body.toLowerCase().match(/^.*(register|start).*$/)) {
            db.checkPhoneNumber(From).then(checkPhoneNumber => {
                if (checkPhoneNumber.length) {
                    return respond('You\'re already registered')
                } else {
                    db.addPhone(From).then(addedNumbers => {
                        return respond(`Your number has been added. Please complete our survey. ${surveyQs[0].name}`)
                        res.status(200).send(addedNumbers)
                    })
                }
            })
        // This is the survey functionality and check to see if the phone number is already registered
        } else {
            db.checkPhoneNumber(From).then(surveyNumberCheck => {
                if (surveyNumberCheck.length === 0) {
                    return respond('Did you mean to register for HealthGrid Field Service? Respond with Register.')
                } else if (surveyNumberCheck[0].completed === true) {
                    return respond('Survey has already been completed.')
                } else {
                    if (Object.values(surveyNumberCheck[0]).indexOf(null) === -1) {
                        return respond('Survey is complete. Message us if there is an emergency.')
                    } else {
                        surveyLogic(surveyNumberCheck, Body, From, db, respond)
                    }
                }
            })
        }
    }
}