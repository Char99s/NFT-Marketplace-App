import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function MyAssets() {
  const [transactions, setTransactions] = useState([])
  const [username, setUsername] = useState('')
  const router = useRouter()
  useEffect(() => {
    const u = sessionStorage.getItem("username");
    setUsername(u)
    console.log("User in history is",u);
    loadTransactions()
  }, [])

  async function logOut(){
    sessionStorage.setItem("username", '')
    const u = sessionStorage.getItem("username")
    console.log("session storage contains after logout: ", u )
    setUsername('')
    console.log("use state username variable contains ", username )
    router.reload()
  }

  async function loadTransactions() {
    const userToFetch = sessionStorage.getItem("username");
    console.log("loading transactions for:",userToFetch)
    const response = await fetch("/api/fetch-history", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({userToFetch}),
    });
    console.log(response.status)
    const obj = await response.json()
    console.log(obj.transactions)
    const transactionsFinal=obj.transactions.reverse()
    setTransactions(transactionsFinal)
  }
  

  if (!transactions.length) return (
    <div>
    <header className="header fit-content">
  <div className="navbar mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center h-18">
      <Link href="/">
        <a className="flex font-medium items-center text-white mb-4 md:mb-0 hover:scale-[0.9] duration-300">
          <img src="/images/logo.png" width="250px" style={{float:'left'}}/>
        </a>
      </Link>
    <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center" style={{float:'right'}}>
      <Link href="/">
        <a className="mr-7"> <p className="hover-underline-animation font-medium text-[#f9f9fa] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}}>Home</p></a>
      </Link>
      <Link href="/search-nfts">
      <a className="mr-7"> <p className="hover-underline-animation font-medium text-[#f9f9fa] duration-[300ms] transform-gpu subpixel-antialiased " style={{ fontFamily:'arial'}}>Search</p></a>
      </Link> 
      {
        username && (
              <div className="navbar mx-auto flex flex-wrap flex-col md:flex-row items-center h-18">
                <Link href="/create-nft">
                <a className="mr-7"> <p className="hover-underline-animation font-medium text-[#f9f9fa] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}}>Create</p></a>
                </Link>
                <Link href="/my-nfts">
                <a className="mr-7"> <p className="hover-underline-animation font-medium text-[#f9f9fa] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}}>My Assets</p></a>
                </Link>
                <Link href="/my-listed-nfts">
                <a className="mr-7"> <p className="hover-underline-animation font-medium text-[#f9f9fa] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}}>My Listings</p></a>
                </Link>
                <Link href="/my-history">
                <a className="mr-7"> <p className="font-medium text-[#7366f0] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}}>My History</p></a>
                </Link>
                <Link href="/">
                <a className="mr-2"> <button className="rounded-xl hover:text-[#7366f0] hover:bg-white py-2 px-4 bg-[#7366f0] font-medium text-[#f9f9fa] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}} onClick={logOut}>Logout</button></a>
                </Link>
              </div>
          )
      }
      {
        !username && (
          <div>
          <Link href="/sign-up">
            <a className="mr-2"> <button className="rounded-xl hover:text-[#7366f0] hover:bg-white py-2 px-4 bg-[#7366f0] font-medium text-[#f9f9fa] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}}>Register</button></a>
          </Link>
          <Link href="/log-in">
            <a className="mr-7"> <button className="rounded-xl hover:text-[#7366f0] hover:bg-white py-2 px-4 bg-[#7366f0] font-medium text-[#f9f9fa] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}}>Log in</button></a>
          </Link>
        </div>
          )
      }
    </nav>
  </div>
</header>
    <div className="history-container flex justify-center min-h-screen">
      <h1 className="py-10 px-20 text-3xl text-white">No Transactions...</h1>
    </div>
    </div>
  )
  else return (
    <div>
    <header className="header fit-content">
  <div className="navbar mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center h-18">
      <Link href="/">
        <a className="flex font-medium items-center text-white mb-4 md:mb-0 hover:scale-[0.9] duration-300">
          <img src="/images/logo.png" width="250px" style={{float:'left'}}/>
        </a>
      </Link>
    <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center" style={{float:'right'}}>
      <Link href="/">
        <a className="mr-7"> <p className="hover-underline-animation font-medium text-[#f9f9fa] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}}>Home</p></a>
      </Link>
      <Link href="/search-nfts">
      <a className="mr-7"> <p className="hover-underline-animation font-medium text-[#f9f9fa] duration-[300ms] transform-gpu subpixel-antialiased " style={{ fontFamily:'arial'}}>Search</p></a>
      </Link> 
      {
        username && (
              <div className="navbar mx-auto flex flex-wrap flex-col md:flex-row items-center h-18">
                <Link href="/create-nft">
                <a className="mr-7"> <p className="hover-underline-animation font-medium text-[#f9f9fa] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}}>Create</p></a>
                </Link>
                <Link href="/my-nfts">
                <a className="mr-7"> <p className="hover-underline-animation font-medium text-[#f9f9fa] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}}>My Assets</p></a>
                </Link>
                <Link href="/my-listed-nfts">
                <a className="mr-7"> <p className="hover-underline-animation font-medium text-[#f9f9fa] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}}>My Listings</p></a>
                </Link>
                <Link href="/my-history">
                <a className="mr-7"> <p className="font-medium text-[#7366f0] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}}>My History</p></a>
                </Link>
                <Link href="/">
                <a className="mr-2"> <button className="rounded-xl hover:text-[#7366f0] hover:bg-white py-2 px-4 bg-[#7366f0] font-medium text-[#f9f9fa] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}} onClick={logOut}>Logout</button></a>
                </Link>
              </div>
          )
      }
      {
        !username && (
          <div>
          <Link href="/sign-up">
            <a className="mr-2"> <button className="rounded-xl hover:text-[#7366f0] hover:bg-white py-2 px-4 bg-[#7366f0] font-medium text-[#f9f9fa] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}}>Register</button></a>
          </Link>
          <Link href="/log-in">
            <a className="mr-7"> <button className="rounded-xl hover:text-[#7366f0] hover:bg-white py-2 px-4 bg-[#7366f0] font-medium text-[#f9f9fa] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}}>Log in</button></a>
          </Link>
        </div>
          )
      }
    </nav>
  </div>
</header>
    <div className="history-container justify-center min-h-screen">
        <div className='w-full h-fit'>
      <h1 className="py-10 px-20 text-3xl text-center text-white">{transactions.length} Transaction(s)</h1>
      </div>
      <div className='w-full h-fit'>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
    <table className="w-3/4 text-sm text-left text-gray-500 dark:text-gray-400 md:ml-auto md:mr-auto rounded">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" className="px-6 py-3">
                    Wallet address
                </th>
                <th scope="col" className="px-6 py-3">
                    Type
                </th>
                <th scope="col" className="px-6 py-3">
                    NFT
                </th>
                <th scope="col" className="px-6 py-3">
                    Cost
                </th>
                <th scope="col" className="px-6 py-3">
                    Date
                </th>
            </tr>
        </thead>
        <tbody>
        {
              transactions.map((transaction,i) =>(
            <tr key={i} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {transaction.userAddress}
                </th>
                <td className="px-6 py-4">
                    {transaction.string}
                </td>
                <td className="px-6 py-4">
                    {transaction.nftName}
                </td>
                <td className="px-6 py-4">
                    {transaction.cost}
                </td>
                <td className="px-6 py-4">
                    {transaction.createdAt}
                </td>
            </tr>
              ))
            }
        </tbody>
    </table>
    </div>
    </div>
    </div>
    </div>
  )
}

/*

<table className='border border-slate-400'>
        <tr>
            <th className='border border-slate-300'>From</th>
            <th className='border border-slate-300'>Type</th>
            <th className='border border-slate-300'>NFT</th>
            <th className='border border-slate-300'>Cost</th>
            <th className='border border-slate-300'>Date</th>
        </tr>
        {
              transactions.map((transaction,i) =>(
                <div key={i}>
        <tr>
            <td className='border border-slate-300'>{transaction.userAddress}</td>
            <td className='border border-slate-300'>{transaction.string}</td>
            <td className='border border-slate-300'>{transaction.nftName}</td>
            <td className='border border-slate-300'>{transaction.cost}</td>
            <td className='border border-slate-300'>{transaction.createdAt}</td>
        </tr>
                </div>
              ))
        }
        </table>

        */