let patientObj = { 
    id: 2,
    phone: '+15054122744',
    location: 'mauve.uphold.tunelessly',
    age: 64,
    famplan: 'no',
    hiv: null,
    parity: null,
    duedate: null,
    alert: false,
    completed: false,
    name: null 
}

function pullNull (){
    // console.log(Object.keys(patientObj))
    // console.log(Object.values(patientObj))

    if (Object.values(patientObj).indexOf(null) === -1){
        console.log('Survey is complete. Message us if there is an emergency.')
    } else {
        // ********** Determine what cell the message body should fill ********** //

        // The first null index should be identified as the value we want to insert into the table
        let objectArr = Object.values(patientObj)
        // console.log(objectArr)
        let firstNullIndex = objectArr.indexOf(null)
        // console.log(firstNullIndex)
    
        // Question to fill holds the key of the object at the first null value
        // We will add this value to the database
        let questionToFill = Object.keys(patientObj)[firstNullIndex]

        // ********** Determine what question to send ********** //

        // questionToSend holds the text associated with the key of the second null value
        // We get the second null index 
        let secondNullIndex = objectArr.indexOf(null, objectArr.indexOf(null) + 1);
        console.log(secondNullIndex)
        // We want to make sure that there is still a question to send
        if(secondNullIndex !== -1 ){
            let questionToSend = Object.keys(patientObj)[secondNullIndex]
            console.log(questionToSend)
        }
    
        console.log(questionToFill)

    }


}

console.log(pullNull(patientObj))