'use client';

import Image from 'next/image';
import elmLogo from '@/assets/elm.png';
import arabLogo from '@/assets/arabseaco_logo.jpeg';
import logo from '@/assets/logo_with_glow.svg';
import leftGlow from '@/assets/lower_left_glow.png';
import rightGlow from '@/assets/upper_right_glow.png';
import getMessage from '@/actions/get-message';
import { useState } from 'react';

export default function Home() {
  const [selectedCompany, setSelectedCompany] = useState('');
  return (
    <section className="grid place-items-center min-h-screen">
      <Image
        src={leftGlow}
        alt="elm logo"
        className="absolute bottom-0 left-0 -z-10"
      />
      <Image
        src={rightGlow}
        alt="elm logo"
        className="absolute top-0 right-0 -z-10"
      />
      <div className="grid gap-4 ">
        <h1 className="grid place-items-center">
          <Image src={logo} alt="elm logo" className="" />
        </h1>
        {!selectedCompany ? (
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedCompany('ELM')}
              className="shadow-lg hover:shadow-md transition-all rounded-full p-5 bg-white"
            >
              <Image
                src={elmLogo}
                alt="elm logo"
                className="w-20 aspect-square"
              />
            </button>
            <button className="shadow-lg hover:shadow-md transition-all rounded-full p-5 bg-white">
              <Image
                src={arabLogo}
                alt="elm logo"
                className="w-20 aspect-square"
              />
            </button>
          </div>
        ) : (
          <div className="lg:w-3/4 max-w-[500px] lg:min-w-[300px] lg:mx-auto bg-white rounded-full shadow-md flex w-full items-center p-2 ">
            <input
              placeholder="ابحث"
              type="text"
              className="outline-none flex-1 px-2"
            />
            <button onClick={() => getMessage()} className="px-5 h-8 bg-black text-white rounded-full">
              بحث
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
