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

app.get('/movies', async (_, res) => {
    const movies = await prisma.movie.findMany({
        orderBy: {
            title: "asc",
        },
        include: {
            genres: true,
            languages: true
        }
    })
    res.json(movies)
})

app.listen(port, () => {
    console.log(`Servidor em execução em http://localhost:${port}`)
})
