import React from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  url: string;
  in_stock?: boolean;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.image_url} alt={product.name} />
      </div>
      <div className="product-info">
        <h4 className="product-name">{product.name}</h4>
        <div className="product-price">Rs. {product.price.toLocaleString()}</div>
        <a 
          href={product.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn-view"
        >
          View on Kapruka
        </a>
      </div>

      <style jsx>{`
        .product-card {
          display: flex;
          flex-direction: column;
          background: #fff;
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius);
          overflow: hidden;
          width: 220px;
          flex-shrink: 0;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.06);
        }
        .product-image {
          width: 100%;
          height: 180px;
          background: var(--color-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .product-info {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .product-name {
          font-size: 14px;
          margin-bottom: 8px;
          color: var(--color-foreground);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
          height: 39px;
        }
        .product-price {
          font-weight: 700;
          color: var(--color-accent);
          font-size: 16px;
          margin-bottom: 16px;
          margin-top: auto;
        }
        .btn-view {
          display: block;
          text-align: center;
          background: var(--color-muted);
          color: var(--color-accent);
          padding: 8px;
          border-radius: var(--border-radius-pill);
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          border: 1px solid transparent;
        }
        .btn-view:hover {
          background: var(--color-accent);
          color: #fff;
        }
      `}</style>
    </div>
  );
}
