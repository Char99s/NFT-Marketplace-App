import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import Link from 'next/link'

import {
    nftmarketaddress
} from '../config'

import NFTMarket from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'

export default function MyListedNfts() {
  const [username, setUsername] = useState('')
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    const u = sessionStorage.getItem("username");
    setUsername(u)
    console.log("User in index is",u);
    loadNFTs()
  }, [])

  async function logOut(){
    sessionStorage.setItem("username", '')
    const u = sessionStorage.getItem("username")
    console.log("session storage contains after logout: ", u )
    setUsername('')
    console.log("use state username variable contains ", username )
    router.reload()
  }

  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = await provider.getSigner()

    const contract = new ethers.Contract(nftmarketaddress, NFTMarket.abi, signer)
    const data = await contract.fetchItemsListed()

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await contract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
      }
      return item
    }))

    setNfts(items)
    setLoadingState('loaded') 
  }
  if (loadingState === 'loaded' && !nfts.length) return (
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
                <div className="md:ml-auto flex flex-wrap items-center text-base justify-center">
                  <Link href="/create-nft">
                    <a className="mr-7"> <p className="hover-underline-animation font-medium text-[#f9f9fa] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}}>Create</p></a>
                  </Link>
                  <Link href="/my-nfts">
                    <a className="mr-7"> <p className="hover-underline-animation font-medium text-[#f9f9fa] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}}>My Assets</p></a>
                  </Link>
                  <Link href="/my-listed-nfts">
                    <a className="mr-7"> <p className="font-medium text-[#7366f0] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}}>My Listings</p></a>
                  </Link>
                  <Link href="/my-history">
                    <a className="mr-7"> <p className="hover-underline-animation font-medium text-[#f9f9fa] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}}>My History</p></a>
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
  <div className='my-listings-container flex justify-center min-h-screen'>
    <h1 className="py-10 px-20 text-3xl text-white">No NFTs listed</h1>
  </div>
  </div>
  )
  return (
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
                <div className="md:ml-auto flex flex-wrap items-center text-base justify-center">
                  <Link href="/create-nft">
                    <a className="mr-7"> <p className="hover-underline-animation font-medium text-[#f9f9fa] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}}>Create</p></a>
                  </Link>
                  <Link href="/my-nfts">
                    <a className="mr-7"> <p className="hover-underline-animation font-medium text-[#f9f9fa] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}}>My Assets</p></a>
                  </Link>
                  <Link href="/my-listed-nfts">
                    <a className="mr-7"> <p className="font-medium text-[#7366f0] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}}>My Listings</p></a>
                  </Link>
                  <Link href="/my-history">
                    <a className="mr-7"> <p className="hover-underline-animation font-medium text-[#f9f9fa] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}}>My History</p></a>
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
    <div className='my-listings-container flex justify-center min-h-screen'>
      <div className="p-4">
          <h1 className="py-10 px-20 text-3xl text-white text-center">{nfts.length} Listings</h1>
        <div className='grid justify-center grid-cols-r sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6 '>
            {
              nfts.map((nft,i) =>(
                <div key={i} className='nft-container rounded-xl shadow overflow-hidden hover:scale-[1.02] duration-300 bg-[#2a2d50] w-fit h-fit mb-8'>
                  <img className='' src={nft.image} style={{ height:'275px', width:'375px', objectFit:'cover'}}/>
                  <div className=' py-4 mr-4' style={{ height:'auto', width: '100%' }}>
                    <p style={{height: 'auto' }} className='font-semibold select-none text-start text-white ml-4'>{nft.name}</p>
                    <div style={{ height: 'auto', overflow: 'hidden', }}>
                      <p className='text-gray-400 select-none text-start text-sm ml-6 mt-2'>{nft.description}</p>
                    </div>
                  </div>
                  <div className=''>
                    <div className='float-right'>
                      <p className='text-lg mb-3 font-bold text-[#9fa4dd] select-none float-left'>{nft.price} &nbsp; <img className='float-right mt-0.5 mr-4' src="/images/coins/ethereum.png" width="25px" alt="Ethereum"/></p>
                    </div>
                  </div>
                </div>
              ))
            }
        </div>
      </div>
    </div>
    </div>
  )
}