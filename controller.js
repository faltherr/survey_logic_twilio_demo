const MessagingResponse = require('twilio').twiml.MessagingResponse;
const surveyQs = require('./survey_questions')

module.exports = {
    emergency: (request, res) => {

        // respond with message TwiML content

        function respond(message) {
            var twiml = new MessagingResponse();
            twiml.message(message);
            res.type('text/xml');
            res.send(twiml.toString());
        }

        // console.log(request)
        let { Body, From } = request.body
        let db = request.app.get('db')
        if (Body.toLowerCase().match(/^.*(emergency).*$/)) {
            db.alertStatus(From).then(emergencyResponse => {
                // console.log(response)
                return respond('We have received your request for assistance. We contacted your health worker to coordinate a response.')
                res.status(200).send(emergencyResponse)
            })
            // twiml.message('We have received your request for assistance. We contacted you health worker to coordinate a response.');
            // response.writeHead(200, { 'Content-Type': 'text/xml' });
            // response.end(twiml.toString());
        } else if (Body.toLowerCase().match(/^.*(register|start).*$/)) {
            db.checkPhoneNumber(From).then(checkPhoneNumber => {
                if (checkPhoneNumber.length){
                    return respond('You\'re already registered')
                } else {
                    db.addPhone(From).then(addedNumbers =>{
                        // setTimeout(() => respond('Question 1: What is your 3 word address?'), 10000)
                        return respond(`Your number has been added. Please complete our survey. ${surveyQs[0].name}`)
                        // return respond('Question 1: What is your name?')
                        res.status(200).send(addedNumbers)
                    })
                }
                // console.log(111111, response)
                // response.status(200).send()
            })
        } else {
            db.checkPhoneNumber(From).then(surveyNumberCheck => {
                // console.log(2343423, surveyNumberCheck[0])
                if(surveyNumberCheck.length === 0) {
                    return respond('Did you mean to register for HealthGrid Field Service? Respond with Register.')
                } else if(surveyNumberCheck[0].completed === true){
                    return respond('Survey has already been completed.')
                } else {
                        if (Object.values(surveyNumberCheck[0]).indexOf(null) === -1){
                            return respond('Survey is complete. Message us if there is an emergency.')
                        } else {

                            // ********** Determine what cell the message body should fill ********** //
                    
                            //** The first null index should be identified as the value we want to insert into the table
                            let objectArr = Object.values(surveyNumberCheck[0])
                            // console.log(objectArr)
                            let firstNullIndex = objectArr.indexOf(null)
                            // console.log(firstNullIndex)
                        
                            //** Question to fill holds the key of the object at the first null value
                            //** We will add this value to the database
                            let questionToFill = Object.keys(surveyNumberCheck[0])[firstNullIndex]
                            
                            //** This should be a DB Query for adding values to the database
                            let newObj = {}
                            newObj[questionToFill] = Body;
                            
                            db.mama_survey.update({phone: From}, newObj).then( function(error, updatedDatabase) {
                                res.status(200).send(updatedDatabase)
                            })

                            // ********** Determine what question to send ********** //
                    
                            //** questionToSend holds the text associated with the key of the second null value
                            //** We get the second null index 
                            let secondNullIndex = objectArr.indexOf(null, objectArr.indexOf(null) + 1);
                            // console.log(secondNullIndex)

                            //** We want to make sure that there is still a question to send
                            if(secondNullIndex !== -1 ){
                                let questionToSend = Object.keys(surveyNumberCheck[0])[secondNullIndex]
                                // console.log('This is the reference to the survey question we want to send to the user:', questionToSend)
                                surveyQs.forEach( element => {
                                    if(questionToSend in element){
                                        return respond(Object.values(element)[0])
                                    }
                                })
                                }
                        }
                    }
                })
        }
    }
}