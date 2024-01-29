const { response } = require("express")
const knex = require("../database/knex")
const AppError = require("../utils/AppError")

class NotesController {
  async create(request, response) {
    const { title, description, rating, tags } = request.body
    const user_id = request.user.id

    if (!rating || rating < 0 || rating > 5)
      throw new AppError(!rating
      ? "The rating field cannot be empty."
      : "The rating must be a number between 0 and 5.");

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
    const { title, movie_tags } = request.query

    const user_id = request.user.id

    let movie_notes

    if (movie_tags) {
      const filterTags = movie_tags.split(',').map(tag => tag.trim())

      movie_notes = await knex("movie_tags")
        .select([
          "movie_notes.id",
          "movie_notes.title",
          "movie_notes.description",
          "movie_notes.rating",
          "movie_notes.user_id",
        ])
        .where("movie_notes.user_id", user_id)
        .whereLike("movie_notes.title", `%${title}%`)
        .whereIn("name", filterTags)
        .innerJoin("movie_notes", "movie_notes.id", "movie_tags.movie_notes_id")
        .orderBy("movie_notes.title")

    } else {
      movie_notes = await knex("movie_notes")
        .where({ user_id })
        .whereLike("title", `%${title}%`)
        .orderBy("title")
    }

    const userTags = await knex("movie_tags").where({ user_id })
    const notesWithTags = movie_notes.map(movie_notes => {
      const noteTags = userTags.filter(tag => tag.movie_notes_id === movie_notes.id)

      return {
        ...movie_notes,
        tags: noteTags
      }
    })

    return response.json(notesWithTags)
  }

}

module.exports = NotesController

