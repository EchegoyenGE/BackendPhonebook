const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const morgan = require('morgan')
const Person = require('./models/person')

app.use(cors())
morgan.token('body-post', function (req, res) {
    return JSON.stringify(req.body)
})

const logger = morgan(function (tokens, req, res) {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        tokens['body-post'](req, res)
    ].join(' ')
})

app.use(express.static('build'))
app.use(express.json())
app.use(logger)

//Get all persons
app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

//Get one person
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).json({ error: 'person id incorrect' }).end()
            }
        })
        .catch(error => next(error))
})

//Delete one person
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => response.status(204).end())
        .catch(error => next(error))
})

//update person data
app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => response.json(updatedPerson))
        .catch(error => next(error))
})

//Create a new person
app.post('/api/persons', (request, response, next) => {
    const { name, number } = request.body

    if (!name || !number) {
        response.status(400).json({ error: 'Contact name or number missing' }).end()
    }

    const newPerson = new Person({
        name: name,
        number: number
    })

    newPerson
        .save()
        .then(savedPerson => response.json(savedPerson))
        .catch(error => next(error))

})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'Unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    const { name, message } = error
    console.log(message)

    if (name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (name === 'ValidationError') {
        return response.status(400).json({ error: message })
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
