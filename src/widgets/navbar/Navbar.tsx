import Image from "next/image";

function Navbar() {
  return (
    <nav className="fixed bottom-0 w-full">
      <div className="w-full h-28">
        <div className="bg-white h-20 flex items-center w-full fixed bottom-0">
          <ul className="flex items-center justify-evenly w-full">
            <li>
              <button>
                <Image
                  width={24}
                  height={24}
                  className=""
                  src="/assets/img/navbar/home.svg"
                  alt="home"
                />
              </button>
            </li>
            <li>
              <button>
                <Image
                  width={24}
                  height={24}
                  className=""
                  src="/assets/img/navbar/calendar.svg"
                  alt="calendar"
                />
              </button>
            </li>
            <li className="pb-16">
              <button>
                <div className="rounded-[50%] p-3 border-2 border-white">
                  <div className="p-3 rounded-[50%] bg-gradient">
                    <Image
                      width={24}
                      height={24}
                      src="/assets/img/navbar/add.svg"
                      alt="shop"
                    />
                  </div>
                </div>
              </button>
            </li>
            <li>
              <button>
                <Image
                  width={24}
                  height={24}
                  className=""
                  src="/assets/img/navbar/messages-3.svg"
                  alt="messages"
                />
              </button>
            </li>
            <li>
              <button>
                <Image
                  width={24}
                  height={24}
                  src="/assets/img/navbar/user.svg"
                  alt="user"
                />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
