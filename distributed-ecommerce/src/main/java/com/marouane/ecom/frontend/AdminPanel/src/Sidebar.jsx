import React from 'react'
import 
{BsCart3, BsGrid1X2Fill, BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill, 
  BsListCheck, BsMenuButtonWideFill, BsFillGearFill}
 from 'react-icons/bs'

function Sidebar({openSidebarToggle, OpenSidebar}) {
  return (
    <aside id="sidebar" className={openSidebarToggle ? "sidebar-responsive": ""}>
        <div className='sidebar-title'>
            <div className='sidebar-brand'>
                <BsCart3  className='icon_header'/> SHOP
            </div>
            <span className='icon close_icon' onClick={OpenSidebar}>X</span>
        </div>

        <ul className='sidebar-list'>

            <li className='sidebar-list-item'>
                <a href="/admin">
                    <BsGrid1X2Fill className='icon'/> Dashboard
                </a>
            </li>

            <li className='sidebar-list-item'>
                <a href="/admin/product">
                    <BsFillArchiveFill className='icon'/> Products
                </a>
            </li>

            <li className='sidebar-list-item'>
                <a href="/admin/inventory">
                    <BsListCheck className='icon'/> Inventory
                </a>
            </li>

            <li className='sidebar-list-item'>
                <a href="/admin/customer">
                    <BsPeopleFill className='icon'/> Customers
                </a>
            </li>

        </ul>
    </aside>
  )
}

export default Sidebar