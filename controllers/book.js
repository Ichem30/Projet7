const Book = require("../models/Book");
const fs = require("fs");

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });

  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Objet enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Objet modifié!" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Objet supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.rateBook = async (req, res, next) => {
  try {
    const userId = req.body.userId;
    const rating = parseInt(req.body.rating);

    if (isNaN(rating) || rating < 0 || rating > 5) {
      return res.status(400).json({ message: 'Veuillez fournir une note valide entre 0 et 5.' });
    }

    const book = await Book.findOne({ _id: req.params.id });

    if (!book) {
      return res.status(404).json({ message: 'Le livre spécifié est introuvable.' });
    }

    const existingRating = book.ratings.find((rating) => rating.userId === userId);

    if (existingRating) {
      return res.status(400).json({ message: "Vous avez déjà noté ce livre." });
    }

    book.ratings.push({ userId, grade: rating });
    book.averageRating = parseFloat((book.ratings.reduce((sum, rating) => sum + rating.grade, 0) / book.ratings.length).toFixed(2));

    await book.save();

    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: "Une erreur s'est produite lors de la notation du livre.", error });
  }
};

exports.getTopBook = async (req, res, next) => {
  try {
    const books = await Book.find()
      .sort({ averageRating: -1 })
      .limit(3);

    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error });
  }
};