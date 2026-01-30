import React, { useState, useEffect } from 'react';
import { Search, Plus, ShoppingBag, Tag, MapPin, X, Check, User } from 'lucide-react';
import { loadData, saveData, STORAGE_KEYS } from '../utils/storage';
import './GreenSwap.css';

const DEFAULT_PRODUCTS = [
    { id: 1, name: "Bamboo Watch", category: "Fashion", condition: "New", imageColor: "#FCD34D", isSold: false, ownerId: 'system', imageUrl: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=600&auto=format&fit=crop" },
    { id: 2, name: "Used Bike", category: "Transport", condition: "Good", imageColor: "#EF4444", isSold: false, ownerId: 'system', imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=600&auto=format&fit=crop" },
    { id: 3, name: "Organic Planter", category: "Home", condition: "New", imageColor: "#10B981", isSold: false, ownerId: 'system', imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=600&auto=format&fit=crop" },
    { id: 4, name: "Textbooks", category: "Education", condition: "Used", imageColor: "#3B82F6", isSold: false, ownerId: 'system', imageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600&auto=format&fit=crop" },
];

const USER_ID = 'user_123'; // Simulating logged-in user

const GreenSwap = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [newProduct, setNewProduct] = useState({
        name: '',
        address: '',
        category: 'Fashion',
        condition: 'Good',
        imageUrl: ''
    });

    useEffect(() => {
        const savedProducts = loadData(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
        setProducts(savedProducts);
    }, []);

    useEffect(() => {
        if (products.length > 0) {
            saveData(STORAGE_KEYS.PRODUCTS, products);
        }
    }, [products]);

    const filteredProducts = products.filter(p =>
        !p.isSold &&
        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleAddProduct = (e) => {
        e.preventDefault();
        const product = {
            id: Date.now(),
            ...newProduct,
            imageColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
            ownerId: USER_ID,
            isSold: false,
            timestamp: new Date().toLocaleDateString()
        };
        setProducts([product, ...products]);
        setIsModalOpen(false);
        setNewProduct({ name: '', address: '', category: 'Fashion', condition: 'Good', imageUrl: '' });
    };

    const handleDeleteProduct = (productId) => {
        if (window.confirm("Are you sure you want to delete this listing?")) {
            const updatedProducts = products.filter(p => p.id !== productId);
            setProducts(updatedProducts);
        }
    };

    const handleBuy = (productId) => {
        const updatedProducts = products.map(p =>
            p.id === productId ? { ...p, isSold: true, soldTo: USER_ID } : p
        );
        setProducts(updatedProducts);

        // Save order (mock)
        const orders = loadData(STORAGE_KEYS.ORDERS, []);
        const product = products.find(p => p.id === productId);
        orders.push({
            id: Date.now(),
            productId,
            productName: product.name,
            date: new Date().toLocaleDateString()
        });
        saveData(STORAGE_KEYS.ORDERS, orders);

        alert("Order placed successfully! Thank you for choosing green.");
    };

    return (
        <div className="container greenswap-container">
            <div className="swap-header">
                <div className="search-container">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setIsModalOpen(true)}
                    style={{ gap: '0.5rem' }}
                >
                    <Plus size={20} /> Add Your Product
                </button>
            </div>

            <div className="product-grid">
                {filteredProducts.map(product => {
                    const isMyProduct = product.ownerId === USER_ID;
                    return (
                        <div key={product.id} className="product-card" style={isMyProduct ? { border: '2px solid var(--color-primary)' } : {}}>
                            <div className="product-image" style={{ backgroundColor: product.imageColor }}>
                                {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
                                ) : null}
                                <div className="product-badge">{product.condition}</div>
                                {isMyProduct && (
                                    <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'var(--color-primary)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <User size={12} /> My Item
                                    </div>
                                )}
                            </div>
                            <div className="product-details">
                                <div className="product-category">{product.category}</div>
                                <h3 className="product-name">{product.name}</h3>
                                <div className="product-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <MapPin size={12} /> {product.address || 'Available for pickup'}
                                </div>
                                <div className="product-actions">
                                    {isMyProduct ? (
                                        <button
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className="btn"
                                            style={{ flex: 1, fontSize: '0.9rem', background: '#FEE2E2', color: '#EF4444', border: '1px solid #FECACA' }}
                                        >
                                            Delete Listing
                                        </button>
                                    ) : (
                                        <button onClick={() => handleBuy(product.id)} className="btn btn-primary" style={{ flex: 1, fontSize: '0.9rem' }}>
                                            Buy Now
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Product Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                            <X size={24} />
                        </button>
                        <h2 style={{ marginBottom: '1.5rem' }}>Add New Product</h2>
                        <form onSubmit={handleAddProduct}>
                            <div className="form-group">
                                <label className="form-label">Product Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    required
                                    value={newProduct.name}
                                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Image URL (Optional)</label>
                                <input
                                    type="url"
                                    className="form-input"
                                    placeholder="https://example.com/image.jpg"
                                    value={newProduct.imageUrl}
                                    onChange={e => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Pickup Address</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    required
                                    value={newProduct.address}
                                    onChange={e => setNewProduct({ ...newProduct, address: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select
                                        className="form-select"
                                        value={newProduct.category}
                                        onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                    >
                                        <option>Fashion</option>
                                        <option>Transport</option>
                                        <option>Home</option>
                                        <option>Education</option>
                                        <option>Electronics</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Condition</label>
                                    <select
                                        className="form-select"
                                        value={newProduct.condition}
                                        onChange={e => setNewProduct({ ...newProduct, condition: e.target.value })}
                                    >
                                        <option>New</option>
                                        <option>Good</option>
                                        <option>Used</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                                Submit Product
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GreenSwap;
