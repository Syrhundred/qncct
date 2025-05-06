import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const Navbar = () => {
  const currentPath = usePathname();

  const navbarLinks = [
    { id: 0, altIcon: "altHome", icon: "home", text: "Home", link: "/" },
    {
      id: 1,
      altIcon: "altCalendar",
      icon: "calendar",
      text: "Schedule",
      link: "/schedule",
    },
    {
      id: 2,
      altIcon: "",
      icon: "add",
      text: "",
      link: "/create-event",
      isCenter: true,
    },
    {
      id: 3,
      altIcon: "altMessages",
      icon: "messages-3",
      text: "Chats",
      link: "/chat",
    },
    {
      id: 4,
      altIcon: "altUser",
      icon: "user",
      text: "Profile",
      link: "/profile",
    },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50">
      <div className="w-full h-28">
        <div className="bg-white border-t h-20 flex items-center w-full fixed bottom-0">
          <ul className="flex items-center justify-evenly w-full">
            {navbarLinks.map(({ id, altIcon, icon, text, link, isCenter }) => (
              <li key={id} className={clsx(isCenter && "pb-16")}>
                <Link href={link}>
                  <button className="flex flex-col items-center transition-all duration-300">
                    {isCenter ? (
                      <div className="rounded-full p-3 border-2 border-white">
                        <div className="p-3 rounded-full bg-gradient">
                          <Image
                            width={24}
                            height={24}
                            src={`/assets/img/navbar/${icon}.svg`}
                            alt={icon}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="flex flex-col items-center transition-all duration-300">
                        {currentPath === link ? (
                          <Image
                            width={24}
                            height={24}
                            src={`/assets/img/navbar/${altIcon}.svg`}
                            alt={icon}
                          />
                        ) : (
                          <Image
                            width={24}
                            height={24}
                            src={`/assets/img/navbar/${icon}.svg`}
                            alt={icon}
                          />
                        )}

                        <p
                          className={clsx(
                            currentPath === link
                              ? "flex text-xs bg-gradient bg-clip-text text-transparent transition-all duration-300"
                              : "hidden",
                          )}
                        >
                          {text}
                        </p>
                      </span>
                    )}
                  </button>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
