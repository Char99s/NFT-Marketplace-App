import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from 'next/link'

  export default function SignUp() {
    const [username, setUsername] = useState('')
    const [formInput, updateFormInput] = useState({ username: '', email: '', password: '', confirmPassword: '' })
    const router = useRouter()
    useEffect(() => {
        const u = sessionStorage.getItem("username");
        setUsername(u)
        console.log("User in index is",u);
      }, [])


    async function SignUp(){
      var signUpText = document.getElementById('sign-up-text');
      var signUpSpinner = document.getElementById('sign-up-spinner');
      var errorDialogue = document.getElementById('error-dialogue');
      var usernameExistsError = document.getElementById('usernameExistsError');
      var emailExistsError = document.getElementById('emailExistsError');
      signUpText.style.display = 'none'
      signUpSpinner.style.display = 'block'
      errorDialogue.style.display = 'none'
      usernameExistsError.style.display = 'none'
      emailExistsError.style.display = 'none'

      let isValidUsername = await validateUsername();
      let isValidEmail = await validateEmail();
      let isValidPassword = await validatePassword();
      let isValidVerifyPassword = await validateVerifyPassword();
      console.log('username valid ? ', isValidUsername)
      console.log('email valid ? ', isValidEmail)
      console.log('password valid ? ', isValidPassword)
      console.log('verify password valid ? ', isValidVerifyPassword)

      if(isValidUsername==false || isValidEmail==false || isValidPassword==false || isValidVerifyPassword==false){
        errorDialogue.style.display = 'block'
        signUpText.style.display = 'block'
        signUpSpinner.style.display = 'none'
        return;
      }else{

      const response1 = await fetch("/api/user-exists", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({formInput}),
      });
    
    console.log('response status for username exists is', response1.status)

      if(response1.status==409){
        console.log('username exists')
        usernameExistsError.style.display = 'block'
        signUpText.style.display = 'block'
        signUpSpinner.style.display = 'none'
        return;
      }else{

        const response2 = await fetch("/api/email-exists", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({formInput}),
        });
      
      console.log('response status for username exists is', response2.status)
  
        if(response2.status==409){
          console.log('email exists')
          emailExistsError.style.display = 'block'
          signUpText.style.display = 'block'
          signUpSpinner.style.display = 'none'
          return;
        }else{

      const response = await fetch("/api/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({formInput}),
      });
      signUpText.style.display = 'block'
      signUpSpinner.style.display = 'none'
      router.push('/log-in');
    }
    }
    }
    }

      async function validateUsername(){
        formInput.username = document.getElementById('username').value;
        var usernameError = document.getElementById('usernameError');
        var usernameExistsError = document.getElementById('usernameExistsError');
        usernameExistsError.style.display = 'none'

        if(formInput.username.length>=4 && formInput.username.includes(" ")==false){
              usernameError.style.display = 'none'
              return true;
          }else{
            if(formInput.username.length!=0){
              usernameError.style.display = 'block'
          }
            return false;
        }
    }

    async function validateEmail(){
      var emailError = document.getElementById('emailError');
      formInput.email = document.getElementById('email').value;
      var emailExistsError = document.getElementById('emailExistsError');
      emailExistsError.style.display = 'none'

      if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formInput.email) || formInput.email.length==0)
      {
        emailError.style.display = 'none'
        if(formInput.email.length!=0){
          return true;
        }else{ return false; }
      }else{
        emailError.style.display = 'block'
        return false;
      }
    }

      async function validatePassword() {
        var passwordError = document.getElementById('passwordError');
        var passwordError2 = document.getElementById('passwordError2');
        var passwordError3 = document.getElementById('passwordError3');
        formInput.password = document.getElementById('password').value;
        var passw = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
        if(formInput.password.match(passw) || formInput.password.length == 0) 
          { 
          passwordError.style.display = 'none'
          passwordError2.style.display = 'none'
          passwordError3.style.display = 'none'
          if(formInput.password.length!=0){
            return true;
          }else{ return false; }
          }
        else
          { 
          passwordError.style.display = 'block'
          passwordError2.style.display = 'block'
          passwordError3.style.display = 'block'
          return false;
          }
      }

      async function validateVerifyPassword(){
        var verifyPasswordError = document.getElementById('verifyPasswordError');
        formInput.confirmPassword = document.getElementById('validate-password').value;

        if(formInput.confirmPassword == formInput.password || formInput.confirmPassword.length==0){
          verifyPasswordError.style.display = 'none'
          if(formInput.confirmPassword.length!=0){
            return true;
          }else{ return false; }
        }else{
          verifyPasswordError.style.display = 'block'
          return false;
        }
      }

/*
    async function validateEmail(){
        var email = document.getElementById('email').value;
        var emailError = document.getElementById('emailError');
        if(){
            usernameError.style.display = 'block'
        }else{
            
        }
        updateFormInput({...formInput, username: username})
    }
*/
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
                  <a className="mr-2"> <button className="rounded-xl hover:text-[#7366f0] hover:bg-white py-2 px-4 bg-[#7366f0] font-medium text-[#f9f9fa] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}} onClick={logOut}>Logout, {username}</button></a>
                  </Link>
                </div>
            )
        }
        {
          !username && (
            <div>
            <Link href="/log-in">
              <a className="mr-2"> <button className="rounded-xl hover:text-[#7366f0] hover:bg-white py-2 px-4 bg-[#7366f0] font-medium text-[#f9f9fa] duration-[300ms] transform-gpu subpixel-antialiased" style={{ fontFamily:'arial'}}>Log in</button></a>
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
                    <h1 style={{ fontFamily:'helvetica'}} className="mt-4 px-20 py-10 text-4xl text-center text-white select-none">Register</h1>
                    <div className="bg-red-700 rounded-xl w-full h-fit p-4 hidden" id="error-dialogue">
                      <h1 className="text-white">Please follow the instructions before submitting</h1>
                    </div>
                    <label htmlFor="username" className="text-white -mb-2 ml-1 mt-4">Username <a className="text-red-500">*</a></label>
                    <input
                        maxLength={16}
                        id="username"
                        style={{ fontFamily:'helvetica'}}
                        placeholder="Enter your username..."
                        className="mt-4 border-2 border-gray-200 rounded p-4 bg-gray-200 appearance-none w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-100"
                        onChange={validateUsername}
                    />
                    <label id="usernameError" className="text-red-500 text-sm hidden">4+ characters, no spaces.</label>
                    <label id="usernameExistsError" className="text-red-500 text-sm hidden">Username already exists.</label>
                    
                    <label htmlFor="email" className="text-white -mb-2 ml-1 mt-4">Email <a className="text-red-500">*</a></label>
                    <input
                        id="email"
                        style={{ fontFamily:'helvetica'}}
                        type="email"
                        placeholder="Enter your email..."
                        className="mt-4 border-2 border-gray-200 rounded p-4 bg-gray-200 appearance-none w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-100"
                        onChange={validateEmail}
                    />
                    <label id="emailError" className="text-red-500 text-sm hidden">Please enter a valid email.</label>
                    <label id="emailExistsError" className="text-red-500 text-sm hidden">Email already exists.</label>
                    <label htmlFor="password" className="text-white -mb-2 ml-1 mt-4">Password <a className="text-red-500">*</a></label>
                    <input
                        maxLength={15}
                        id="password"
                        style={{ fontFamily:'helvetica'}}
                        type="password"
                        placeholder="Enter your password..."
                        className="mt-4 border-2 border-gray-200 rounded p-4 bg-gray-200 appearance-none w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-100"
                        onChange={validatePassword}
                    />
                    <label id="passwordError" className="text-red-500 text-sm hidden">Your password should contain:</label>
                    <label id="passwordError2" className="text-red-500 text-sm hidden">6-15 characters with 1 uppercase letter,</label>
                    <label id="passwordError3" className="text-red-500 text-sm hidden">1 lowercase letter and 1 digit.</label>
                    <label htmlFor="verify password" className="text-white -mb-2 ml-1 mt-4">Confirm Password <a className="text-red-500">*</a></label>
                    <input
                        maxLength={15}
                        id="validate-password"
                        style={{ fontFamily:'helvetica'}}
                        type="password"
                        placeholder="Confirm your password..."
                        className="mt-4 border-2 border-gray-200 rounded p-4 bg-gray-200 appearance-none w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-100"
                        onChange={validateVerifyPassword}
                    />
                    <label id="verifyPasswordError" className="text-red-500 text-sm hidden">Passwords don&apos;t match.</label>
                    <button 
                    id="registerBtn"
                    style={{ fontFamily:'helvetica'}}
                    className="w-48 mt-8 ml-auto mr-auto border-gray-200 rounded p-4 bg-zinc-600 text-white appearance-none py-2 px-4 hover:scale-105 hover:bg-[#7366f0] duration-150"
                    onClick={SignUp}
                    >
                        <p id='sign-up-text'>Sign Up</p>
                        <img id="sign-up-spinner" src="/images/spinner-loading.gif" width="30px" className="md:ml-auto md:mr-auto hidden"/>
                    </button>
                </div>
            </div>
            </div>
            </div>
    )

}