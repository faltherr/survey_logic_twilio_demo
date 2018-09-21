const surveyQs = require('./survey_questions')
// const respond = require('./responseMessage')

module.exports = function surveyLogic(surveyNumberCheck, Body, From, db, respond) {

    // ********** Determine what cell the message body should fill ********** //

    //** The first null index should be identified as the value we want to insert into the table
    let objectArr = Object.values(surveyNumberCheck[0])
    let firstNullIndex = objectArr.indexOf(null)

    //** Question to fill holds the key of the object at the first null value
    //** We will add this value to the database
    let questionToFill = Object.keys(surveyNumberCheck[0])[firstNullIndex]

    // if(questionToFill === 'famplan' || questionToFill === 'illness' || questionToFill === 'hiv'){
    //     console.log('Yes No question type')
    //     if(Body.match(/^.?(yes|no).?$/)){
    //         console.log('Add response to database')
    //         // let newObj = {}
    //         // newObj[questionToFill] = Body.match(/^(yes|no)$/);
    //         // db.mama_survey.update({ phone: From }, newObj).then(function (error, updatedDatabase) {})
    //     } else {
    //         console.log('Please answer question again')
    //     }

    // } else if (questionToFill === 'age'){
    //     console.log('Age question should be between 1 and 100')
    // } else if (questionToFill === 'parity'){
    //     console.log('Parity question should be between 0 and 20')
    // } else if (questionToFill === 'duedate'){
    //     console.log('Check due date recorded in YYYY/MM/DD')
    // } else if (questionToFill === 'location') {
    //     console.log('check for three word format and reasonable geographic extent outside of Sierra Leon is not cool')
    // }
    //** This should be a DB Query for adding values to the database
    let newObj = {}
    newObj[questionToFill] = Body;

    db.mama_survey.update({ phone: From }, newObj).then(function (error, updatedDatabase) {})

    // ********** Determine what question to send ********** //

    //** questionToSend holds the text associated with the key of the second null value
    //** We get the second null index 
    let secondNullIndex = objectArr.indexOf(null, objectArr.indexOf(null) + 1);
    // console.log(secondNullIndex)

    //** We want to make sure that there is still a question to send
    if (secondNullIndex !== -1) {
        let questionToSend = Object.keys(surveyNumberCheck[0])[secondNullIndex]
        // console.log('This is the reference to the survey question we want to send to the user:', questionToSend)
        surveyQs.forEach(element => {
            if (questionToSend in element) {
                return respond(Object.values(element)[0])
            }
        })
    } else {
        return respond('Survey has been completed. Message us if there is an emergency with "emergency".')
    }

}