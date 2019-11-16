# BtOS API

## Setup:

- Install and start mysql v5.7
- Create Database dev
- knex migrate:latest
- knex seed:run
- npm install || npm debug

## Auth

BtOS API uses classic JWT Authentication based on the authentication header of http requests. TODO -> Explain better

Default seeded development username: dev@dev / code is always 1111
