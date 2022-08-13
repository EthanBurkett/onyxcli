import Link from "next/link";
import { FaDiscord } from "react-icons/fa";

export default function Navbar(): JSX.Element {
  return (
    <>
      <div className="fixed m-0 w-screen h-20 bg-zinc-800 flex flex-row justify-between items-center">
        <div className="flex h-20 p-5 justify-between items-center flex-row">
          <h1 className="text-4xl text-white font-black">My Bot</h1>
        </div>
        <div className="flex flex-row gap-12">
          <Navlink text="Home" link="/" />
          <Navlink text="About" link="/about" />
          <Navlink text="Invite" link="/invite" />
        </div>
        <Link href={"https://localhost:3001/api/auth/discord"}>
          <div className="cursor-pointer  h-12 col-start-2 mr-10 flex gap-4 raleway p-3 border-2 border-white bg-transparent text-white transition-all rounded-md  hover:bg-[#5865F2] hover:border-[#5865F2] justify-center items-center">
            <FaDiscord size={24} />
            <button>Login with Discord</button>
          </div>
        </Link>
      </div>
    </>
  );
}

function Navlink({ text, link }: { text: string; link: string }): JSX.Element {
  return (
    <Link href={link}>
      <li
        className="text-3xl text-zinc-300 transition-all hover:text-zinc-200 cursor-pointer"
        key={text}
      >
        {text}
      </li>
    </Link>
  );
}
