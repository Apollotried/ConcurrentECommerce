import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Products from "./products/Products.jsx";
import Category from "./categories/Category.jsx";



const CategoryPage = () => {
    const [openSidebarToggle, setOpenSidebarToggle] = useState(false);

    const OpenSidebar = () => {
        setOpenSidebarToggle(!openSidebarToggle);
    };

    return (
        <div className='container'>
            <Header OpenSidebar={OpenSidebar} />
            <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} />
            <Category />
        </div>
    );
};

export default CategoryPage;
