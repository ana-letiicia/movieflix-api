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
        //verificar no banco para evitar repeticao
        const movieExists = await prisma.movie.findFirst({
            where: {
                //verifica se existe um filme com o mesmo titulo, ignorando maiusculas e minusculas
                title: { equals: title, mode: 'insensitive' },
            },
        })
        if (movieExists) {
            return res.status(409).send({
                message: 'já existe um filme cadastrado com esse título',
            })
        }
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
app.put('/movies/:id', async (req, res) => {
    const id = Number(req.params.id)
    try {
        const movie = await prisma.movie.findUnique({
            where: {
                id,
            },
        })
        if (!movie) {
            return res.status(404).send({ message: 'filme não encontrado' })
        }
        const data = { ...req.body }
        data.release_date = data.release_date
            ? new Date(data.release_date)
            : undefined
        await prisma.movie.update({
            where: {
                id,
            },
            data: data,
        })
    } catch (error) {
        return res
            .status(500)
            .send({ message: 'falha ao atualizar o registro do filme' })
    }
    res.status(200).send()
})
app.delete('/movies/:id', async (req, res) => {
    const id = Number(req.params.id)
    try {
        const movie = await prisma.movie.findUnique({
            where: { id },
        })
        if (!movie) {
            return res.status(404).send({ message: 'filme não foi encontrado' })
        }
        await prisma.movie.delete({
            where: { id },
        })
    } catch (error) {
        return res
            .status(500)
            .send({ message: 'nao foi possivel remover o filme' })
    }
    res.status(200).send()
})
app.get('/movies/:genreName', async (req, res) => {
    try {
        const moviesFilteredByGenreName = await prisma.movie.findMany({
            include: {
                genres: true,
                languages: true,
            },
            where: {
                genres: {
                    name: { equals: req.params.genreName, mode: 'insensitive' },
                },
            },
        })
        res.status(200).send(moviesFilteredByGenreName)
    } catch (error) {
        res.status(500).send({ message: 'falha ao filtrar filmes por gênero' })
    }
})
app.listen(port, () => {
    console.log(`Servidor em execução em http://localhost:${port}`)
})
