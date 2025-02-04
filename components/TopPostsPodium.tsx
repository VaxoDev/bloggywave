"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import type { BlogPost } from "../types/blog"

interface TopPostsPodiumProps {
  mostLiked: BlogPost
  mostViewed: BlogPost
  mostCommented: BlogPost
}

export function TopPostsPodium({ mostLiked, mostViewed, mostCommented }: TopPostsPodiumProps) {
  const [activeMobileItem, setActiveMobileItem] = useState<number | null>(null)
  const podiumItems = [
    { place: 2, title: "Most Viewed", data: mostViewed, key: "views" },
    { place: 1, title: "Most Liked", data: mostLiked, key: "likes" },
    { place: 3, title: "Most Commented", data: mostCommented, key: "comments" },
  ]
  
  return (
    // CONTAINER WIDTH: Modify max-w-6xl to change overall container width
    <div className="relative w-full max-w-6xl mx-auto px-4 h-[500px] md:h-[400px]">
      {/* GRID CONTAINER: Modify gap-4 md:gap-8 to adjust spacing between podium items */}
      <div className="absolute bottom-0 left-0 right-0 grid grid-cols-3 gap-4 md:gap-8 h-[250px] md:h-[200px] items-end justify-center">
        {podiumItems.map((item, index) => (
          // PODIUM ITEM HEIGHT: Modify these classes to change item heights
          <div
            key={item.place}
            className={`
              group relative w-full transition-all duration-300
              ${
                item.place === 1
                  ? "h-[200px] md:h-[160px]"
                  : item.place === 2
                    ? "h-[160px] md:h-[120px]"
                    : "h-[120px] md:h-[80px]"
              }
            `}
          >
            <div className="absolute bottom-0 w-full h-full bg-navy-blue border-t-2 border-l-2 border-r-2 border-white/20 rounded-t-xl">
              <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-white">
                {item.place}
              </div>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={activeMobileItem === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.3 }}
                className={`
                  absolute bottom-full left-0 w-full z-10 
                  cursor-pointer md:cursor-default
                  transform transition-all duration-300 ease-in-out
                  ${
                    item.place === 1
                      ? "left-[-50px] md:left-0"
                      : item.place === 3
                        ? "left-[-150px] md:left-[-150px]"
                        : "left-0"
                  }
                  ${activeMobileItem === index ? "translate-y-[-20px]" : ""}
                `}
                onClick={() => setActiveMobileItem(activeMobileItem === index ? null : index)}
              >
                {/* ITEM DETAILS WIDTH: 
                  - Modify w-[250px] to change mobile width 
                  - Modify md:w-[500px] to change desktop width 
                  - max-w-[90vw] ensures it doesn't overflow the screen 
                */}
                <div
                  className="
                  p-4 border-2 rounded-xl 
                  border-white/20 bg-navy-blue/90 
                  w-[250px] md:w-[400px] max-w-[90vw]  // Reduced desktop width
                  mx-auto relative
                  shadow-lg hover:shadow-xl
                  transition-all duration-300 ease-in-out
                  flex-shrink-0
                "
                >
                  <h3 className="text-lg font-semibold mb-2 text-white">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.key === "comments"
                      ? `Comments: ${item.data.comments.length}`
                      : `${item.key.charAt(0).toUpperCase() + item.key.slice(1)}: ${item.data[item.key as keyof BlogPost]}`}
                  </p>
                  <h4 className="font-medium mb-1 text-white text-xl truncate">{item.data.title}</h4>
                  <p className="text-sm text-muted-foreground truncate">by {item.data.authorName}</p>
                </div>
              </motion.div>
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        @media (hover: hover) and (pointer: fine) {
          .group:hover > div > div > div {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

