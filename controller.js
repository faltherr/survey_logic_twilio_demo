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
                //******** Should I add this into the massaging response? */
                //******** Should the respond function be different for an emergency? So that we message patient AND HCW?*/
                
                respond(`Help is on the way, ${emergencyResponse[0].name}. Your health worker is coordianting a response for your address, ${emergencyResponse[0].location}`)
            })

        // This is the registration functionality
        } else if (Body.toLowerCase().match(/^.*(register|start).*$/)) {
            db.checkPhoneNumber(From).then(checkPhoneNumber => {
                if (checkPhoneNumber.length) {
                    // If the user resends register, lookup their survey and resend the question.
                    let objectArr = Object.values(checkPhoneNumber[0])
                    let firstNullIndex = objectArr.indexOf(null)
                    let questionToFill = Object.keys(checkPhoneNumber[0])[firstNullIndex]
                    surveyQs.forEach(element => {
                        if (questionToFill in element) {
                            return respond(`You\'re already registered. Please answer this question: ${Object.values(element)[0]}`)
                        }
                    })
                } else {
                    db.addPhone(From).then(addedNumbers => {
                        return respond(`Your number has been added. Please complete our survey. ${surveyQs[0].name}`)
                    })
                }
            })
        // This is the survey functionality and check to see if the phone number is already registered
        } else {
            db.checkPhoneNumber(From).then(surveyNumberCheck => {
                if (surveyNumberCheck.length === 0) {
                    return respond('Did you mean to register for HealthGrids Field Service? Respond with "Register".')
                } else if (surveyNumberCheck[0].completed === true) {
                    return respond('You already completed the survey. Message us if there is an emergency with "emergency".')
                } else {
                    // Here we use the imported survey logic function to update DB and ask the correct question
                        surveyLogic(surveyNumberCheck, Body, From, db, respond)
                }
            })
        }
    }
}