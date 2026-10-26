const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = `http://localhost:${process.env.PORT || 5000}`;

// Raw data source that the Axios calls below fetch from
public_users.get('/booksdb', (req, res) => {
  return res.status(200).json(books);
});

// Helper: fetch all books with Axios
const fetchBooks = async () => {
  const response = await axios.get(`${BASE_URL}/booksdb`);
  return response.data;
};

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (users.some((user) => user.username === username)) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop (async/await + Axios)
public_users.get('/', async function (req, res) {
  try {
    const allBooks = await fetchBooks();
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});

// Get book details based on ISBN (async/await + Axios)
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const allBooks = await fetchBooks();
    const book = allBooks[req.params.isbn];
    if (book) {
      return res.status(200).send(JSON.stringify(book, null, 4));
    }
    return res.status(404).json({ message: "Book not found" });
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving book by ISBN" });
  }
});

// Get book details based on author (async/await + Axios)
public_users.get('/author/:author', async function (req, res) {
  try {
    const allBooks = await fetchBooks();
    const author = req.params.author.toLowerCase();
    const result = Object.keys(allBooks)
      .filter((key) => allBooks[key].author.toLowerCase() === author)
      .map((key) => ({ isbn: key, ...allBooks[key] }));

    if (result.length > 0) {
      return res.status(200).send(JSON.stringify(result, null, 4));
    }
    return res.status(404).json({ message: "No books found for this author" });
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books by author" });
  }
});

// Get all books based on title (async/await + Axios)
public_users.get('/title/:title', async function (req, res) {
  try {
    const allBooks = await fetchBooks();
    const title = req.params.title.toLowerCase();
    const result = Object.keys(allBooks)
      .filter((key) => allBooks[key].title.toLowerCase() === title)
      .map((key) => ({ isbn: key, ...allBooks[key] }));

    if (result.length > 0) {
      return res.status(200).send(JSON.stringify(result, null, 4));
    }
    return res.status(404).json({ message: "No books found with this title" });
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books by title" });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const book = books[req.params.isbn];
  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  }
  return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;