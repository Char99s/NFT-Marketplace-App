import { useState,useEffect } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useRouter } from "next/router";
import Web3Modal from "web3modal";
import Link from 'next/link'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import {
    nftmarketaddress
  } from '../config'
  
  import NFTMarket from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
  
  export default function CreateItem() {
    const [username, setUsername] = useState('')
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
    const router = useRouter()
    useEffect(() => {
      const u = sessionStorage.getItem("username");
      setUsername(u)
      console.log("User in index is",u);
    }, [])
  
    async function logOut(){
      sessionStorage.setItem("username", '')
      const u = sessionStorage.getItem("username")
      console.log("session storage contains after logout: ", u )
      setUsername('')
      console.log("use state username variable contains ", username )
      router.push('/')
    }
    
    async function onChange(e) {
      const file = e.target.files[0]
      try {
        const added = await client.add(
          file,
          {
            progress: (prog) => console.log(`received: ${prog}`)
          }
        )
        const url = `https://ipfs.infura.io/ipfs/${added.path}`
        setFileUrl(url)
      } catch (error) {
        console.log('Error uploading file: ', error)
      }  
    }

    async function uploadToIPFS() {
      const { name, description, price } = formInput
      if (!name || !description || !price || !fileUrl) return
      /* first, upload to IPFS */
      const data = JSON.stringify({
        name, description, image: fileUrl
      })
      try {
        const added = await client.add(data)
        const url = `https://ipfs.infura.io/ipfs/${added.path}`
        /* after file is uploaded to IPFS, return the URL to use it in the transaction */
        console.log('file uploaded successfully');
        return url
      } catch (error) {
        console.log('Error uploading file: ', error)
      }
    }
  
    async function listNFTForSale() {
      const url = await uploadToIPFS()
      const web3Modal = new Web3Modal({
        network: "mainnet",
        cacheProvider: true,
      })
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()
      const userAddress = await signer.getAddress();
      console.log('got signer address', userAddress)
      /* next, create the item */
      const price = ethers.utils.parseUnits(formInput.price, 'ether')
      console.log('parsed units')
      let contract = new ethers.Contract(nftmarketaddress, NFTMarket.abi, signer)
      console.log('created nftmarket contract')
      let listingPrice = await contract.getListingPrice()
      listingPrice = listingPrice.toString()
      console.log('got listingprice and converted it with value: ', Math.floor(listingPrice)/1000000000000000000 )
      let transaction = await contract.createToken(url, price, { value: listingPrice })
      console.log('got transaction',transaction)
      await transaction.wait()

      const nftName = formInput.name;
      const cost = Math.floor(listingPrice)/1000000000000000000;
      const string = 'NFT Creation';
      const user = username;
      
      const response = await fetch("/api/create-history", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({username: user, userAddress: userAddress, nftName: nftName, string: string, cost: cost}),
    });
    
      router.push('/')

        /*

        let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
        let transaction = contract.createToken(url)
        let tx = await transaction

        let event = tx.events[0]
        let value = event.args[2]
        let tokenId = value.toNumber()

        const price = ethers.utils.parseUnits(formInput.price, 'ether')

        contract = new ethers.Contract(nftmarketaddress, NFTMarket.abi, signer)
        let listingPrice = await contract.getListingPrice()
        listingPrice = listingPrice.toString()

        transaction = await contract.createMarketItem(
            nftaddress, tokenId, price, { value: listingPrice}
        )

        await transaction.wait()
        router.push('/')

         bg-gradient-to-r from-violet-500 to-fuchsia-500
        */

    }

    return(
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
                  <a className="mr-7"> <p className="font-medium text-[#7366f0] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}}>Create</p></a>
                  </Link>
                  <Link href="/my-nfts">
                  <a className="mr-7"> <p className="hover-underline-animation font-medium text-[#f9f9fa] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}}>My Assets</p></a>
                  </Link>
                  <Link href="/my-listed-nfts">
                  <a className="mr-7"> <p className="hover-underline-animation font-medium text-[#f9f9fa] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}}>My Listings</p></a>
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
          <div className='flex justify-center min-h-screen'>
          <img className="w-full select-none" src="images/Display/background-create.jpg" alt="this slowpoke moves" />
            <div className="absolute flex justify-center">
                <div className=" flex flex-col pb-12">
                    <h1 style={{ fontFamily:'helvetica'}} className="mt-4 px-20 py-10 text-4xl text-center text-white select-none">List your NFT for sale</h1>
                    <input
                      style={{ fontFamily:'helvetica'}}
                        placeholder="Asset Name"
                        className="mt-4 border-2 border-gray-200 rounded p-4 bg-gray-200 appearance-none w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-100"
                        onChange={e => updateFormInput({...formInput, name: e.target.value})}
                    />
                    <textarea
                        style={{ fontFamily:'helvetica'}}
                        placeholder="Asset Description"
                        className="mt-4 border-2 border-gray-200 rounded p-4 bg-gray-200 appearance-none w-full py-4 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-100 resize-none"
                        onChange={e => updateFormInput({...formInput, description: e.target.value})}
                    />
                    <input
                        style={{ fontFamily:'helvetica'}}
                        type="file"
                        className="mt-4 border-2 border-gray-200 rounded p-4 bg-gray-200 appearance-none w-full py-6 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-100"
                        onChange={onChange}
                    />
                    {
                        !fileUrl && (
                            <label className="mt-2 text-purple-300 select-none">Your asset image: </label>
                        )
                    }
                    {
                        !fileUrl && (
                            <img className="rounded mt-4" height="100" width="100" src={fileUrl} />
                        )
                    }
                    {
                        fileUrl && (
                            <label className="mt-2 text-purple-300 select-none">Your asset image: </label>
                        )
                    }
                    {
                        fileUrl && (
                            <img className="rounded mt-4" style={{ objectFit:'cover' }} height="100" width="100" src={fileUrl} />
                        )
                    }
                    <input
                        style={{ fontFamily:'helvetica'}}
                        placeholder="Your asset Price "
                        className="mt-4 border-2 border-gray-200 rounded p-4 bg-gray-200 appearance-none w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-100"
                        onChange={e => updateFormInput({...formInput, price: e.target.value})}
                    />
                    <button 
                    style={{ fontFamily:'helvetica'}}
                    onClick={listNFTForSale}
                    className="w-48 mt-4 ml-auto mr-auto border-gray-200 rounded p-4 bg-zinc-600 text-white appearance-none py-2 px-4 hover:scale-105 hover:bg-gray-200 hover:text-gray-700 duration-150"
                    >
                        Create Digital Asset
                    </button>
                </div>
            </div>
            </div>
            </div>
    )

}