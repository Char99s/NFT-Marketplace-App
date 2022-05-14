import '../styles/globals.css'
import Link from 'next/link'
import '../styles/app.css'
import { useRouter } from "next/router";
import { useState,useEffect } from "react";

function MyApp({ Component, pageProps }) {
  const [username, setUsername] = useState('')
  const router = useRouter();
  useEffect(() => {
    setUsername(sessionStorage.getItem("username"))
    console.log("navbar refreshed with user:",username)
  }, [])

  async function logOut(){
    sessionStorage.setItem("username", '')
    const u = sessionStorage.getItem("username")
    console.log("session storage contains after logout: ", u )
    setUsername('')
    console.log("use state username variable contains ", username )
    router.push('/')
  }

  return(
    <div>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>

      <Component {...pageProps}/>

      <footer className='footer'>
        <div className='footer-container'>
          <div className='logo-container'>
            <img src="/images/logo.png" width="250px" style={{float:'left', marginTop:'1.5rem'}}/>
          </div>
          <div className='copyright-container'>
            <p className='select-none' style={{ fontFamily:'arial', marginBottom:'2px', color:'#EDEDED'}}>© Copyright 2022 - Galactic NFT by <span style={{ color:'#7366f0' }}> EDDY&apos;S GROUP</span></p>
          </div>
          <div className='social-container'>
          <a href="#" className="fa fa-facebook"></a>
          <a href="#" className="fa fa-twitter"></a>
          <a href="#" className="fa fa-instagram"></a>
          </div>

        </div>
      </footer>
    </div>
  )
}

export default MyApp


/*


        <nav classNameName="border-b p-6">
      <p classNameName="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Galactic NFT</p>

      <div classNameName="container flex flex-wrap justify-between items-center mx-auto">
        <Link href="/">
        <a classNameName="block py-2 pr-4 pl-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 dark:text-white">
          Home
        </a>
        </Link>

        <Link href="/create-item">
        <a classNameName="mr-6 text-pink-500">
          Sell NFT
        </a>
        </Link>

        <Link href="/my-assets">
        <a classNameName="mr-6 text-pink-500">
          History
        </a>
        </Link>

        <Link href="/creator-dashboard">
        <a classNameName="mr-6 text-pink-500">
          Creator Dashboard
        </a>
        </Link>

      </div>
      </nav>

*/