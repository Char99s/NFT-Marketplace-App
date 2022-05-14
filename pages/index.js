import { ethers } from 'ethers'
import { useEffect,useState } from 'react'
import axios from 'axios';
import Web3Modal from 'web3modal'
import { useRouter } from "next/router"
import Link from 'next/link'

import{
  nftmarketaddress
} from '../config'

import NFTMarket from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'



export default function Home() {
  const [username, setUsername] = useState('')
  const [nfts, setNfts] = useState([])
  const router = useRouter()
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
    
    let items2 = [];
    if(items.length>6){
      items2 = items.slice(0,6)
    }else{
      items2 = items
    }
    setNfts(items2)
  }

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

  //if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-4xl text-center text-slate-400 ">No listings yet</h1>)

  /* 
              <p style={{ fontFamily:'arial', marginBottom:'2px',fontSize:'32px', color:'#EDEDED', fontWeight:'bold'}} >Find The Most Creative <span style={{ color:'#7366f0', fontSize:'36px' }}> NFT</span>s</p>
          <p style={{ fontFamily:'arial', marginBottom:'10px',fontSize:'25px', color:'#EDEDED', fontWeight:'bold'}} >By world best Galactic <span style={{ color:'#7366f0' }}> NFT</span> market</p>
          <p style={{ fontFamily:'arial', marginBottom:'2px',fontSize:'22px', color:'#EDEDED', fontWeight:'lighter'}} >An <span style={{ color:'#7366f0' }}> NFT</span> is a unit of data stored on a digital ledger called</p>
          <p style={{ fontFamily:'arial', marginBottom:'5px',fontSize:'22px', color:'#EDEDED', fontWeight:'lighter', overflow:'visible'}} >blockchain, that certifies a digital asset to be unique and</p>
          <p style={{ fontFamily:'arial', marginBottom:'5px',fontSize:'22px', color:'#EDEDED', fontWeight:'lighter', overflow:'visible'}} >therefore not interchangeable</p>
  */


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
          <a className="mr-7"> <p className="font-medium text-[#7366f0] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}}>Home</p></a>
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
    <div className="main-container min-h-screen" >
      <div className='bg-img-container' style={{height: "500px", width:'100%'}}>
        <div className='header-card select-none duration-300 object-cover' style={{ position: 'absolute', width:'fit-content' , height:'fit-content', marginTop:'15%', float:'left', marginLeft:'6%', overflow:'hidden'}}>
          <h1 style={{ fontFamily:'arial', fontSize:'36px', color:'#EDEDED', marginBottom:'-15px' , fontWeight:'bold'}}>Explore, buy, and sell extraordinary</h1>
          <h1 style={{ fontFamily:'arial', fontSize:'36px', color:'#EDEDED', fontWeight:'bold'}}><span style={{fontSize:'42px', color:'#7366f0' }}> NFT</span>s</h1>
          <h1 style={{ fontFamily:'arial', fontSize:'24px', color:'#EDEDED', fontWeight:'bold'}}>Galactic <span style={{ color:'#7366f0' }}> NFT</span> is one of the best</h1>
          <h1 style={{ fontFamily:'arial', fontSize:'24px', color:'#EDEDED', fontWeight:'bold'}}><span style={{ color:'#7366f0' }}> NFT</span> markets in the world</h1>
          <Link href='/search-nfts'><button className='bg-[#7366f0] mt-4 text-white font-bold py-2 px-8 rounded duration-150 hover:brightness-75'> Explore</button></Link>
        </div>
      </div>

      <div style={{ height: 'auto'}} className='bg-container pt-8 pb-6'>
        <div className='w-full flex justify-center'>
          <h1 className='main-title select-none hover:scale-[1.05] duration-300' style={{width:'fit-content', fontFamily:'DM sans, Helvetica, Arial, sans-serif', marginBottom:'1px',fontSize:'45px', color:'white', fontWeight:'normal', textAlign:'center' }}>Newest</h1>
        </div>
      <div className='flex justify-center pt-4'>
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

            {
              /*Static content*/
            }

                <div className='nft-container rounded-xl shadow overflow-hidden hover:scale-[1.02] duration-300 bg-[#2a2d50] w-fit h-fit mb-8'>
                  <img className='' src="/images/nft-images/static-5.jpg" style={{ height:'275px', width:'375px', objectFit:'cover'}}/>
                  <div className=' py-4 mr-4' style={{ height:'auto', width: '100%' }}>
                    <p style={{height: 'auto' }} className='font-semibold select-none text-start text-white ml-4'>Space</p>
                    <div style={{ height: 'auto', overflow: 'hidden', }}>
                      <p className='text-gray-400 select-none text-start text-sm ml-6 mt-2'>This is a space</p>
                    </div>
                  </div>
                  <div className=''>
                    <div className='float-right'>
                      <p className='text-lg mb-3 font-bold text-[#9fa4dd] select-none float-left'>0.005 &nbsp; <img className='float-right mt-0.5 mr-4' src="/images/coins/ethereum.png" width="25px" alt="Ethereum"/></p>
                    </div>
                    <button className='w-full bg-[#7366f0] text-white font-bold py-2 px-12 hover:bg-white hover:text-[#9fa4dd] duration-150' onClick={() => buyNft(nft)}>Buy</button>
                  </div>
                </div>

                <div className='nft-container rounded-xl shadow overflow-hidden hover:scale-[1.02] duration-300 bg-[#2a2d50] w-fit h-fit mb-8'>
                  <img className='' src="/images/nft-images/static-6.jpg" style={{ height:'275px', width:'375px', objectFit:'cover'}}/>
                  <div className=' py-4 mr-4' style={{ height:'auto', width: '100%' }}>
                    <p style={{height: 'auto' }} className='font-semibold select-none text-start text-white ml-4'>Space</p>
                    <div style={{ height: 'auto', overflow: 'hidden', }}>
                      <p className='text-gray-400 select-none text-start text-sm ml-6 mt-2'>This is a space</p>
                    </div>
                  </div>
                  <div className=''>
                    <div className='float-right'>
                      <p className='text-lg mb-3 font-bold text-[#9fa4dd] select-none float-left'>0.005 &nbsp; <img className='float-right mt-0.5 mr-4' src="/images/coins/ethereum.png" width="25px" alt="Ethereum"/></p>
                    </div>
                    <button className='w-full bg-[#7366f0] text-white font-bold py-2 px-12 hover:bg-white hover:text-[#9fa4dd] duration-150' onClick={() => buyNft(nft)}>Buy</button>
                  </div>
                </div>

                <div className='nft-container rounded-xl shadow overflow-hidden hover:scale-[1.02] duration-300 bg-[#2a2d50] w-fit h-fit mb-8'>
                  <img className='' src="/images/nft-images/static-7.jpg" style={{ height:'275px', width:'375px', objectFit:'cover'}}/>
                  <div className=' py-4 mr-4' style={{ height:'auto', width: '100%' }}>
                    <p style={{height: 'auto' }} className='font-semibold select-none text-start text-white ml-4'>Space</p>
                    <div style={{ height: 'auto', overflow: 'hidden', }}>
                      <p className='text-gray-400 select-none text-start text-sm ml-6 mt-2'>This is a space</p>
                    </div>
                  </div>
                  <div className=''>
                    <div className='float-right'>
                      <p className='text-lg mb-3 font-bold text-[#9fa4dd] select-none float-left'>0.005 &nbsp; <img className='float-right mt-0.5 mr-4' src="/images/coins/ethereum.png" width="25px" alt="Ethereum"/></p>
                    </div>
                    <button className='w-full bg-[#7366f0] text-white font-bold py-2 px-12 hover:bg-white hover:text-[#9fa4dd] duration-150' onClick={() => buyNft(nft)}>Buy</button>
                  </div>
                </div>

                <div className='nft-container rounded-xl shadow overflow-hidden hover:scale-[1.02] duration-300 bg-[#2a2d50] w-fit h-fit mb-8'>
                  <img className='' src="/images/nft-images/anim-3.webp" style={{ height:'275px', width:'375px', objectFit:'cover'}}/>
                  <div className=' py-4 mr-4' style={{ height:'auto', width: '100%' }}>
                    <p style={{height: 'auto' }} className='font-semibold select-none text-start text-white ml-4'>Space</p>
                    <div style={{ height: 'auto', overflow: 'hidden', }}>
                      <p className='text-gray-400 select-none text-start text-sm ml-6 mt-2'>This is a space</p>
                    </div>
                  </div>
                  <div className=''>
                    <div className='float-right'>
                      <p className='text-lg mb-3 font-bold text-[#9fa4dd] select-none float-left'>0.005 &nbsp; <img className='float-right mt-0.5 mr-4' src="/images/coins/ethereum.png" width="25px" alt="Ethereum"/></p>
                    </div>
                    <button className='w-full bg-[#7366f0] text-white font-bold py-2 px-12 hover:bg-white hover:text-[#9fa4dd] duration-150' onClick={() => buyNft(nft)}>Buy</button>
                  </div>
                </div>

                <div className='nft-container rounded-xl shadow overflow-hidden hover:scale-[1.02] duration-300 bg-[#2a2d50] w-fit h-fit mb-8'>
                  <img className='' src="/images/nft-images/anim-2.webp" style={{ height:'275px', width:'375px', objectFit:'cover'}}/>
                  <div className=' py-4 mr-4' style={{ height:'auto', width: '100%' }}>
                    <p style={{height: 'auto' }} className='font-semibold select-none text-start text-white ml-4'>Space</p>
                    <div style={{ height: 'auto', overflow: 'hidden', }}>
                      <p className='text-gray-400 select-none text-start text-sm ml-6 mt-2'>This is a space</p>
                    </div>
                  </div>
                  <div className=''>
                    <div className='float-right'>
                      <p className='text-lg mb-3 font-bold text-[#9fa4dd] select-none float-left'>0.005 &nbsp; <img className='float-right mt-0.5 mr-4' src="/images/coins/ethereum.png" width="25px" alt="Ethereum"/></p>
                    </div>
                    <button className='w-full bg-[#7366f0] text-white font-bold py-2 px-12 hover:bg-white hover:text-[#9fa4dd] duration-150' onClick={() => buyNft(nft)}>Buy</button>
                  </div>
                </div>
                
                </div>
              </div>
          </div>
          <div className='w-full flex justify-center'>
            <Link href='/search-nfts'>
            <button className='view-more-button w-50 bg-[#7366f0] text-white font-bold py-2 px-4 rounded duration-300'>View More</button>
            </Link>
          </div>
      </div>
      <div className='helper'>
        <div className='w-full flex justify-center'>
          <h1 className='main-title select-none hover:scale-[1.05] duration-300' style={{width:'fit-content', fontFamily:'arial',marginTop:'1rem', marginBottom:'1px',fontSize:'45px', color:'white', fontWeight:'normal', textAlign:'center' }}>Create and sell your NFTs</h1>
        </div>
        <div className='grid justify-center grid-cols-r sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6 ml-16 mr-16 mt-2'>
            <div className='helper-container'>
              <div className='helper-image-container'>
                <img src='/images/wallet.png' style={{width: '45px'}}/>
              </div>
              <div className='helper-text-container select-none'>
                <h1 style={{width:'fit-content', fontFamily:'arial', marginBottom:'1px',fontSize:'24px', color:'white', fontWeight:'normal'}}>Set up your wallet</h1>
                <h3 style={{width:'fit-content', fontFamily:'arial', marginTop:'10px',fontSize:'16px', color:'#9fa4dd', fontWeight:'normal'}}>Add your metamask wallet to your account to enjoy all our features! You can use multiple wallets to a single account.</h3>
                <h4 style={{width:'fit-content', fontFamily:'arial', fontSize:'16px', color:'#9fa4dd', fontWeight:'normal'}}>Please note that when you visit &apos;My Assets&apos; and &apos;My Listings&apos; tab, the NFTs will be shown based on your connect wallet.</h4>
              </div>
            </div>

            <div className='helper-container'>
              <div className='helper-image-container'>
                <img src='/images/cloud.png' style={{width: '45px'}}/>
              </div>
              <div className='helper-text-container select-none'>
                <h1 style={{width:'fit-content', fontFamily:'arial', marginBottom:'1px',fontSize:'24px', color:'white', fontWeight:'normal'}}>Add your NFTs</h1>
                <h3 className='hover:text-white' style={{width:'fit-content', fontFamily:'arial', marginTop:'10px',fontSize:'16px', color:'#9fa4dd', fontWeight:'normal'}}>Create your own NFT under the &apos;Create&apos; section with your own image.</h3>
                <h3 className='hover:text-white' style={{width:'fit-content', fontFamily:'arial', fontSize:'16px', color:'#9fa4dd', fontWeight:'normal'}}>Once you create an NFT it will become available for other users to collect. You can view it in the &apos;My Listings&apos; section.</h3>
              </div>
            </div>

            <div className='helper-container'>
              <div className='helper-image-container'>
                <img src='/images/price-tag.png' style={{width: '45px'}}/>
              </div>
              <div className='helper-text-container select-none'>
                <h1 style={{width:'fit-content', fontFamily:'arial', marginBottom:'1px',fontSize:'24px', color:'white', fontWeight:'normal'}}>Sell your NFTs</h1>
                <h3 style={{width:'fit-content', fontFamily:'arial', marginTop:'10px',fontSize:'16px', color:'#9fa4dd', fontWeight:'normal'}}>You can view the NFTs you own in the &apos;My Assets&apos; section. You can re-sell your NFTs anytime with the price of your choice. Please note that buying or listing an NFT is subject to listing fees + gas fees.</h3>
              </div>
            </div>
        </div>
      </div>
      </div>
    </div>

    
  )

  
}

    /*
    <div className='w-full'>
      <div className='flex justify-center h-[43rem]'>
        <img className="w-full select-none" src="images/Display/background-genshin.jpeg" alt="this slowpoke moves"/>
          <div className="absolute rounded-2xl text-white mt-[10rem] motion-safe:animate-fadeIn bg-gray-900 bg-opacity-30 select-none p-10 hover:scale-[1.15] hover:bg-[#7366f0] hover:bg-opacity-80 duration-500">
            <p className='text-4xl sans-serif antialiased font-light mb-3 text-center'>Explore</p>
            <p className='text-2xl sans-serif antialiased font-light mb-3 text-center'>Explore our listed NFTs</p>
            <p className='text-4xl sans-serif antialiased font-light mb-3 text-center'>Buy</p>
            <p className='text-2xl sans-serif antialiased font-light mb-3 text-center'>Buy your favorite NFTs and become the unique owner</p>
            <p className='text-4xl sans-serif antialiased font-light mb-3 text-center'>Create</p>
            <p className='text-2xl sans-serif antialiased font-light mb-3 text-center'>Create and sell NFTs</p>
          </div>
      </div>

      <div className='flex justify-center h-24'>
        <h1 className='motion-safe:animate-fadeIn text-6xl mt-6 select-none'>Explore NFTs</h1>
      </div>

      <div className='flex justify-center'>
        <div className='px-4 pb-6 float-left' style={ { maxWidth: '1600px'}}>
          <div className='grid grid-cols-r sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6'>
            {
              nfts.map((nft,i) =>(
                <div key={i} className='border border-[#2e3445] shadow overflow-hidden h-200 hover:scale-105 hover:rounded-none duration-300'>
                  <img className='mx-auto' src={nft.image} style={{height: '225px', width: '225px'}}/>
                  <div className='p-4' style={{ height: 'auto' }}>
                    <p style={{height: 'auto' }} className='font-semibold select-none text-start'>{nft.name}</p>
                    <div style={{ height: 'auto', overflow: 'hidden' }}>
                      <p className='text-gray-600 select-none text-start text-sm'>{nft.description}</p>
                    </div>
                  </div>
                  <div className='p-4'>
                    <div className='float-right'>
                      <p className='text-lg mb-3 font-bold text-gray-700 select-none float-left'>{nft.price} &nbsp; <img className='float-right mt-0.5' src="/images/coins/ethereum.png" width="25px" alt="Ethereum"/></p>
                    </div>
                    <button className='w-full bg-gray-700 text-white font-bold py-2 px-12 rounded hover:scale-101 hover:bg-[#7366f0] duration-150' onClick={() => buyNft(nft)}>Buy</button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
    */