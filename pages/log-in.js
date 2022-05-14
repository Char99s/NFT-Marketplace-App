import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from 'next/link'

  export default function LogIn() {
    const [username, setUsername] = useState('')
    const [formInput, updateFormInput] = useState({email: '', password: ''})
    const router = useRouter()
    useEffect(() => {
        const u = sessionStorage.getItem("username");
        setUsername(u)
        console.log("User in index is",u);
      }, [])

    async function LogIn(){

        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({formInput}),
        });
        console.log(response.status)

        if(response.status==200){
            const obj = await response.json()
            console.log(obj.user.username)
            sessionStorage.setItem("username", obj.user.username);
            const u = sessionStorage.getItem("username");
            console.log('session storage contains', u);
            router.push('/')
        }else{
            var loginError = document.getElementById('loginError');
            loginError.style.display = 'block'
        }
    }

    //onChange={ e => updateFormInput({...formInput, username: e.target.value})}

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
                    <h1 style={{ fontFamily:'helvetica'}} className="mt-4 px-20 py-10 text-4xl text-center text-white select-none">Log In</h1>

                    <label htmlFor="email" className="text-white -mb-2 ml-1 mt-4">Email <a className="text-red-500">*</a></label>
                    <input
                        id="email"
                        style={{ fontFamily:'helvetica'}}
                        type="email"
                        placeholder="Enter your email..."
                        className="mt-4 border-2 border-gray-200 rounded p-4 bg-gray-200 appearance-none w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-100"
                        onChange={e => updateFormInput({...formInput, email: e.target.value})}
                    />
                    <label id="emailError" className="text-red-500 text-sm hidden">Enter valid email</label>
                    <label htmlFor="password" className="text-white -mb-2 ml-1 mt-4">Password <a className="text-red-500">*</a></label>
                    <input
                        style={{ fontFamily:'helvetica'}}
                        type="password"
                        placeholder="Enter your password..."
                        className="mt-4 border-2 border-gray-200 rounded p-4 bg-gray-200 appearance-none w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-100"
                        onChange={e => updateFormInput({...formInput, password: e.target.value})}
                    />
                    <label id="usernameValidation" className="text-red-500 text-sm hidden">8+ Characters</label>
                    <label id="loginError" className="text-red-500 mt-2 text-sm hidden">Invalid username/password</label>
                    <button 
                    style={{ fontFamily:'helvetica'}}
                    className="w-48 mt-8 ml-auto mr-auto border-gray-200 rounded p-4 bg-zinc-600 text-white appearance-none py-2 px-4 hover:scale-105 hover:bg-[#7366f0] duration-150"
                    onClick={LogIn}
                    >
                        Log In
                    </button>
                </div>
            </div>
            </div>
            </div>
    )

}