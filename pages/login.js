import React, { useState, useEffect } from "react";
import { getProviders, signIn } from "next-auth/react";

function Login({ providers }) {
  return (
    <div className="flex flex-col bg-black h-screen w-full items-center justify-center">
      <img
        className="w-52 mb-5"
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/768px-Spotify_logo_without_text.svg.png"
        alt=""
      />
      {Object.values(providers).map((provider, key) => (
        <div key={key}>
          <button
            className="bg-[#18D860] text-white p-5 rounded-full"
            onClick={() => signIn(provider.id, { callbackUrl: "/" })}
          >
            Login with {provider.name}
          </button>
        </div>
      ))}
    </div>
  );
}

export default Login;
export async function getServerSideProps(context) {
  const providers = await getProviders();

  return {
    props: { providers },
  };
}
