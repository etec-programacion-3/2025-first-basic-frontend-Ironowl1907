
const API_BASE_URL = 'http://localhost:8080';
let editingBookId = null;

// Show message to user
function showMessage(text, type = 'success') {
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = `<div class="message ${type}">${text}</div>`;
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 5000);
}

// Load all books
async function loadBooks() {
    try {
        const response = await fetch(`${API_BASE_URL}/libros`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const books = await response.json();
        displayBooks(books);
    } catch (error) {
        console.error('Error loading books:', error);
        showMessage('Error loading books. Make sure your backend is running and the GET /libros endpoint is implemented.', 'error');
        
        // Show sample data for demonstration
        const sampleBooks = [
            { ID: 1, title: 'Sample Book 1', author: 'Author 1', isbn: '1234567890', category: 'Fiction', state: 'Available' },
            { ID: 2, title: 'Sample Book 2', author: 'Author 2', isbn: '0987654321', category: 'Non-Fiction', state: 'Unavailable' }
        ];
        displayBooks(sampleBooks);
    }
}

// Display books in table
function displayBooks(books) {
    const tbody = document.getElementById('booksTableBody');
    tbody.innerHTML = '';

    if (!books || books.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No books found</td></tr>';
        return;
    }

    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.ID}</td>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.isbn}</td>
            <td>${book.category}</td>
            <td><span class="status-${book.state.toLowerCase()}">${book.state}</span></td>
            <td>
                <div class="actions">
                    <button class="btn btn-edit btn-small" onclick="editBook(${book.ID})">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="deleteBook(${book.ID})">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Add or update book
async function saveBook(bookData) {
    try {
        const url = editingBookId ? 
            `${API_BASE_URL}/libros/${editingBookId}` : 
            `${API_BASE_URL}/libros`;
        
        const method = editingBookId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        showMessage(editingBookId ? 'Book updated successfully!' : 'Book added successfully!');
        
        // Reset form
        document.getElementById('bookForm').reset();
        editingBookId = null;
        updateFormMode();
        
        // Reload books
        loadBooks();
        
    } catch (error) {
        console.error('Error saving book:', error);
        showMessage('Error saving book: ' + error.message, 'error');
    }
}

// Edit book
async function editBook(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/libros/${id}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const book = await response.json();
        
        // Fill form with book data
        document.getElementById('title').value = book.title;
        document.getElementById('author').value = book.author;
        document.getElementById('isbn').value = book.isbn;
        document.getElementById('category').value = book.category;
        document.getElementById('state').value = book.state;
        
        editingBookId = id;
        updateFormMode();
        
    } catch (error) {
        console.error('Error loading book for edit:', error);
        showMessage('Error loading book for editing. Make sure the GET /libros/{id} endpoint is implemented.', 'error');
    }
}

// Delete book
async function deleteBook(id) {
    if (!confirm('Are you sure you want to delete this book?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/libros/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        showMessage('Book deleted successfully!');
        loadBooks();
        
    } catch (error) {
        console.error('Error deleting book:', error);
        showMessage('Error deleting book. Make sure the DELETE /libros/{id} endpoint is implemented.', 'error');
    }
}

// Update form mode (Add vs Edit)
function updateFormMode() {
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    
    if (editingBookId) {
        submitBtn.textContent = 'Update Book';
        cancelBtn.style.display = 'inline-block';
    } else {
        submitBtn.textContent = 'Add Book';
        cancelBtn.style.display = 'none';
    }
}

// Cancel edit
function cancelEdit() {
    editingBookId = null;
    document.getElementById('bookForm').reset();
    updateFormMode();
}

// Form submit event
document.getElementById('bookForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const bookData = {
        title: formData.get('title'),
        author: formData.get('author'),
        isbn: formData.get('isbn'),
        category: formData.get('category'),
        state: formData.get('state')
    };
    
    await saveBook(bookData);
});

// Cancel button event
document.getElementById('cancelBtn').addEventListener('click', cancelEdit);

// Load books on page load
document.addEventListener('DOMContentLoaded', () => {
    loadBooks();
});
