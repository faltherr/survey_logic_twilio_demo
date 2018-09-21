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

    //
    if (questionToFill === 'famplan' || questionToFill === 'illness' || questionToFill === 'hiv') {
        // console.log('Yes No question type')
        if (Body.match(/^.?(yes).?$/)) {
            console.log('Add yes')
            let newObj = {}
            newObj[questionToFill] = 'yes';
            db.mama_survey.update({ phone: From }, newObj).then(function (error, updatedDatabase) { })
        } else if (Body.match(/^.?(no).?$/)) {
            // console.log('Add no')
            let newObj = {}
            newObj[questionToFill] = 'no';
            db.mama_survey.update({ phone: From }, newObj).then(function (error, updatedDatabase) { })
        } else {
            // This is the template for all invalid responses
            // console.log('Please answer question again')
            surveyQs.forEach(element => {
                if (questionToFill in element) {
                    return respond(`Please re-enter a valid answer. ${Object.values(element)[0]}`)
                }
            })
        }

    } else if (questionToFill === 'age') {
        // console.log('Body', typeof +Body)
        if (Number.isInteger(+Body) && Body >= 10 && Body <= 70) {
            let newObj = {}
            newObj[questionToFill] = Body;
            db.mama_survey.update({ phone: From }, newObj).then(function (error, updatedDatabase) { })
        } else {
            surveyQs.forEach(element => {
                if (questionToFill in element) {
                    return respond(`Please re-enter a valid answer. ${Object.values(element)[0]}`)
                }
            })
            // console.log('Please re-enter a valid number.')
        }
    } else if (questionToFill === 'parity') {
        if (Number.isInteger(+Body) && Body >= 0 && Body <= 20) {
            let newObj = {}
            newObj[questionToFill] = Body;
            db.mama_survey.update({ phone: From }, newObj).then(function (error, updatedDatabase) { })
        } else {
            surveyQs.forEach(element => {
                if (questionToFill in element) {
                    return respond(`Please re-enter a valid answer. ${Object.values(element)[0]}`)
                }
            })
            // console.log('Parity question should be between 0 and 20')
        }
    } else if (questionToFill === 'duedate') {
        let dateMatcher = /^(\d{4})(\/|\-|\.)(0[1-9]|1[0-2]|[0-12])(\/|\-|\.)([0-31]|0[1-9]|1[0-9]|2[0-9]|3[0-1])$/
        if (Body.match(dateMatcher)) {
            // console.log('Your date is correct')
            let year = Body.match(dateMatcher)[1]
            let month = Body.match(dateMatcher)[3]
            let day = Body.match(dateMatcher)[5]
            let fullDueDate = `${year}/${month}/${day}`

            let newObj = {}
            newObj[questionToFill] = fullDueDate;
            db.mama_survey.update({ phone: From }, newObj).then(function (error, updatedDatabase) { })
        } else {
            // console.log('your date is terrible')
            surveyQs.forEach(element => {
                if (questionToFill in element) {
                    return respond(`Please re-enter a valid answer. ${Object.values(element)[0]}`)
                }
            })
        }


    } else if (questionToFill === 'location') {
        let locationMatcher = /^([a-z]+)(\/|\.|\-)([a-z]+)(\/|\.|\-)([a-z]+)$/
        if (Body.match(locationMatcher)) {
            let word1 = Body.match(locationMatcher)[1]
            let word2 = Body.match(locationMatcher)[3]
            let word3 = Body.match(locationMatcher)[5]

            let fullAddress = `${word1}.${word2}.${word3}`

            // Add the 3words api get request request here! Check for latitude/longitude bouds for Sierra Leone

            let newObj = {}
            newObj[questionToFill] = fullAddress;
            db.mama_survey.update({ phone: From }, newObj).then(function (error, updatedDatabase) { })

        } else {
            surveyQs.forEach(element => {
                if (questionToFill in element) {
                    return respond(`Please re-enter a valid answer. ${Object.values(element)[0]}`)
                }
            })
        }
    } else {
        let newObj = {}
        newObj[questionToFill] = Body;
        db.mama_survey.update({ phone: From }, newObj).then(function (error, updatedDatabase) { })
    }


    //** This should be a DB Query for adding values to the database
    // let newObj = {}
    // newObj[questionToFill] = Body;

    // db.mama_survey.update({ phone: From }, newObj).then(function (error, updatedDatabase) {})

    // // ********** Determine what question to send ********** //

    //** questionToSend holds the text associated with the key of the second null value
    //** We get the second null index 

    let secondNullIndex = objectArr.indexOf(null, objectArr.indexOf(null) + 1);
    // console.log(secondNullIndex)

    //** We want to make sure that there is still a question to send
    if (secondNullIndex !== -1) {
        console.log(secondNullIndex)
        let questionToSend = Object.keys(surveyNumberCheck[0])[secondNullIndex]
        // console.log('This is the reference to the survey question we want to send to the user:', questionToSend)
        surveyQs.forEach(element => {
            if (questionToSend in element) {
                return respond(Object.values(element)[0])
            }
        })
    } else {
        console.log(secondNullIndex)
        db.mama_survey.update({ phone: From }, {completed:true})
        respond('Survey has been completed. Message us if there is an emergency with "emergency".')
    }

}