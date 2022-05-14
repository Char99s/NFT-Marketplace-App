import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { useRouter } from "next/router"
import Web3Modal from 'web3modal'
import{
    nftmarketaddress
  } from '../config'
  import NFTMarket from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'

  export default function SearchNfts() {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [nfts, setNfts] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')
    useEffect(() => {
      const u = sessionStorage.getItem("username");
      setUsername(u)
      console.log("User in index is",u);
      loadNFTs()
    }, [])

    async function buyNft(nft) {
      /* needs the user to sign the transaction, so will use Web3Provider and sign it */
      const web3Modal = new Web3Modal({
        network: "mainnet",
        cacheProvider: true,
      });
      const connection = await web3Modal.connect();
      console.log('created connection');
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      console.log('created signer');
      const contract = new ethers.Contract(nftmarketaddress, NFTMarket.abi, signer);
      console.log('created contract');
      /* user will be prompted to pay the asking proces to complete the transaction */
      let listingPrice = await contract.getListingPrice();
      listingPrice = listingPrice.toString();
      let price = nft.price.toString();
      price = ethers.utils.parseUnits(price, 'ether');
      console.log('listing price is: ',listingPrice);
      console.log('price is: ',price.toString());
      let finalPrice = price.add(listingPrice);
      console.log('final price is: ',finalPrice.toString());
      const transaction = await contract.createMarketSale(nft.tokenId, {
        value: finalPrice
      });
  
      console.log('created transaction');
      await transaction.wait();
      const userAddress = await signer.getAddress();
      console.log('got signer address', userAddress);
      const nftName = nft.name;
      let cost = finalPrice.toString();
      let price2 = Number(cost);
      price2 = (price2/1000000000000000000);
      console.log('cost in transaction is', price2);
      const string = 'Buy';
      const user = username;
  
      const response = await fetch("/api/create-history", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({username: user, userAddress: userAddress, nftName: nftName, string: string, cost: price2}),
      });
  
      loadNFTs()
    }

      async function logOut(){
        sessionStorage.setItem("username", '')
        const u = sessionStorage.getItem("username")
        console.log("session storage contains after logout: ", u )
        setUsername('')
        console.log("use state username variable contains ", username )
        router.push('/')
      }

      async function loadNFTs() {
        /* create a generic provider and query for unsold market items 
        https://ropsten.infura.io/v3/d2f36673b14f403eb2fecbaa022bd076 */
        console.log("jsonrpc")
        const provider = new ethers.providers.JsonRpcProvider()
        const contract = new ethers.Contract(nftmarketaddress, NFTMarket.abi, provider)
        const data = await contract.fetchMarketItems()
    
        /*
        *  map over items returned from smart contract and format 
        *  them as well as fetch their token metadata
        */
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
            name: meta.data.name,
            description: meta.data.description,
          }
          return item
        }))
        setNfts(items)
        setLoadingState('loaded') 
      }

      async function searchNfts(searchString){
        console.log('search string is -' + searchString + '-')
        console.log("jsonrpc")
        const provider = new ethers.providers.JsonRpcProvider()
        const contract = new ethers.Contract(nftmarketaddress, NFTMarket.abi, provider)
        const data = await contract.fetchMarketItems()

        const items = await Promise.all(data.map(async i => {
            const tokenUri = await contract.tokenURI(i.tokenId)
            const meta = await axios.get(tokenUri)
            console.log(searchString.toLowerCase())
            console.log(meta.data.name + ' includes ' + searchString + '? ' + meta.data.name.includes(searchString))
            console.log(meta.data.description + ' includes ' + searchString + '? ' + meta.data.description.includes(searchString))
            if(meta.data.name.toLowerCase().includes(searchString.toLowerCase()) || meta.data.description.toLowerCase().includes(searchString.toLowerCase()) || meta.data.name.toUpperCase().includes(searchString.toUpperCase()) || meta.data.description.toUpperCase().includes(searchString.toUpperCase()) || meta.data.name.includes(searchString) || meta.data.description.includes(searchString)){
                let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
                let item = {
                price,
                tokenId: i.tokenId.toNumber(),
                seller: i.seller,
                owner: i.owner,
                image: meta.data.image,
                name: meta.data.name,
                description: meta.data.description,
                }
                console.log('item name is ' + item.name)
                return item
            }
          }))
          console.log('all items are: ' + JSON.stringify(items))
          if(items){
              const items2 = items.filter(function (el) {
                return el != null;
              });
              console.log('filtered items are: ' +  JSON.stringify(items2))
            setNfts(items2)
          }

      }


      if (nfts.length==0){
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
          <a className="mr-7"> <p className="hover-underline-animation font-medium text-[#f9f9fa] duration-[300ms] transform-gpu subpixel-antialiased " style={{ fontFamily:'arial'}}>Home</p></a>
        </Link>
        <Link href="/search-nfts">
        <a className="mr-7"> <p className="font-medium text-[#7366f0] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}}>Search</p></a>
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
        <div className="main-search-container min-h-screen" >
        <div className='search-container md:ml-auto md:mr-auto'>
          <input
            style={{ fontFamily:'helvetica', width:'25%', marginTop:'3%', marginLeft:'5%'}}
            placeholder="Search keyword..."
            className="mt-4 bg-[#2a2d50] border-gray-200 rounded p-4 bg-gray-200 appearance-none w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-100"
            onChange={e => searchNfts(e.target.value)}
        />
          </div>
            <h1 className="px-20 py-10 text-4xl text-center text-slate-400 ">0 NFTs</h1>
        </div>
        </div>
       )
    }else{

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
          <a className="mr-7"> <p className="hover-underline-animation font-medium text-[#f9f9fa] duration-[300ms] transform-gpu subpixel-antialiased " style={{ fontFamily:'arial'}}>Home</p></a>
        </Link>
        <Link href="/search-nfts">
        <a className="mr-7"> <p className="font-medium text-[#7366f0] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}}>Search</p></a>
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
      <div className="main-search-container min-h-screen" >
          <div className='search-container md:ml-auto md:mr-auto'>
          <input
            style={{ fontFamily:'helvetica', width:'25%', marginTop:'3%', marginLeft:'5%'}}
            placeholder="Search keyword..."
            className="mt-4 bg-[#2a2d50] border-gray-200 rounded p-4 bg-gray-200 appearance-none w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-100"
            onChange={e => searchNfts(e.target.value)}
        />
          </div>
          <h1 className="px-20 py-10 text-4xl text-center text-slate-400 ">{nfts.length} NFTs</h1>

      <div style={{ height: 'auto'}} className='pt-6'>
      <div className='flex justify-center '>
        <div className='px-4 pb-6 float-left ' style={ { maxWidth: '1600px'}}>
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
                    <button className='w-full bg-[#7366f0] text-white font-bold py-2 px-12 hover:bg-white hover:text-[#9fa4dd] duration-150' onClick={() => buyNft(nft)}>Buy</button>
                  </div>
                </div>
              ))
            }
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
      )
        }

}