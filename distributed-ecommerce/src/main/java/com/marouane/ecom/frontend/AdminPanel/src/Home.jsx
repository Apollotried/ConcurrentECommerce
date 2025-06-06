import React, { useEffect, useState } from 'react'
import
{ BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill, BsFillBellFill}
 from 'react-icons/bs'
 import 
 { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } 
 from 'recharts';
import {fetchProductCount} from "./api/productApi.js";
import {fetchCustomerCounts} from "./api/customerApi.js";
import {fetchInventoryCounts} from "./api/inventoryApi.js";


function Home() {
    const [productCount, setProductCount] = useState(0);
    const [customerCount, setCustomerCount] = useState(0);
    const [inventoryCount, setInventoryCount] = useState(0);

    useEffect(() => {
        const getProductCount = async () => {
            try {
                const count = await fetchProductCount();
                setProductCount(count);
            }catch (error){
                console.error("Error fetching product count:", error);
            }
        }

        const getCustomerCount = async () => {
            try {
                const customerCount = await fetchCustomerCounts();
                setCustomerCount(customerCount.total);
            }catch (error){
                console.log("Error fetching customer count");
            }
        }

        const getInventoryCount = async () =>{
            try{
                const inventoryCount = await fetchInventoryCounts();
                setInventoryCount(inventoryCount.total);
            }catch (error){
                console.log("Error fetching inventory count")
            }
        }


        getProductCount();
        getCustomerCount();
        getInventoryCount();
    }, [])

    const data = [
        {
          name: 'Page A',
          uv: 4000,
          pv: 2400,
          amt: 2400,
        },
        {
          name: 'Page B',
          uv: 3000,
          pv: 1398,
          amt: 2210,
        },
        {
          name: 'Page C',
          uv: 2000,
          pv: 9800,
          amt: 2290,
        },
        {
          name: 'Page D',
          uv: 2780,
          pv: 3908,
          amt: 2000,
        },
        {
          name: 'Page E',
          uv: 1890,
          pv: 4800,
          amt: 2181,
        },
        {
          name: 'Page F',
          uv: 2390,
          pv: 3800,
          amt: 2500,
        },
        {
          name: 'Page G',
          uv: 3490,
          pv: 4300,
          amt: 2100,
        },
      ];
     

  return (
    <main className='main-container'>
        <div className='main-title'>
            <h3>DASHBOARD</h3>
        </div>

        <div className='main-cards'>
            <div className='card'>
                <div className='card-inner'>
                    <h3>PRODUCTS</h3>
                    <BsFillArchiveFill className='card_icon'/>
                </div>
                <h1>{productCount}</h1>
            </div>
            <div className='card'>
                <div className='card-inner'>
                    <h3>CUSTOMERS</h3>
                    <BsPeopleFill className='card_icon'/>
                </div>
                <h1>{customerCount}</h1>
            </div>
            <div className='card'>
                <div className='card-inner'>
                    <h3>Inventories</h3>
                    <BsFillBellFill className='card_icon'/>
                </div>
                <h1>{inventoryCount}</h1>
            </div>
        </div>

    </main>
  )
}

export default Home