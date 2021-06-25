const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('Please provide a password: node mongo.js <password>')
    process.exit(1)
}

const password = process.argv[2]
const database_name = 'phone-app'

const url = `mongodb+srv://user:${password}@cluster0.wu347.mongodb.net/${database_name}?retryWrites=true&w=majority`

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
    Person.find({}).then(result => {
        console.log('Phonebook:')
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
        process.exit(1)
    })
}

const name = process.argv[3]
const number = process.argv[4]

const person = new Person({
    name: name,
    number: number
})

person.save().then(result => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
})