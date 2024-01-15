const { response } = require("express")
const knex = require("../database/knex")

class NotesController {
  async create(request, response) {
    const { title, description, rating, tags } = request.body
    const { user_id } = request.params

    const [movie_notes_id] = await knex("movie_notes").insert({
      title,
      description,
      rating,
      user_id
    })

    const tagsInsert = tags.map(name => {
      return {
        movie_notes_id,
        name,
        user_id
      }
    })

    await knex("movie_tags").insert(tagsInsert)

    return response.json()
  }

  async show(request, response) {
    const { id } = request.params

    const movie_notes = await knex("movie_notes").where({ id }).first()
    const movie_tags = await knex("movie_tags").where({ movie_notes_id: id }).orderBy("name")

    return response.json({
      ...movie_notes,
      movie_tags
    })
  }

  async delete(request, response) {
    const { id } = request.params

    await knex("movie_notes").where({ id }).delete()

    return response.json()
  }

  async index(request, response) {
    const { title, user_id, movie_tags } = request.query

    let movie_notes

    if (movie_tags) {
      const filterTags = movie_tags.split(',').map(tag => tag.trim())

      movie_notes = await knex("movie_tags")
        .whereIn("name", filterTags)

    } else {
      movie_notes = await knex("movie_notes")
        .where({ user_id })
        .whereLike("title", `%${title}%`)
        .orderBy("title")
    }


    return response.json(movie_notes)

  }


}

module.exports = NotesController

