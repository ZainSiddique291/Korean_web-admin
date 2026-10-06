# SEORA Korean Skincare - Independent Admin Portal

A completely separate, professional administration dashboard for managing products, orders, inventory, and customer directories for the Korean Skincare E-commerce store.

## Architecture

- **Path**: `D:\New Volume\6 Projects all\E_commerce-admin`
- **Frontend Port**: `http://localhost:5174`
- **Centralized Shared Backend**: `http://localhost:5000`
- **Shared Database**: MongoDB Atlas (`ecom`)

## Features

- **Dashboard**: Live KPI metrics (Revenue, Orders, Products, Customers) with status distribution.
- **Products Catalog**: Create, Edit, and Delete skincare products with live MongoDB Atlas synchronization.
- **Orders Pipeline**: Real-time order inspection, shipping destination review, and fulfillment status changer (Pending, Processing, Shipped, Delivered, Cancelled).
- **Customers Directory**: Central customer registry with order counts, total spent, and contact details.
- **Responsive Layout**: Designed for Desktop, Laptop, Tablet, and Mobile with collapsible drawer navigation.

## Scripts

```bash
npm install    # Install dependencies
npm run dev    # Start Admin Panel dev server on port 5174
npm run build  # Build production admin bundle
```
