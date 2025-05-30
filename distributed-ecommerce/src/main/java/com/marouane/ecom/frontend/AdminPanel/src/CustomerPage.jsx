import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

import Customer from "./customers/Customer.jsx";



const CustomerPage = () => {
    const [openSidebarToggle, setOpenSidebarToggle] = useState(false);

    const OpenSidebar = () => {
        setOpenSidebarToggle(!openSidebarToggle);
    };

    return (
        <div className='container'>
            <Header OpenSidebar={OpenSidebar} />
            <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar} />
            <Customer />
        </div>
    );
};

export default CustomerPage;
