// import express from 'express'
// import { PrismaClient } from "../src/generated/prisma/client.js";

// const port = 3000
// const app = express()
// const prisma = new PrismaClient()

// app.get('/movies', async (req, res) => {
// const movies = await prisma.movie.findMany()
// res.json(movies)
// })

// app.listen(port, () => {
//     console.log(`Servidor em execução em http://localhost:${port}`)
// })

import 'dotenv/config'
import express from 'express'
import { PrismaClient } from '../src/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'

const port = 3000
const app = express()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })
app.use(express.json())
app.get('/movies', async (_, res) => {
    const movies = await prisma.movie.findMany({
        orderBy: {
            title: 'asc',
        },
        include: {
            genres: true,
            languages: true,
        },
    })
    res.json(movies)
})
app.post('/movies', async (req, res) => {
    const { title, genre_id, language_id, oscar_count, release_date } = req.body

    try {
        await prisma.movie.create({
            data: {
                title,
                genre_id,
                language_id,
                oscar_count,
                release_date: new Date(release_date),
            },
        })

    } catch (error) {
        return res.status(500).send({ message: 'falha ao cadastrar um filme' })
    }
    res.status(201).send()
})

app.listen(port, () => {
    console.log(`Servidor em execução em http://localhost:${port}`)
})
