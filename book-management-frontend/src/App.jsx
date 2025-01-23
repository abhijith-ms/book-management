import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState({ title: '', author: '', year: '' });
  const [editBookId, setEditBookId] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get('https://book-management-ul3a.onrender.com/api/books');
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if any field is empty
    if (!formData.title || !formData.author || !formData.year) {
      alert('Please fill in all the boxes!');
      return; // Stop the function if any field is empty
    }

    try {
      if (editBookId) {
        // Update an existing book
        await axios.put(`https://book-management-ul3a.onrender.com/api/books/${editBookId}`, formData);
      } else {
        // Add a new book
        await axios.post('https://book-management-ul3a.onrender.com/api/books', formData);
      }
      fetchBooks(); // Refresh the book list
      setFormData({ title: '', author: '', year: '' }); // Clear the form
      setEditBookId(null); // Reset edit mode
    } catch (error) {
      console.error('Error saving book:', error);
    }
  };

  const handleEdit = (book) => {
    setFormData({ title: book.title, author: book.author, year: book.year });
    setEditBookId(book.id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://book-management-ul3a.onrender.com/api/books/${id}`);
      fetchBooks(); // Refresh the book list
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  return (
    <div>
      <h1>Book Management App</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="author"
          placeholder="Author"
          value={formData.author}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="year"
          placeholder="Year"
          value={formData.year}
          onChange={handleInputChange}
        />
        <button type="submit">{editBookId ? 'Update' : 'Add'}</button>
      </form>

      <ul>
        {books.map((book) => (
          <li key={book.id}>
            <strong>{book.title}</strong> by {book.author} ({book.year})
            <button onClick={() => handleEdit(book)}>Edit</button>
            <button onClick={() => handleDelete(book.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;