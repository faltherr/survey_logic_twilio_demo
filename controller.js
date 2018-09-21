const MessagingResponse = require('twilio').twiml.MessagingResponse;
const surveyQs = require('./survey_questions')
const twiml = new MessagingResponse();


module.exports = {
    emergency: (request, res) => {
        let { Body, From } = request.body
        let db = request.app.get('db')
        if (Body.toLowerCase().match(/^(emergency)$/)) {
            console.log('We have received your request for assistance. We contacted you health worker to coordinate a response.')
            db.alertStatus(From).then(response => {
                console.log(response)
                // response.status(200).send()
            })
            console.log('Your patient {name} at location {Insert location} needs assistance')
            // twiml.message('We have received your request for assistance. We contacted you health worker to coordinate a response.');
            // response.writeHead(200, { 'Content-Type': 'text/xml' });
            // response.end(twiml.toString());
        } else if (Body.toLowerCase().match(/^(register|start)$/)) {
            db.checkPhoneNumber(From).then(response => {
                if (response.length){
                    console.log('You\'re already registered')
                } else {
                    db.addPhone(From).then(addedNumbers =>{
                        res.status(200).send(addedNumbers)
                        console.log('Your number has been added.')
                        setTimeout(() => console.log('Question 1: What is your name?'), 3000)
                    })
                }
                console.log(111111, response)
                // response.status(200).send()
            })
        } else {
            db.checkPhoneNumber(From).then(surveyNumberCheck => {
                console.log(2343423, surveyNumberCheck[0])
                if(surveyNumberCheck.length === 0) {
                    console.log('Did you mean to register for HealthGrid Field Service? Response with Register.')
                } else if(surveyNumberCheck[0].completed === true){
                    console.log('Survey has already been completed.')
                } else {
                        if (Object.values(surveyNumberCheck[0]).indexOf(null) === -1){
                            console.log('Survey is complete. Message us if there is an emergency.')
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
                            // db.addValueByName([questionsToFill, Body, From]).then(addValueToDB=>{
                            //     res.status(200).send(addValueToDB)
                            // })


                            // ********** Determine what question to send ********** //
                    
                            //** questionToSend holds the text associated with the key of the second null value
                            //** We get the second null index 
                            let secondNullIndex = objectArr.indexOf(null, objectArr.indexOf(null) + 1);
                            // console.log(secondNullIndex)

                            //** We want to make sure that there is still a question to send
                            if(secondNullIndex !== -1 ){
                                let questionToSend = Object.keys(surveyNumberCheck[0])[secondNullIndex]
                                console.log('This is the reference to the survey question we want to send to the user:', questionToSend)
                                surveyQs.forEach( element => {
                                    if(questionToSend in element){
                                        console.log("This is the survey question we want to ask the user:", Object.values(element)[0])
                                    }
                                })
                                }
                            // console.log(questionToFill)



                        }
                    }
                })
        }
    }
}