const express = require('express')
const app = express()
const path = require('path')
const cors = require('cors')
app.use(express.static(`${__dirname}/public`))
app.use(express.json())
app.use(cors())

const Rollbar = require('rollbar')
const rollbar = new Rollbar({
  accessToken: '2e5c0daac7ef4d398a7c873e30b98d3a',
  captureUncaught: true,
  captureUnhandledRejections: true,
})

rollbar.log('Hello world!')


const students = ['Jimmy', 'Timothy', 'Jimothy']

app.get('/', (req, res) => {
    rollbar.info("HTML served successfully");
    res.sendFile(path.join(__dirname, '/index.html'))
})

app.get('/api/students', (req, res) => {
    rollbar.info("Someone got the list of students to load");
    res.status(200).send(students)
})

app.post('/api/students', (req, res) => {
   let {name} = req.body

   const index = students.findIndex(student => {
       return student === name
   })

   try {
       if (index === -1 && name !== '') {
            rollbar.log("Student added successfully", {author: "Brandon", type: "Manual entry"});
           students.push(name)
           res.status(200).send(students)
       } else if (name === ''){
            rollbar.error("No name provided");
           res.status(400).send('You must enter a name.')
       } else {
            rollbar.error("Student already exists");
           res.status(400).send('That student already exists.')
       }
   } catch (err) {
       console.log(err)
   }
})

app.delete('/api/students/:index', (req, res) => {
    const targetIndex = +req.params.index
    
    students.splice(targetIndex, 1)
    res.status(200).send(students)
})

app.use(rollbar.errorHandler())

const port = process.env.PORT || 5050

app.listen(port, () => console.log(`Server listening on ${port}`))
