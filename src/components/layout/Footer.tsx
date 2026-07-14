"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { IconBrandFacebook, IconBrandX, IconBrandInstagram, IconBrandYoutube, IconBrandPinterest } from "@tabler/icons-react";

export default function Footer() {
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Subscribed Successfully");
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const getCurrentYear = () => new Date().getFullYear();

  return (
    <footer className="bg-[#e4e4e4] px-4 md:px-[60px] xl:px-[160px] py-12 md:py-[50px] xl:py-[30px] mt-[50px] flex flex-col gap-8 xl:gap-[100px] text-black">

      {/* Top Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-8 xl:gap-[50px] pt-8 xl:pt-[50px]">

        {/* Left Section */}
        <div className="flex flex-col gap-[10px] xl:gap-[20px]">
          <div className="mb-[20px]">
            <Image
              src="/logo/toyhourse-logo.png"
              alt="Logo"
              width={140}
              height={48}
              className="h-10 w-auto object-contain bg-transparent"
            />
          </div>
          <p className="text-[14px]">
            Chattogram, Bangladesh
          </p>
          <div className="flex flex-col mb-[10px]">
            <strong className="text-[14px] font-semibold">toyhourse@gmail.com</strong>
            <strong className="text-[14px] font-semibold">+880 1767-968446</strong>
          </div>
          <div className="flex gap-[30px] w-[240px]">
            <a
              href="https://facebook.com/toyhourse"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
            >
              <IconBrandFacebook size={20} stroke={1.5} />
            </a>

            <a
              href="https://x.com/toyhourse"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
            >
              <IconBrandX size={20} stroke={1.5} />
            </a>

            <a
              href="https://instagram.com/toyhourse"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
            >
              <IconBrandInstagram size={20} stroke={1.5} />
            </a>

            <a
              href="https://youtube.com/toyhourse"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
            >
              <IconBrandYoutube size={20} stroke={1.5} />
            </a>

            <a
              href="https://pinterest.com/toyhourse"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
            >
              <IconBrandPinterest size={20} stroke={1.5} />
            </a>
          </div>
        </div>

        {/* Company Links */}
        <div className="flex flex-col gap-[20px] xl:gap-[30px]">
          <h5 className="text-[18px] font-semibold uppercase">Company</h5>
          <div>
            <ul className="flex flex-col gap-[15px]" onClick={scrollToTop}>
              {["About Us", "Career", "Affiliates", "Blog", "Contact Us"].map((item) => (
                <li key={item}>
                  <Link
                    href={item.toLowerCase().includes("blog") ? "/blogs" : "#"}
                    className="text-black no-underline text-[14px] relative group inline-block"
                  >
                    {item}
                    <span className="absolute -bottom-[5px] left-0 w-0 h-[2px] bg-black transition-all duration-300 group-hover:w-[80%] delay-100"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Shop Links */}
        <div className="flex flex-col gap-[20px] xl:gap-[30px]">
          <h5 className="text-[18px] font-semibold uppercase">Shop</h5>
          <div>
            <ul className="flex flex-col gap-[15px]" onClick={scrollToTop}>
              {["New Arrivals", "Accessories", "Men", "Women", "Shop All"].map((item) => (
                <li key={item}>
                  <Link
                    href="/products"
                    className="text-black no-underline text-[14px] relative group inline-block"
                  >
                    {item}
                    <span className="absolute -bottom-[5px] left-0 w-0 h-[2px] bg-black transition-all duration-300 group-hover:w-[80%] delay-100"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Help Links */}
        <div className="flex flex-col gap-[20px] xl:gap-[30px]">
          <h5 className="text-[18px] font-semibold uppercase">Help</h5>
          <div>
            <ul className="flex flex-col gap-[15px]" onClick={scrollToTop}>
              {["Customer Service", "My Account", "Find a Store", "Legal & Privacy", "Contact", "Gift Card"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-black no-underline text-[14px] relative group inline-block"
                  >
                    {item}
                    <span className="absolute -bottom-[5px] left-0 w-0 h-[2px] bg-black transition-all duration-300 group-hover:w-[80%] delay-100"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Section (Subscribe) */}
        <div className="flex flex-col gap-[20px] xl:gap-[30px]">
          <h5 className="text-[18px] font-semibold uppercase">Subscribe</h5>
          <p className="text-[14px]">
            Be the first to get the latest news about trends, promotions, and much more!
          </p>

          <form onSubmit={handleSubscribe} className="flex -mt-[10px]">
            <input
              type="email"
              placeholder="Your email address"
              required
              className="w-full px-[20px] py-[19px] border-none outline-none text-[14px] bg-white text-black"
            />
            <button
              type="submit"
              className="px-[20px] py-[10px] bg-black text-white border-none cursor-pointer uppercase font-medium text-[14px] whitespace-nowrap"
            >
              Join
            </button>
          </form>

          <h6 className="text-[14px] font-medium m-0">Secure Payments</h6>
          <div className="h-[30px] w-full max-w-[250px] -mt-[10px]">
            <Image
              src="/images/paymentIcon.png"
              alt="Payments"
              width={250}
              height={30}
              className="w-full h-full object-contain object-left bg-transparent"
              unoptimized
            />
          </div>
        </div>
      </div>

      {/* Bottom Container */}
      <div className="flex flex-wrap justify-between items-center mt-5 border-t border-[#cfcdcd] pt-[30px] gap-5">
        <p className="text-[14px] m-0">
          © {getCurrentYear()} Toy Hourse. All Rights Reserved | Developed By{" "}
          <a
            href="#"
            target="_blank"
            rel="noreferrer"
            className="text-[#C22928] no-underline font-medium"
          >
            Rimon Dutta
          </a>{" "}

        </p>


      </div>

    </footer>
  );
}