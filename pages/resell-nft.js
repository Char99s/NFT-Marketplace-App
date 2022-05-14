import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import axios from 'axios'
import Web3Modal from 'web3modal'

import {
    nftmarketaddress
} from '../config'

import NFTMarket from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'

export default function ResellNFT() {
  const [username, setUsername] = useState('')
  const [formInput, updateFormInput] = useState({ price: '', image: '' })
  const router = useRouter()
  const { id, tokenURI } = router.query
  const { image, name, price } = formInput

  useEffect(() => {
    const u = sessionStorage.getItem("username");
    setUsername(u)
    console.log("User in index is",u);
    fetchNFT()
  }, [id])

  async function fetchNFT() {
    if (!tokenURI) return
    const meta = await axios.get(tokenURI)
    updateFormInput(state => ({ ...state, image: meta.data.image, name: meta.data.name }))
  }

  async function listNFTForSale() {
    if (!price) return
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const priceFormatted = ethers.utils.parseUnits(formInput.price, 'ether')
    let contract = new ethers.Contract(nftmarketaddress, NFTMarket.abi, signer)
    let listingPrice = await contract.getListingPrice()

    listingPrice = listingPrice.toString()
    let transaction = await contract.resellToken(id, priceFormatted, { value: listingPrice })
    await transaction.wait()

    const userAddress = await signer.getAddress();
    console.log('got signer address', userAddress);
    const nftName = name;
    const cost = Math.floor(listingPrice)/1000000000000000000;
    const string = 'Sell';
    const user = username;

    const response = await fetch("/api/create-history", {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({username: user, userAddress: userAddress, nftName: nftName, string: string, cost: cost}),
    });

   
    router.push('/')
  }

  return (
    <div className="flex justify-center">
        <div className='border shadow overflow-hidden w-max h-200 hover:scale-105 hover:bg-gray-[50] hover:border-double hover:border-gray-400 duration-300 mt-[10%]'>
            <img className='mx-auto mt-2' src={image} style={{height: '225px', width: '225px'}}/>
            <div className='p-4'>
            <input
                placeholder="New Asset Price"
                className="mt-4 border-2 border-gray-200 rounded p-4 bg-gray-200 appearance-none w-full py-2 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-100"
                onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
            />
                <button onClick={listNFTForSale} className='w-full bg-gray-700 text-white font-bold py-2 rounded hover:scale-101 hover:bg-[#7366f0] duration-150 mt-4'>List for sale</button>
            </div>
        </div>
    </div>
  )
}