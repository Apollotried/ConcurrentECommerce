import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Products from "./products/Products.jsx";



const ProductPage = () => {
    const [openSidebarToggle, setOpenSidebarToggle] = useState(false);

    const OpenSidebar = () => {
        setOpenSidebarToggle(!openSidebarToggle);
    };

    return (
        <div className='container'>
            <Header OpenSidebar={OpenSidebar} />
            <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} />
            <Products />
        </div>
    );
};

export default ProductPage;
