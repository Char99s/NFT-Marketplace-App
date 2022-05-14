import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import{
    nftmarketaddress
  } from '../config'
  import NFTMarket from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'

  export default function AdminSecret() {
    const [formInput, updateFormInput] = useState({ price: ''})
    const[addr,setAddr] = useState("");
    useEffect(() => {
        checkAddr()
    }, [])

    async function checkAddr(){
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const temp_addr = await signer.getAddress()
        setAddr(temp_addr)
    }

    async function updateListing(){
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()
      const price = ethers.utils.parseUnits(formInput.price, 'ether')
      let contract = new ethers.Contract(nftmarketaddress, NFTMarket.abi, signer)
      let transaction = await contract.updateListingPrice(price);
      await transaction.wait()
      let newListingPrice = await contract.getListingPrice()
      newListingPrice = newListingPrice.toString()
      console.log('Listing price updated: ' + newListingPrice)

      return(
        <h1>Listing price was successfully updated</h1>
      )
    }

    if(addr!='0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'){
        return(
            <div className="flex justify-center items-center min-h-screen" >
                <h1 className="px-10 py-5 text-4xl text-center text-red-400 ">Invalid Page</h1>
            </div>
        )
    }else{
    return(
        <div className="flex justify-center items-center min-h-screen" >
            <input
                style={{ fontFamily:'helvetica', float: 'left'}}
                placeholder="New listing price"
                className="border-2 border-gray-200 rounded p-4 bg-gray-200 appearance-none w-200 py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-100"
                onChange={e => updateFormInput({...formInput, price: e.target.value})}
            />
            <img className='float-right ml-1' src="/images/coins/ethereum.png" width="35px" alt="Ethereum"/>
            <button 
            style={{ fontFamily:'helvetica'}}
            onClick={updateListing}
            className="ml-4 border-gray-200 rounded p-4 bg-zinc-600 text-white appearance-none py-1 px-2 hover:scale-105 hover:bg-[#7366f0] duration-150 float-left"
            > Update </button>
            </div>

    )

    }
  }