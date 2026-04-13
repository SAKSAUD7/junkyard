import { motion } from 'framer-motion';

const AnimatedButton = ({ className, children, ...props }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={className}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default AnimatedButton;
