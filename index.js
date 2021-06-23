const express = require('express')
const app = express()
app.use(express.json())
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())
morgan.token('body-post', function (req, res) {
    return JSON.stringify(req.body)
})

app.use(morgan(function (tokens, req, res) {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        tokens['body-post'](req, res)
    ].join(' ')
}))

app.use(express.static('build'))

let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    }
]

//Main response
app.get('/', (request, response) => {
    return response.send('<h1>Hello world!</h1>')
})

//Get all persons
app.get('/api/persons', (request, response) => {
    return response.status(200).json(persons).end()
})

//Get one person
app.get('/api/persons/:id', (request, response) => {

    const id = Number(request.params.id)
    const person = persons.find(p => p.id === id)

    if (person) {
        response.status(200).json(person).end()
    } else {
        response.status(404).json({ error: 'That person does not exist' }).end()
    }

})

//Response for info request
app.get('/info', (request, response) => {
    const personsNum = persons.length
    const date = new Date()
    return response.status(200).send(`<h5>Phonebook has info for ${personsNum} people</h5><h5>${date}</h5>`)
})

//Delete one person
app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(p => p.id !== id)
    response.status(204).end()
})

//Create a new person
app.post('/api/persons', (request, response) => {
    const { name, number } = request.body

    if (!name || !number) {
        response.status(400).json({ error: 'Contact name or number missing' }).end()
    }

    if (persons.find(p => p.name.toLowerCase() === name.toLowerCase())) {
        response.status(400).json({ error: 'Name must be unique' }).end()
    }

    const newPerson = {
        name: name,
        number: number,
        id: Math.floor(Math.random() * 10000)
    }
    persons = [...persons, newPerson]
    response.status(201).json(newPerson).end()

})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'Unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
