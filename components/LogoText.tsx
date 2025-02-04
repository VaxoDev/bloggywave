import { motion } from "framer-motion"

interface LogoTextProps {
  variant: "default" | "minimalist" | "stylized"
}

export function LogoText({ variant }: LogoTextProps) {
  switch (variant) {
    case "minimalist":
      return (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-bold text-xl"
        >
          BW
        </motion.div>
      )
    case "stylized":
      return (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-bold text-xl italic"
        >
          B<span className="text-primary">Wave</span>
        </motion.div>
      )
    default:
      return (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-bold text-xl"
        >
          BloggyWave
        </motion.div>
      )
  }
}

